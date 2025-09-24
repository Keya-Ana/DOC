import sqlite3
from flask import Flask, render_template, request, redirect, url_for, session, flash, jsonify
from werkzeug.security import check_password_hash, generate_password_hash

# Initialize Flask app at the top so it's defined before any route decorators
app = Flask(__name__)
app.secret_key = "your_secret_key"  

def create_tables():
    conn = sqlite3.connect("med_reminder.db")
    cursor = conn.cursor()
    # Staff table
    cursor.execute('''CREATE TABLE IF NOT EXISTS staff (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT NOT NULL,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT NOT NULL,
        hire_date TEXT NOT NULL,
        photo TEXT,
        role_info TEXT NOT NULL,
        staff_id INTEGER,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )''')
    # Users table
    cursor.execute('''CREATE TABLE IF NOT EXISTS users (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        username TEXT UNIQUE NOT NULL,
                        email TEXT UNIQUE NOT NULL,
                        password TEXT NOT NULL)''')
    # Patients table with all required columns
    cursor.execute('''CREATE TABLE IF NOT EXISTS patients (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        dob TEXT NOT NULL,
        gender TEXT NOT NULL,
        address TEXT NOT NULL,
        phone TEXT NOT NULL,
        email TEXT,
        patient_type TEXT NOT NULL,
        admission_date TEXT NOT NULL,
        primary_condition TEXT NOT NULL,
        condition_severity TEXT NOT NULL,
        current_status TEXT NOT NULL,
        medications TEXT,
        notes TEXT,
        photo TEXT,
        staff_id INTEGER,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )''')
    # Reminders table for notifications
    cursor.execute('''CREATE TABLE IF NOT EXISTS reminders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        patient_name TEXT NOT NULL,
        medication TEXT NOT NULL,
        reminder_time TEXT NOT NULL,
        dosage TEXT,
        sound_type TEXT,
        staff_id INTEGER,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )''')
    conn.commit()
    conn.close()


if __name__ == "__main__":
    create_tables()


# API endpoint to add and get staff, like patients
@app.route('/api/staff', methods=['GET', 'POST'])
def api_staff():
    if "user_id" not in session:
        return jsonify({"error": "Not authorized"}), 401
    if request.method == "POST":
        import sys
        data = request.get_json()
        staff_id = session["user_id"]
        columns = [
            "type", "first_name", "last_name", "email", "phone", "hire_date", "photo", "role_info", "staff_id"
        ]
        values = [
            data.get("type"), data.get("first_name"), data.get("last_name"), data.get("email"),
            data.get("phone"), data.get("hire_date"), data.get("photo"), data.get("role_info"), staff_id
        ]
        print("[Add Staff] Received data:", data, file=sys.stderr)
        print("[Add Staff] Insert values:", values, file=sys.stderr)
        try:
            conn = get_db_connection()
            conn.execute(f"INSERT INTO staff ({','.join(columns)}) VALUES ({','.join(['?' for _ in columns])})", values)
            conn.commit()
            conn.close()
            print("[Add Staff] Insert successful", file=sys.stderr)
            return jsonify({"success": True}), 201
        except Exception as e:
            print(f"[Add Staff] Error: {e}", file=sys.stderr)
            return jsonify({"error": str(e)}), 500
    else:
        conn = get_db_connection()
        staff = conn.execute("SELECT * FROM staff WHERE staff_id = ?", (session["user_id"],)).fetchall()
        conn.close()
        return jsonify([dict(s) for s in staff])

@app.route('/api/notifications', methods=['GET', 'POST'])
def api_notifications():
    if request.method == 'POST':
        if "user_id" not in session:
            return jsonify({'error': 'Not authorized'}), 401
        data = request.get_json()
        staff_id = session["user_id"]
        try:
            conn = get_db_connection()
            conn.execute(
                '''INSERT INTO reminders (patient_name, medication, reminder_time, dosage, sound_type, staff_id)
                   VALUES (?, ?, ?, ?, ?, ?)''',
                (
                    data.get('patientName'),
                    data.get('medication'),
                    data.get('reminderTime'),
                    data.get('dosage'),
                    data.get('soundType'),
                    staff_id
                )
            )
            conn.commit()
            conn.close()
            return jsonify({'success': True}), 201
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    else:
        try:
            conn = get_db_connection()
            reminders = []
            try:
                reminders = conn.execute('SELECT * FROM reminders ORDER BY id DESC LIMIT 10').fetchall()
                reminders = [dict(r) for r in reminders]
            except Exception:
                reminders = []
            conn.close()
            return jsonify(reminders)
        except Exception as e:
            return jsonify({'error': str(e)}), 500

def get_db_connection():
    conn = sqlite3.connect("med_reminder.db")
    conn.row_factory = sqlite3.Row  # To get dict-like results
    return conn

