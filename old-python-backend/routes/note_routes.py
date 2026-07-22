import json
from flask import request, jsonify, render_template
from database import add_note, get_notes, get_note, get_chat_history
from query import query_model
from prompts import NOTE_PROMPTS


def register_routes(app):
    @app.route('/note_template', methods=['POST'])
    def render_note_template():
        data = request.json
        note_type = data.get('note_type')
        content = data.get('content')

        if not note_type or not content:
            return jsonify({"error": "Note type and content required"}), 400

        try:
            html_content = render_template(
                f"notes/{note_type.lower()}.html", **content)
            return jsonify({"html_content": html_content})
        except Exception as e:
            return jsonify({"error": f"Error rendering template: {str(e)}"}), 500

    @app.route('/generate_note', methods=['POST'])
    def generate_note():
        data = request.json
        patient_id = data.get('patient_id')
        note_type = data.get('note_type')

        if not patient_id or not note_type:
            return jsonify({"error": "Patient ID and note type required"}), 400

        history = get_chat_history(patient_id)
        context = "\n".join(
            [f"Clinician: {entry['user_message']}\nAI: {entry['model_response']}" for entry in history])

        prompt_template = NOTE_PROMPTS.get(note_type)
        if not prompt_template:
            return jsonify({"error": f"Unsupported note type: {note_type}"}), 400
        full_query = prompt_template.format(context=context)

        # Instead of streaming, collect the full response
        try:
            full_response = "".join(chunk for chunk in query_model(full_query))
            print(
                f"Generated note for patient {patient_id} of type {note_type}: {full_response}")
            return jsonify({"model_response": full_response})
        except Exception as e:
            return jsonify({"error": f"Error generating note: {str(e)}"}), 500

    @app.route('/save_note', methods=['POST'])
    def save_note():
        data = request.json
        patient_id = data.get('patient_id')
        note_type = data.get('note_type')
        content = data.get('content')

        if not patient_id or not note_type or not content:
            return jsonify({"error": "Patient ID, note type, and content required"}), 400

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
        if note['note_type'] not in NOTE_PROMPTS:
            return jsonify({"error": f"Unsupported note type: {note['note_type']}"}), 400
        try:
            sections = json.loads(note['content'])
            html_content = render_template(
                f"notes/{note['note_type'].lower()}.html", **sections)
            return jsonify({"content": html_content})
        except Exception as e:
            return jsonify({"error": f"Failed to render note: {str(e)}"}), 500
