

CREATE TABLE IF NOT EXISTS patients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS chat_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id INTEGER,
    user_message TEXT,
    model_response TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id)
);

CREATE TABLE IF NOT EXISTS notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id INTEGER,
    note_type TEXT,
    content TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id)
);

CREATE TABLE IF NOT EXISTS surveys (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id INTEGER,
    survey_type TEXT,
    responses TEXT,
    total_score INTEGER,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    FOREIGN KEY (patient_id) REFERENCES patients(id)
);

CREATE TABLE IF NOT EXISTS keywords (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id INTEGER,
    keyword TEXT,
    frequency INTEGER DEFAULT 0,
    contexts TEXT,
    category TEXT,
    last_mentioned DATETIME,
    FOREIGN KEY (patient_id) REFERENCES patients(id)
);

CREATE TABLE IF NOT EXISTS diagnoses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id INTEGER,
    diagnosis TEXT,
    likelihood REAL,
    evidence TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id)
);

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
);

CREATE TABLE IF NOT EXISTS resources (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id INTEGER,
    title TEXT,
    type TEXT,
    content TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id)
);


-- Indexes to improve query performance on frequently filtered fields
CREATE INDEX IF NOT EXISTS idx_chat_history_patient_id ON chat_history(patient_id);
CREATE INDEX IF NOT EXISTS idx_notes_patient_id ON notes(patient_id);
CREATE INDEX IF NOT EXISTS idx_surveys_patient_id ON surveys(patient_id);
CREATE INDEX IF NOT EXISTS idx_keywords_patient_id ON keywords(patient_id);
CREATE INDEX IF NOT EXISTS idx_diagnoses_patient_id ON diagnoses(patient_id);
CREATE INDEX IF NOT EXISTS idx_goals_patient_id ON goals(patient_id);
CREATE INDEX IF NOT EXISTS idx_resources_patient_id ON resources(patient_id);