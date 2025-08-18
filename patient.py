import sqlite3
from flask import Flask, request, jsonify


# Database connection helper (add if not already present)
def get_db_connection():
    conn = sqlite3.connect('hospital.db')  # Adjust path if needed
    conn.row_factory = sqlite3.Row
    return conn

# Initialize patients table
def init_patients_table():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS patients (
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
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    conn.commit()
    conn.close()

# Add to your app initialization (call this when your app starts)
init_patients_table()

app = Flask(__name__)
app.secret_key = "your_secret_key"

# API Routes for Patients (add to existing Flask app)
@app.route('/api/patients', methods=['GET'])
def get_all_patients():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM patients ORDER BY admission_date DESC')
    patients = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return jsonify(patients)

@app.route('/api/patients/<int:id>', methods=['GET'])
def get_patient(id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM patients WHERE id = ?', (id,))
    patient = cursor.fetchone()
    conn.close()
    return jsonify(dict(patient)) if patient else ('', 404)

@app.route('/api/patients', methods=['POST'])
def add_patient():
    data = request.get_json()
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO patients (
            first_name, last_name, dob, gender, address, phone, email,
            patient_type, admission_date, primary_condition, condition_severity,
            current_status, medications, notes, photo
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        data['first_name'], data['last_name'], data['dob'], data['gender'],
        data['address'], data['phone'], data.get('email'), data['patient_type'],
        data['admission_date'], data['primary_condition'], data['condition_severity'],
        data['current_status'], data.get('medications'), data.get('notes'), data.get('photo')
    ))
    conn.commit()
    patient_id = cursor.lastrowid
    conn.close()
    return jsonify({'id': patient_id}), 201

@app.route('/api/patients/<int:id>', methods=['DELETE'])
def delete_patient(id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('DELETE FROM patients WHERE id = ?', (id,))
    conn.commit()
    conn.close()
    return ('', 204)

@app.route('/api/patients/count', methods=['GET'])
def get_patient_count():
    patient_type = request.args.get('type')
    conn = get_db_connection()
    cursor = conn.cursor()
    if patient_type:
        cursor.execute('SELECT COUNT(*) FROM patients WHERE patient_type = ?', (patient_type,))
    else:
        cursor.execute('SELECT COUNT(*) FROM patients')
    count = cursor.fetchone()[0]
    conn.close()
    return jsonify({'count': count})

@app.route('/api/patients/count/status', methods=['GET'])
def get_patient_count_by_status():
    status = request.args.get('status')
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT COUNT(*) FROM patients WHERE current_status = ?', (status,))
    count = cursor.fetchone()[0]
    conn.close()
    return jsonify({'count': count})

@app.route('/api/patients/recent', methods=['GET'])
def get_recent_patients():
    limit = int(request.args.get('limit', 5))
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM patients ORDER BY admission_date DESC LIMIT ?', (limit,))
    patients = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return jsonify(patients)