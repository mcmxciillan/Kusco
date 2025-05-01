import sqlite3
from datetime import datetime

# Database file
DB_FILE = "clinician_chat.db"


def init_db():
    """Initialize the database with all required tables."""
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()

    # Patients table
    c.execute('''
        CREATE TABLE IF NOT EXISTS patients (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    # Chat history table
    c.execute('''
        CREATE TABLE IF NOT EXISTS chat_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            patient_id INTEGER,
            user_message TEXT,
            model_response TEXT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (patient_id) REFERENCES patients(id)
        )
    ''')

    # Notes table
    c.execute('''
        CREATE TABLE IF NOT EXISTS notes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            patient_id INTEGER,
            note_type TEXT,
            content TEXT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (patient_id) REFERENCES patients(id)
        )
    ''')

    # Surveys table
    c.execute('''
        CREATE TABLE IF NOT EXISTS surveys (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            patient_id INTEGER,
            survey_type TEXT,
            responses TEXT,
            total_score INTEGER,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            notes TEXT,
            FOREIGN KEY (patient_id) REFERENCES patients(id)
        )
    ''')

    # Keywords table
    c.execute('''
        CREATE TABLE IF NOT EXISTS keywords (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            patient_id INTEGER,
            keyword TEXT,
            frequency INTEGER DEFAULT 0,
            contexts TEXT,
            category TEXT,
            last_mentioned DATETIME,
            FOREIGN KEY (patient_id) REFERENCES patients(id)
        )
    ''')

    # Diagnoses table
    c.execute('''
        CREATE TABLE IF NOT EXISTS diagnoses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            patient_id INTEGER,
            diagnosis TEXT,
            likelihood REAL,
            evidence TEXT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (patient_id) REFERENCES patients(id)
        )
    ''')

    # Goals table
    c.execute('''
        CREATE TABLE IF NOT EXISTS goals (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            patient_id INTEGER,
            description TEXT,
            metric TEXT,
            target_value TEXT,
            current_value TEXT,
            deadline DATETIME,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            completed INTEGER DEFAULT 0,
            FOREIGN KEY (patient_id) REFERENCES patients(id)
        )
    ''')

    # Resources table
    c.execute('''
        CREATE TABLE IF NOT EXISTS resources (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            patient_id INTEGER,
            title TEXT,
            type TEXT,
            content TEXT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (patient_id) REFERENCES patients(id)
        )
    ''')

    conn.commit()
    conn.close()


def get_db_connection():
    """Return a database connection."""
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row  # Return rows as dictionaries
    return conn

# Patient operations


def add_patient(name):
    conn = get_db_connection()
    c = conn.cursor()
    c.execute("INSERT INTO patients (name) VALUES (?)", (name,))
    conn.commit()
    patient_id = c.lastrowid
    conn.close()
    return patient_id


def get_patients():
    conn = get_db_connection()
    c = conn.cursor()
    c.execute("SELECT * FROM patients ORDER BY created_at")
    patients = c.fetchall()
    conn.close()
    return [{"id": p["id"], "name": p["name"]} for p in patients]


def rename_patient(patient_id, new_name):
    conn = get_db_connection()
    c = conn.cursor()
    c.execute("UPDATE patients SET name = ? WHERE id = ?",
              (new_name, patient_id))
    conn.commit()
    conn.close()

# Chat history operations


def add_chat_entry(patient_id, user_message, model_response):
    conn = get_db_connection()
    c = conn.cursor()
    c.execute("INSERT INTO chat_history (patient_id, user_message, model_response) VALUES (?, ?, ?)",
              (patient_id, user_message, model_response))
    conn.commit()
    conn.close()


def get_chat_history(patient_id):
    conn = get_db_connection()
    c = conn.cursor()
    c.execute(
        "SELECT * FROM chat_history WHERE patient_id = ? ORDER BY timestamp", (patient_id,))
    history = c.fetchall()
    conn.close()
    return [{"id": h["id"], "user": h["user_message"], "model": h["model_response"], "timestamp": h["timestamp"]} for h in history]

# Notes operations


def add_note(patient_id, note_type, content):
    conn = get_db_connection()
    c = conn.cursor()
    c.execute("INSERT INTO notes (patient_id, note_type, content) VALUES (?, ?, ?)",
              (patient_id, note_type, content))
    conn.commit()
    note_id = c.lastrowid
    conn.close()
    return note_id


def get_notes(patient_id):
    conn = get_db_connection()
    c = conn.cursor()
    c.execute(
        "SELECT * FROM notes WHERE patient_id = ? ORDER BY timestamp", (patient_id,))
    notes = c.fetchall()
    conn.close()
    return [{"id": n["id"], "note_type": n["note_type"], "content": n["content"], "timestamp": n["timestamp"]} for n in notes]


def get_note(note_id):
    conn = get_db_connection()
    c = conn.cursor()
    c.execute("SELECT * FROM notes WHERE id = ?", (note_id,))
    note = c.fetchone()
    conn.close()
    return {"id": note["id"], "note_type": note["note_type"], "content": note["content"], "timestamp": note["timestamp"]} if note else None

# Survey operations (placeholder)


def add_survey(patient_id, survey_type, responses, total_score, notes=""):
    conn = get_db_connection()
    c = conn.cursor()
    c.execute("INSERT INTO surveys (patient_id, survey_type, responses, total_score, notes) VALUES (?, ?, ?, ?, ?)",
              (patient_id, survey_type, responses, total_score, notes))
    conn.commit()
    conn.close()


def get_surveys(patient_id):
    conn = get_db_connection()
    c = conn.cursor()
    c.execute(
        "SELECT * FROM surveys WHERE patient_id = ? ORDER BY timestamp", (patient_id,))
    surveys = c.fetchall()
    conn.close()
    return [{"id": s["id"], "survey_type": s["survey_type"], "responses": s["responses"],
             "total_score": s["total_score"], "timestamp": s["timestamp"], "notes": s["notes"]} for s in surveys]

# Keywords operations (placeholder)


def add_keyword(patient_id, keyword, contexts, category=None):
    conn = get_db_connection()
    c = conn.cursor()
    c.execute("SELECT * FROM keywords WHERE patient_id = ? AND keyword = ?",
              (patient_id, keyword))
    existing = c.fetchone()
    if existing:
        frequency = existing["frequency"] + 1
        updated_contexts = existing["contexts"] + "," + \
            contexts if existing["contexts"] else contexts
        c.execute("UPDATE keywords SET frequency = ?, contexts = ?, last_mentioned = ? WHERE id = ?",
                  (frequency, updated_contexts, datetime.now(), existing["id"]))
    else:
        c.execute("INSERT INTO keywords (patient_id, keyword, frequency, contexts, category, last_mentioned) VALUES (?, ?, 1, ?, ?, ?)",
                  (patient_id, keyword, contexts, category, datetime.now()))
    conn.commit()
    conn.close()


def get_keywords(patient_id):
    conn = get_db_connection()
    c = conn.cursor()
    c.execute(
        "SELECT * FROM keywords WHERE patient_id = ? ORDER BY frequency DESC", (patient_id,))
    keywords = c.fetchall()
    conn.close()
    return [{"id": k["id"], "keyword": k["keyword"], "frequency": k["frequency"], "contexts": k["contexts"],
             "category": k["category"], "last_mentioned": k["last_mentioned"]} for k in keywords]

# Diagnoses operations (placeholder)


def add_diagnosis(patient_id, diagnosis, likelihood, evidence):
    conn = get_db_connection()
    c = conn.cursor()
    c.execute("INSERT INTO diagnoses (patient_id, diagnosis, likelihood, evidence) VALUES (?, ?, ?, ?)",
              (patient_id, diagnosis, likelihood, evidence))
    conn.commit()
    conn.close()


def get_diagnoses(patient_id):
    conn = get_db_connection()
    c = conn.cursor()
    c.execute(
        "SELECT * FROM diagnoses WHERE patient_id = ? ORDER BY timestamp DESC", (patient_id,))
    diagnoses = c.fetchall()
    conn.close()
    return [{"id": d["id"], "diagnosis": d["diagnosis"], "likelihood": d["likelihood"],
             "evidence": d["evidence"], "timestamp": d["timestamp"]} for d in diagnoses]

# Goals operations (placeholder)


def add_goal(patient_id, description, metric, target_value, deadline):
    conn = get_db_connection()
    c = conn.cursor()
    c.execute("INSERT INTO goals (patient_id, description, metric, target_value, deadline) VALUES (?, ?, ?, ?, ?)",
              (patient_id, description, metric, target_value, deadline))
    conn.commit()
    conn.close()


def get_goals(patient_id):
    conn = get_db_connection()
    c = conn.cursor()
    c.execute(
        "SELECT * FROM goals WHERE patient_id = ? ORDER BY created_at", (patient_id,))
    goals = c.fetchall()
    conn.close()
    return [{"id": g["id"], "description": g["description"], "metric": g["metric"], "target_value": g["target_value"],
             "current_value": g["current_value"], "deadline": g["deadline"], "completed": g["completed"]} for g in goals]

# Resources operations (placeholder)


def add_resource(patient_id, title, resource_type, content):
    conn = get_db_connection()
    c = conn.cursor()
    c.execute("INSERT INTO resources (patient_id, title, type, content) VALUES (?, ?, ?, ?)",
              (patient_id, title, resource_type, content))
    conn.commit()
    conn.close()


def get_resources(patient_id):
    conn = get_db_connection()
    c = conn.cursor()
    c.execute(
        "SELECT * FROM resources WHERE patient_id = ? ORDER BY timestamp", (patient_id,))
    resources = c.fetchall()
    conn.close()
    return [{"id": r["id"], "title": r["title"], "type": r["type"], "content": r["content"],
             "timestamp": r["timestamp"]} for r in resources]


if __name__ == "__main__":
    init_db()
    print("Database initialized.")