# Login Route
@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        # Check if this is a login or signup request
        if 'signup-name' in request.form:
            # Handle signup
            username = request.form["signup-name"]
            email = request.form["signup-email"]
            password = request.form["signup-password"]
            confirm_password = request.form["signup-confirm"]
            
            if password != confirm_password:
                flash("Passwords don't match!", "danger")
                return redirect(url_for("login"))
            
            hashed_password = generate_password_hash(password)
            
            conn = get_db_connection()
            try:
                conn.execute("INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
                             (username, email, hashed_password))
                conn.commit()
                flash("Registration successful! Please log in.", "success")
                return redirect(url_for("login"))
            except sqlite3.IntegrityError:
                flash("Email already exists.", "danger")
                return redirect(url_for("login"))
            finally:
                conn.close()
        else:
            # Handle login
            email = request.form["email"]
            password = request.form["password"]
            
            conn = get_db_connection()
            user = conn.execute('SELECT * FROM users WHERE email = ?', (email,)).fetchone()
            conn.close()
            
            if user and check_password_hash(user["password"], password):
                session["user_id"] = user["id"]
                session["email"] = user["email"]
                return redirect(url_for("dashboard"))
            else:
                flash("Invalid email or password.", "danger")
                return redirect(url_for("login"))
    
    return render_template("login1.html")

@app.route('/drug-detail')
def drug_detail():
    drug = request.args.get('drug', '')
    return render_template('drug_detail.html', drug=drug)

# Fetch Drug Data
# Fetch Drug Data
@app.route('/api/drug-info', methods=['GET'])
def get_drug_info():
    import requests
    from flask import request, jsonify

    drug_name = request.args.get('name')
    if not drug_name:
        return jsonify({'error': 'No drug name provided'}), 400

    # Step 1: Get RXCUI (RxNorm ID)
    try:
        rxcui_resp = requests.get(
            f'https://rxnav.nlm.nih.gov/REST/rxcui.json?name={drug_name}', timeout=10
        )
        rxcui_resp.raise_for_status()
        rxcui_data = rxcui_resp.json()
        rxcui = rxcui_data.get('idGroup', {}).get('rxnormId', [None])[0]
        if not rxcui:
            return jsonify({'error': 'Drug not found in RxNorm'}), 404
    except (requests.RequestException, ValueError) as e:
        print("Error fetching RXCUI:", e)
        return jsonify({'error': 'Failed to fetch RXCUI'}), 502

    # Step 2: Get interaction data
    interaction_list = []
    try:
        interactions_resp = requests.get(
            f'https://rxnav.nlm.nih.gov/REST/interaction/interaction.json?rxcui={rxcui}', timeout=10
        )
        interactions_resp.raise_for_status()
        interactions_data = interactions_resp.json()
        for group in interactions_data.get('interactionTypeGroup', []):
            for interaction_type in group.get('interactionType', []):
                for pair in interaction_type.get('interactionPair', []):
                    interaction_list.append({
                        'interacts_with': pair['interactionConcept'][1]['minConceptItem']['name'],
                        'description': pair['description']
                    })
    except requests.HTTPError as e:
        if interactions_resp.status_code == 404:
            print(f"No interactions found for rxcui={rxcui}")
        else:
            print("HTTP error during interactions fetch:", e)
        # Not a blocker, allow continuing with empty interaction list
    except (requests.RequestException, ValueError) as e:
        print("Error fetching interactions:", e)
        return jsonify({'error': 'Failed to fetch drug interactions'}), 502

    # Step 3: Get drug label data from OpenFDA
    try:
        fda_resp = requests.get(
            f'https://api.fda.gov/drug/label.json?search={drug_name}&limit=1', timeout=10
        )
        fda_resp.raise_for_status()
        fda_data = fda_resp.json()
        if not fda_data.get('results'):
            return jsonify({'error': 'Drug label not found'}), 404

        label = fda_data['results'][0]
        brand_name = label.get('openfda', {}).get('brand_name', ["Unknown"])[0]
        manufacturer = label.get('openfda', {}).get('manufacturer_name', ["Unknown"])[0]
        usage = label.get('indications_and_usage', ["N/A"])[0]
        side_effects = label.get('adverse_reactions', ["N/A"])[0]
        warnings = label.get('warnings', ["N/A"])[0]
        # Try to get directions (dosage and administration)
        directions = label.get('dosage_and_administration', [None])[0]
        if not directions or directions.strip() == '':
            # Fallback to 'how_supplied' or 'information_for_patients' if available
            directions = label.get('information_for_patients', [None])[0] or label.get('how_supplied', [None])[0] or "N/A"
    except (requests.RequestException, ValueError) as e:
        print("Error fetching FDA data:", e)
        return jsonify({'error': 'Failed to fetch drug label data'}), 502

    return jsonify({
        'brand_name': brand_name,
        'manufacturer': manufacturer,
        'usage': usage,
        'directions': directions,
        'side_effects': side_effects,
        'warnings': warnings,
        'interactions': interaction_list  # This may be an empty list if not found
    })


