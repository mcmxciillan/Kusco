from contextlib import contextmanager
import os
import sqlite3
from datetime import datetime

# Database file
DB_FILE = os.getenv("DB_FILE", "clinician_chat.db")


def init_db():
    """Initialize the database with all required tables."""
    with open("schema.sql", "r") as f:
        schema_sql = f.read()
    with sqlite3.connect(DB_FILE) as conn:
        conn.executescript(schema_sql)

# a contextmanager is a generator function that yields a value and can be used with the 'with' statement
# it allows for setup and teardown code to be executed around a block of code
# this is useful for managing resources like database connections, file handles, etc.
# it ensures that the resource is properly cleaned up after use, even if an error occurs


@contextmanager
def get_db_connection():
    """Yield a database connection as a context manager."""
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row  # Return rows as dictionaries
    try:
        yield conn
    except Exception as e:
        logging.error("Error occurred while using database connection: %s", e)
        raise
    finally:
        conn.close()

# Patient operations


def add_patient(name):
    try:
        with get_db_connection() as conn:
            c = conn.cursor()
            c.execute("INSERT INTO patients (name) VALUES (?)", (name,))
            conn.commit()
            patient_id = c.lastrowid
        return patient_id
    except Exception as e:
        print(f"Error adding patient: {e}")
        return None


def get_patients():
    try:
        with get_db_connection() as conn:
            c = conn.cursor()
            c.execute("SELECT * FROM patients ORDER BY created_at")
            patients = c.fetchall()
        return [{"id": p["id"], "name": p["name"]} for p in patients]
    except Exception as e:
        print(f"Error retrieving patients: {e}")
        return []


def rename_patient(patient_id, new_name):
    try:
        with get_db_connection() as conn:
            c = conn.cursor()
            c.execute("UPDATE patients SET name = ? WHERE id = ?",
                      (new_name, patient_id))
            conn.commit()
    except Exception as e:
        print(f"Error renaming patient: {e}")

# Chat history operations


def add_chat_entry(patient_id, user_message, model_response):
    try:
        with get_db_connection() as conn:
            c = conn.cursor()
            c.execute("INSERT INTO chat_history (patient_id, user_message, model_response) VALUES (?, ?, ?)",
                      (patient_id, user_message, model_response))
            conn.commit()
    except Exception as e:
        print(f"Error adding chat entry: {e}")


def get_chat_history(patient_id):
    try:
        with get_db_connection() as conn:
            c = conn.cursor()
            c.execute(
                "SELECT * FROM chat_history WHERE patient_id = ? ORDER BY timestamp", (patient_id,))
            history = c.fetchall()
        # Use keys expected by the frontend
        return [{
            "id": h["id"],
            "user_message": h["user_message"],
            "model_response": h["model_response"],
            "timestamp": h["timestamp"]
        } for h in history]
    except Exception as e:
        print(f"Error retrieving chat history: {e}")
        return []

# Notes operations


def add_note(patient_id, note_type, content):
    try:
        with get_db_connection() as conn:
            c = conn.cursor()
            c.execute("INSERT INTO notes (patient_id, note_type, content) VALUES (?, ?, ?)",
                      (patient_id, note_type, content))
            conn.commit()
            note_id = c.lastrowid
        return note_id
    except Exception as e:
        print(f"Error adding note: {e}")
        return None


def get_notes(patient_id):
    try:
        with get_db_connection() as conn:
            c = conn.cursor()
            c.execute(
                "SELECT * FROM notes WHERE patient_id = ? ORDER BY timestamp", (patient_id,))
            notes = c.fetchall()
        return [{"id": n["id"], "note_type": n["note_type"], "content": n["content"], "timestamp": n["timestamp"]} for n in notes]
    except Exception as e:
        print(f"Error retrieving notes: {e}")
        return []


def get_note(note_id):
    try:
        with get_db_connection() as conn:
            c = conn.cursor()
            c.execute("SELECT * FROM notes WHERE id = ?", (note_id,))
            note = c.fetchone()
        return {"id": note["id"], "note_type": note["note_type"], "content": note["content"], "timestamp": note["timestamp"]} if note else None
    except Exception as e:
        print(f"Error retrieving note: {e}")
        return None

# Survey operations (placeholder)


def add_survey(patient_id, survey_type, responses, total_score, notes=""):
    try:
        with get_db_connection() as conn:
            c = conn.cursor()
            c.execute("INSERT INTO surveys (patient_id, survey_type, responses, total_score, notes) VALUES (?, ?, ?, ?, ?)",
                      (patient_id, survey_type, responses, total_score, notes))
            conn.commit()
    except Exception as e:
        print(f"Error adding survey: {e}")


