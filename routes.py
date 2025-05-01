import re
import sqlite3
import json
from flask import jsonify, request, Response, stream_with_context, render_template
from query import query_model
from database import (add_patient, get_patients, rename_patient, add_chat_entry, get_chat_history,
                      add_note, get_notes, get_note, add_survey, get_surveys, add_keyword, get_keywords,
                      add_diagnosis, get_diagnoses, add_goal, get_goals, add_resource, get_resources)


def register_routes(app):
    """Register all routes with the Flask app."""

    @app.route('/')
    def home():
        patients = get_patients()
        return render_template('index.html', patients=patients)

    @app.route('/patients', methods=['GET'])
    def patient_list():
        return jsonify(get_patients())

    @app.route('/add_patient', methods=['POST'])
    def add_patient_route():
        name = request.json.get('name')
        if not name:
            return jsonify({"error": "Patient name required"}), 400
        add_patient(name)
        return jsonify({"message": "Patient added", "patients": get_patients()})

    @app.route('/rename_patient', methods=['POST'])
    def rename_patient_route():
        data = request.json
        patient_id = data.get('patient_id')
        new_name = data.get('new_name')
        if not patient_id or not new_name:
            return jsonify({"error": "Patient ID and new name required"}), 400
        try:
            rename_patient(patient_id, new_name)
            return jsonify({"message": "Patient renamed", "patients": get_patients()})
        except sqlite3.IntegrityError:
            return jsonify({"error": "Patient name must be unique"}), 400

    @app.route('/chat', methods=['POST'])
    def chat():
        """Chat endpoint for handling user messages and generating responses."""
        data = request.json
        user_message = data.get('message')
        patient_id = data.get('patient_id')

        if not user_message or not patient_id:
            return jsonify({"error": "Message and patient_id required"}), 400

        history = get_chat_history(patient_id)
        context = "\n".join(
            [f"Clinician: {entry['user']}\nAI: {entry['model']}" for entry in history])
        full_query = f"{context}\n\nClinician: {user_message}" if context else user_message

        def generate():
            full_response = ""
            for chunk in query_model(full_query, stream=True):
                full_response += chunk
                yield chunk
            add_chat_entry(patient_id, user_message, full_response)

        return Response(stream_with_context(generate()), content_type='text/plain')

    @app.route('/history/<int:patient_id>', methods=['GET'])
    def get_history(patient_id):
        history = get_chat_history(patient_id)
        return jsonify(history)

    @app.route('/note_template', methods=['POST'])
    def render_note_template():
        data = request.json
        note_type = data.get('note_type')
        content = data.get('content')

        if not note_type or not content:
            return jsonify({"error": "Note type and content required"}), 400

        # Content is already a JSON object; pass it directly to the template
        try:
            html_content = render_template(
                f"notes/{note_type.lower()}.html", **content)
            return jsonify({"html_content": html_content})
        except Exception as e:
            return jsonify({"error": f"Error rendering template: {str(e)}"}), 500

    def parse_note_content(content, note_type):
        sections = {}
        if note_type == "SOAP":
            match = re.match(
                r'\s*\*\*Subjective\*\*:\s*(.*?)\s*\*\*Objective\*\*:\s*(.*?)\s*\*\*Assessment\*\*:\s*(.*?)\s*\*\*Plan\*\*:\s*(.*)',
                content, re.DOTALL)
            if match:
                sections = {
                    "subjective": match.group(1).strip(),
                    "objective": match.group(2).strip(),
                    "assessment": match.group(3).strip(),
                    "plan": match.group(4).strip()
                }
        elif note_type == "BIRP":
            match = re.match(
                r'\s*\*\*Behavior\*\*:\s*(.*?)\s*\*\*Intervention\*\*:\s*(.*?)\s*\*\*Response\*\*:\s*(.*?)\s*\*\*Plan\*\*:\s*(.*)',
                content, re.DOTALL)
            if match:
                sections = {
                    "behavior": match.group(1).strip(),
                    "intervention": match.group(2).strip(),
                    "response": match.group(3).strip(),
                    "plan": match.group(4).strip()
                }
        elif note_type == "DAP":
            match = re.match(
                r'\s*\*\*Data\*\*:\s*(.*?)\s*\*\*Assessment\*\*:\s*(.*?)\s*\*\*Plan\*\*:\s*(.*)',
                content, re.DOTALL)
            if match:
                sections = {
                    "data": match.group(1).strip(),
                    "assessment": match.group(2).strip(),
                    "plan": match.group(3).strip()
                }
        elif note_type == "Basic":
            match = re.match(
                r'\s*\*\*Presentation\*\*:\s*(.*?)\s*\*\*State\*\*:\s*(.*?)\s*\*\*Assessment\*\*:\s*(.*?)\s*\*\*Themes\*\*:\s*(.*?)\s*\*\*Treatment\*\*:\s*(.*?)\s*\*\*Progress\*\*:\s*(.*)',
                content, re.DOTALL)
            if match:
                sections = {
                    "presentation": match.group(1).strip(),
                    "state": match.group(2).strip(),
                    "assessment": match.group(3).strip(),
                    "themes": match.group(4).strip(),
                    "treatment": match.group(5).strip(),
                    "progress": match.group(6).strip()
                }
        return sections

    @app.route('/generate_note', methods=['POST'])
    def generate_note():
        data = request.json
        patient_id = data.get('patient_id')
        note_type = data.get('note_type')

        if not patient_id or not note_type:
            return jsonify({"error": "Patient ID and note type required"}), 400

        history = get_chat_history(patient_id)
        context = "\n".join(
            [f"Clinician: {entry['user']}\nAI: {entry['model']}" for entry in history])

        note_prompts = {
            "SOAP": """
                Based on the conversation history: "{context}", generate a SOAP therapy note for the patient. Format it as a json object in the form:
                    subjective: Clients reported symptoms, emotions, concerns,
                    objective: Observable data: appearance, symptoms, etc.,
                    assessment: Clinical synthesis of progress,
                    plan: Treatment plan, interventions, goals
                Provide only the formatted note, no additional commentary. Use the properties of the SOAP note to create a json object.
            """,
            "BIRP": """
                Based on the conversation history: "{context}", generate a BIRP therapy note for the patient. Format it as a json object in the form:
                    behavior: Clients presentation, actions, emotions,
                    intervention: Themes explored, interventions used,
                    response: Clients response to interventions,
                    plan: Future session plans, treatment changes
                Provide only the formatted note, no additional commentary. Use the properties of the BIRP note to create a json object.
            """,
            "DAP": """
                Based on the conversation history: "{context}", generate a DAP therapy note for the patient. Format it as a json object in the form:
                    data: Observable data: behavior, mood, symptoms,
                    assessment: Professional assessment, progress,
                    plan: Future session plans, treatment changes
                Provide only the formatted note, no additional commentary. Use the properties of the DAP note to create a json object.
            """,
            "Basic": """
                Based on the conversation history: "{context}", generate a Basic therapy note for the patient. Format it as a json object in the form:
                    presentation: Session location, client appearance,
                    state: Emotional state, behaviors, functioning,
                    assessment: Results of any assessments,
                    themes: Topics discussed],
                    treatment: Interventions and client response,
                    progress: Developments, concerns, goals, homework
                Provide only the formatted note, no additional commentary. Use the properties of the Basic note to create a json object.
            """
        }
        full_query = note_prompts[note_type].format(context=context)

        def generate():
            full_response = ""
            for chunk in query_model(full_query, stream=True):
                full_response += chunk
                yield chunk

        return Response(stream_with_context(generate()), content_type='application/json')

    @app.route('/save_note', methods=['POST'])
    def save_note():
        data = request.json
        patient_id = data.get('patient_id')
        note_type = data.get('note_type')
        content = data.get('content')

        if not patient_id or not note_type or not content:
            return jsonify({"error": "Patient ID, note type, and content required"}), 400

        # Assume content is the JSON object; stringify it for storage
        content_json = json.dumps(content)
        add_note(patient_id, note_type, content_json)
        return jsonify({"message": "Note saved"})

    @app.route('/notes/<int:patient_id>', methods=['GET'])
    def get_patient_notes(patient_id):
        notes = get_notes(patient_id)
        return jsonify(notes)

    @app.route('/note/<int:note_id>', methods=['GET'])
    def get_single_note(note_id):
        note = get_note(note_id)
        if not note:
            return jsonify({"error": "Note not found"}), 404
        try:
            # Assume content is stored as JSON string; parse it
            sections = json.loads(note['content'])
            html_content = render_template(
                f"notes/{note['note_type'].lower()}.html", **sections)
            return jsonify({"content": html_content})
        except json.JSONDecodeError:
            return jsonify({"error": "Invalid note content format"}), 400

    # Placeholder routes for new panels (to be implemented later)
    @app.route('/surveys/<int:patient_id>', methods=['GET'])
    def get_patient_surveys(patient_id):
        surveys = get_surveys(patient_id)
        return jsonify(surveys)

    @app.route('/surveys', methods=['POST'])
    def add_patient_survey():
        data = request.json
        patient_id = data.get('patient_id')
        survey_type = data.get('survey_type')
        responses = data.get('responses')
        total_score = data.get('total_score')
        notes = data.get('notes', '')
        if not patient_id or not survey_type or not responses or total_score is None:
            return jsonify({"error": "Patient ID, survey type, responses, and total score required"}), 400
        add_survey(patient_id, survey_type, responses, total_score, notes)
        return jsonify({"message": "Survey added"})

    @app.route('/keywords/<int:patient_id>', methods=['GET'])
    def get_patient_keywords(patient_id):
        keywords = get_keywords(patient_id)
        return jsonify(keywords)

    @app.route('/diagnoses/<int:patient_id>', methods=['GET'])
    def get_patient_diagnoses(patient_id):
        diagnoses = get_diagnoses(patient_id)
        return jsonify(diagnoses)

    @app.route('/goals/<int:patient_id>', methods=['GET'])
    def get_patient_goals(patient_id):
        goals = get_goals(patient_id)
        return jsonify(goals)

    @app.route('/resources/<int:patient_id>', methods=['GET'])
    def get_patient_resources(patient_id):
        resources = get_resources(patient_id)
        return jsonify(resources)