# Logout Route
@app.route("/logout")
def logout():
    session.clear()
    flash("You have been logged out.", "info")
    return redirect(url_for("login"))

from functools import wraps
from flask import make_response

def nocache(view):
    @wraps(view)
    def no_cache(*args, **kwargs):
        response = make_response(view(*args, **kwargs))
        response.headers["Cache-Control"] = "no-store, no-cache, must-revalidate, post-check=0, pre-check=0, max-age=0"
        response.headers["Pragma"] = "no-cache"
        response.headers["Expires"] = "-1"
        return response
    return no_cache



# Helper: get user info by id
def get_user_info(user_id):
    conn = get_db_connection()
    user = conn.execute('SELECT * FROM users WHERE id = ?', (user_id,)).fetchone()
    conn.close()
    return user

# Profile picture assignment (simple: random avatar based on user id)
def get_profile_pic(user):
    # If user has a photo column, use it; else, generate avatar
    if user and 'photo' in user and user['photo']:
        return user['photo']
    # Use randomuser.me API for demo, based on user id for consistency
    if user and 'id' in user:
        avatar_id = int(user['id']) % 100
        gender = 'men' if int(user['id']) % 2 == 0 else 'women'
        return f'https://randomuser.me/api/portraits/{gender}/{avatar_id}.jpg'
    # fallback
    return 'https://randomuser.me/api/portraits/lego/1.jpg'

# Protected Dashboard Route
@app.route("/dashboard")
@nocache
def dashboard():
    if "user_id" not in session:
        flash("Please log in first.", "warning")
        return redirect(url_for("login"))
    user = get_user_info(session["user_id"])
    user_name = user["username"] if user else "User"
    user_profile_pic = get_profile_pic(user)
    return render_template(
        "dashboard.html",
        email=session["email"],
        user_name=user_name,
        user_profile_pic=user_profile_pic
    )

@app.route('/patients')
def patients():
    if "user_id" not in session:
        flash("Please log in first.", "warning")
        return redirect(url_for("login"))
    return render_template('patients.html', staff_id=session["user_id"])


  # Looks in `templates/patients.html`
from flask import jsonify

@app.route("/api/patients", methods=["GET", "POST"])
def api_patients():
    if "user_id" not in session:
        return jsonify({"error": "Not authorized"}), 401
    if request.method == "POST":
        import sys
        data = request.get_json()
        staff_id = session["user_id"]
        columns = [
            "first_name", "last_name", "dob", "gender", "address", "phone", "email",
            "patient_type", "admission_date", "primary_condition", "condition_severity",
            "current_status", "medications", "notes", "photo", "staff_id"
        ]
        values = [
            data.get("first_name"), data.get("last_name"), data.get("dob"), data.get("gender"),
            data.get("address"), data.get("phone"), data.get("email"), data.get("patient_type"),
            data.get("admission_date"), data.get("primary_condition"), data.get("condition_severity"),
            data.get("current_status"), data.get("medications"), data.get("notes"), data.get("photo"), staff_id
        ]
        print("[Add Patient] Received data:", data, file=sys.stderr)
        print("[Add Patient] Insert values:", values, file=sys.stderr)
        try:
            conn = get_db_connection()
            conn.execute(f"INSERT INTO patients ({','.join(columns)}) VALUES ({','.join(['?' for _ in columns])})", values)
            conn.commit()
            conn.close()
            print("[Add Patient] Insert successful", file=sys.stderr)
            return jsonify({"success": True}), 201
        except Exception as e:
            print(f"[Add Patient] Error: {e}", file=sys.stderr)
            return jsonify({"error": str(e)}), 500
    else:
        conn = get_db_connection()
        patients = conn.execute("SELECT * FROM patients WHERE staff_id = ?", (session["user_id"],)).fetchall()
        conn.close()
        return jsonify([dict(p) for p in patients])


@app.route('/schedule')
def schedule():
    return render_template('schedule-App.html') 
 
@app.route('/medreport')
def medReport():
    return render_template('Med-Report.html')  

@app.route('/notification')
def notification():
    return render_template('notification.html') 
 
@app.route('/analytics')
def analytics():
    return render_template('analysis.html')
  
@app.route('/chat')
def chat():
    return render_template('chat.html')  

@app.route('/staff')
def staff():
    return render_template('staff.html')  

if __name__ == "__main__":
 app.run(debug=True)