def get_surveys(patient_id):
    try:
        with get_db_connection() as conn:
            c = conn.cursor()
            c.execute(
                "SELECT * FROM surveys WHERE patient_id = ? ORDER BY timestamp", (patient_id,))
            surveys = c.fetchall()
        return [{"id": s["id"], "survey_type": s["survey_type"], "responses": s["responses"],
                 "total_score": s["total_score"], "timestamp": s["timestamp"], "notes": s["notes"]} for s in surveys]
    except Exception as e:
        print(f"Error retrieving surveys: {e}")
        return []

# Keywords operations (placeholder)


def add_keyword(patient_id, keyword, contexts, category=None):
    try:
        with get_db_connection() as conn:
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
    except Exception as e:
        print(f"Error adding keyword: {e}")


def get_keywords(patient_id):
    try:
        with get_db_connection() as conn:
            c = conn.cursor()
            c.execute(
                "SELECT * FROM keywords WHERE patient_id = ? ORDER BY frequency DESC", (patient_id,))
            keywords = c.fetchall()
        return [{"id": k["id"], "keyword": k["keyword"], "frequency": k["frequency"], "contexts": k["contexts"],
                 "category": k["category"], "last_mentioned": k["last_mentioned"]} for k in keywords]
    except Exception as e:
        print(f"Error retrieving keywords: {e}")
        return []

# Diagnoses operations (placeholder)


def add_diagnosis(patient_id, diagnosis, likelihood, evidence):
    try:
        with get_db_connection() as conn:
            c = conn.cursor()
            c.execute("INSERT INTO diagnoses (patient_id, diagnosis, likelihood, evidence) VALUES (?, ?, ?, ?)",
                      (patient_id, diagnosis, likelihood, evidence))
            conn.commit()
    except Exception as e:
        print(f"Error adding diagnosis: {e}")


def get_diagnoses(patient_id):
    try:
        with get_db_connection() as conn:
            c = conn.cursor()
            c.execute(
                "SELECT * FROM diagnoses WHERE patient_id = ? ORDER BY timestamp DESC", (patient_id,))
            diagnoses = c.fetchall()
        return [{"id": d["id"], "diagnosis": d["diagnosis"], "likelihood": d["likelihood"],
                 "evidence": d["evidence"], "timestamp": d["timestamp"]} for d in diagnoses]
    except Exception as e:
        print(f"Error retrieving diagnoses: {e}")
        return []

# Goals operations (placeholder)


def add_goal(patient_id, description, metric, target_value, deadline):
    try:
        with get_db_connection() as conn:
            c = conn.cursor()
            c.execute("INSERT INTO goals (patient_id, description, metric, target_value, deadline) VALUES (?, ?, ?, ?, ?)",
                      (patient_id, description, metric, target_value, deadline))
            conn.commit()
    except Exception as e:
        print(f"Error adding goal: {e}")


def get_goals(patient_id):
    try:
        with get_db_connection() as conn:
            c = conn.cursor()
            c.execute(
                "SELECT * FROM goals WHERE patient_id = ? ORDER BY created_at", (patient_id,))
            goals = c.fetchall()
        return [{"id": g["id"], "description": g["description"], "metric": g["metric"], "target_value": g["target_value"],
                 "current_value": g["current_value"], "deadline": g["deadline"], "completed": g["completed"]} for g in goals]
    except Exception as e:
        print(f"Error retrieving goals: {e}")
        return []

# Resources operations (placeholder)


def add_resource(patient_id, title, resource_type, content):
    try:
        with get_db_connection() as conn:
            c = conn.cursor()
            c.execute("INSERT INTO resources (patient_id, title, type, content) VALUES (?, ?, ?, ?)",
                      (patient_id, title, resource_type, content))
            conn.commit()
    except Exception as e:
        print(f"Error adding resource: {e}")


def get_resources(patient_id):
    try:
        with get_db_connection() as conn:
            c = conn.cursor()
            c.execute(
                "SELECT * FROM resources WHERE patient_id = ? ORDER BY timestamp", (patient_id,))
            resources = c.fetchall()
        return [{"id": r["id"], "title": r["title"], "type": r["type"], "content": r["content"],
                 "timestamp": r["timestamp"]} for r in resources]
    except Exception as e:
        print(f"Error retrieving resources: {e}")
        return []


if __name__ == "__main__":
    init_db()
    print("Database initialized.")
