import sqlite3
from flask import Flask, render_template, request, redirect, url_for, session, flash
import sqlite3
from werkzeug.security import check_password_hash, generate_password_hash
 
def create_tables():
    conn = sqlite3.connect("med_reminder.db")
    cursor = conn.cursor()

    cursor.execute('''CREATE TABLE IF NOT EXISTS users (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        username TEXT UNIQUE NOT NULL,
                        email TEXT UNIQUE NOT NULL,
                        password TEXT NOT NULL)''')

    conn.commit()
    conn.close()

if __name__ == "__main__":
    create_tables()


app = Flask(__name__)
app.secret_key = "your_secret_key"  

def get_db_connection():
    conn = sqlite3.connect("med_reminder.db")
    conn.row_factory = sqlite3.Row  # To get dict-like results
    return conn

@app.route("/register", methods=["GET", "POST"])
def register():
    if request.method == "POST":
        username = request.form["username"]
        email = request.form["email"]
        password = request.form["password"]

        hashed_password = generate_password_hash(password)  # Secure password storage

        conn = get_db_connection()
        cursor = conn.cursor()

        try:
            cursor.execute("INSERT INTO users (username, email, password) VALUES (?, ?, ?)", 
                           (username, email, hashed_password))
            conn.commit()
            flash("Registration successful! Please log in.", "success")
            return redirect(url_for("login"))
        except sqlite3.IntegrityError:
            flash("Username or email already exists.", "danger")
        finally:
            conn.close()

    return render_template("register.html")
# Login Route
@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        username = request.form["username"]
        password = request.form["password"]

        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM users WHERE username = ?', (username,))
        user = cursor.fetchone()
        conn.close()

        if user and check_password_hash(user["password"], password):
            session["user_id"] = user["id"]
            session["username"] = user["username"]
            flash("Login successful!", "success")
            return redirect(url_for("dashboard"))
        else:
            flash("Invalid username or password.", "danger")

    return render_template("login1.html")

# Logout Route
@app.route("/logout")
def logout():
    session.clear()
    flash("You have been logged out.", "info")
    return redirect(url_for("login"))

# Protected Dashboard Route
@app.route("/dashboard")
def dashboard():
    if "user_id" not in session:
        flash("Please log in first.", "warning")
        return redirect(url_for("login"))
    return render_template("dashboard.html", username=session["username"])

if __name__ == "__main__":
    app.run(debug=True)