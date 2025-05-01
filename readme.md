# Kusco: Clinician Chat & Notes Application

This project is a Flask-based web application for clinicians to chat with an AI assistant, manage patient notes, and more. It uses a local SQLite database and integrates with [Ollama](https://ollama.com/) for running AI models.

---

## Features

- Secure clinician-AI chat per patient
- Patient management (add, rename)
- Clinical note generation and editing (SOAP, BIRP, DAP, Basic)
- Survey, keyword, diagnosis, goal, and resource tracking (extensible)
- All data stored locally in `clinician_chat.db`

---

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/mcmxciillan/Kusco.git
cd kusco
```

### 2. Install Python Dependencies

This project uses [Pipenv](https://pipenv.pypa.io/en/latest/) for dependency management.

If you don't have Pipenv installed, install it with:

```bash
pip install pipenv
```

Then, install dependencies:

```bash
pipenv install
```

Activate the virtual environment:

```bash
pipenv shell
```

### 3. Install and Run Ollama

Kusco uses [Ollama](https://ollama.com/) to run local LLMs for chat and note generation.

- Download and install Ollama from [https://ollama.com/download](https://ollama.com/download)
- Start the Ollama server (usually starts automatically after install):

```bash
ollama serve
```

- Download a model (e.g., `llama3`):

```bash
ollama pull llama3
```

You can use other models supported by Ollama as well.

### 4. Input Chosen Model in query function

- Place the model you have chosen to download in this file [here](https://github.com/mcmxciillan/Kusco/blob/main/query.py#L6)

### 5. Run the Application

```bash
python app.py
```

The app will be available at [http://localhost:5001](http://localhost:5001).

---

## Project Structure

```
kusco/
├── app.py                # Main Flask app
├── database.py           # Database models and functions
├── routes.py             # API endpoints
├── static/
│   └── js/
│       └── index.js      # Frontend JavaScript
├── templates/
│   └── index.html        # Main HTML template
├── Pipfile               # Python dependencies
├── Pipfile.lock          # Dependency lock file
└── README.md             # This file
```

---

## Notes

- The database (`clinician_chat.db`) is created automatically on first run.
- Make sure Ollama is running and the desired model is downloaded before starting the app.
- You can change the model used by editing the relevant code in `routes.py`.

---

## Troubleshooting

- **Ollama not found:** Ensure Ollama is installed and running (`ollama serve`).
- **Model not found:** Run `ollama pull <modelname>` to download the required model.
- **Port in use:** Change the port in `app.py` if 5001 is unavailable.

---

## Acknowledgments

- [Ollama](https://ollama.com/) for local LLM serving
- Flask, SQLite, and the open-source community
