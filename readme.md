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
- **Automated Reminders:** Set reminders & receive notifications (stored in reminders table)
- **Track Medication History:** View past and upcoming doses
- **Staff & Patient Management:** Manage staff and patient records

## ⚙️ Setup Instructions

1. **Clone the Repository**
   ```bash
   git clone <repo_url>
   cd health-medication-reminder
   ```

2. **Install Dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Run the Application**
   ```bash
   python App.py
   ```
   Visit: [http://127.0.0.1:5000](http://127.0.0.1:5000)

## 🌐 API Integration
The app can fetch external health-related data using APIs (e.g., drug interactions, health tips) using the `requests` package.

## 📂 Database Schema

### Users Table (`users`)
| id  | username  | email            | password   |
|-----|-----------|------------------|------------|
| 1   | john_doe  | john@example.com | hashed_pw1 |
| 2   | jane_doe  | jane@example.com | hashed_pw2 |

### Patients Table (`patients`)
| id  | first_name | last_name | dob | gender | address | phone | email | patient_type | admission_date | primary_condition | condition_severity | current_status | medications | notes | photo | staff_id | created_at |
|-----|------------|-----------|-----|--------|---------|-------|-------|--------------|---------------|------------------|--------------------|---------------|-------------|-------|-------|----------|------------|
| ... | ...        | ...       | ... | ...    | ...     | ...   | ...   | ...          | ...           | ...              | ...                | ...           | ...         | ...   | ...   | ...      | ...        |

### Reminders Table (`reminders`)
| id  | patient_name | medication | reminder_time | dosage | sound_type | staff_id | created_at |
|-----|--------------|-----------|---------------|--------|------------|----------|------------|
| ... | ...          | ...       | ...           | ...    | ...        | ...      | ...        |