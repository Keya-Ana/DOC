
# Health & Medication Reminder

## 📌 Project Overview
**Health & Medication Reminder** is a Flask-based web application that helps users track medications, set reminders, and receive alerts. The interface is simple and intuitive for managing medication schedules.

## 🛠️ Technologies Used
- **Frontend:** HTML, CSS, JavaScript
- **Backend:** Flask (Python)
- **Database:** SQLite3
- **Version Control:** Git

## 🔥 Features
- **User Authentication:** Secure login with session-based authentication
- **Medication Management:** Add, edit, and delete medications (Name, Dosage, Time)
- **Automated Reminders:** Set reminders & receive notifications
- **Track Medication History:** View past and upcoming doses

## ⚙️ Setup Instructions

1. **Clone the Repository**
   ```bash
   git clone <repo_url>
   cd health-medication-reminder
   ```

2. **Install Dependencies**
   ```bash
   pip install -r requirements.txt
   # Or, if requirements.txt is missing:
   pip install Flask
   ```

3. **Run the Application**
   ```bash
   python app.py
   ```
   Visit: [http://127.0.0.1:5000](http://127.0.0.1:5000)

## 🌐 API Integration
The app can fetch external health-related data using APIs (e.g., drug interactions, health tips). API integration details will be updated soon.

## 📂 Database Schema

### Users Table (`users`)
| id  | username  | email            | password   |
|-----|-----------|------------------|------------|
| 1   | john_doe  | john@example.com | hashed_pw1 |
| 2   | jane_doe  | jane@example.com | hashed_pw2 |

### Medications Table (`medications`)
| id  | user_id | name        | dosage | time      |
|-----|---------|-------------|--------|-----------|
| 1   | 1       | Paracetamol | 500mg  | 08:00 AM  |
| 2   | 2       | Ibuprofen   | 200mg  | 02:00 PM  |