from flask import request, jsonify, Response, stream_with_context
from query import query_model
from database import get_chat_history, add_chat_entry


def register_routes(app):
    @app.route('/chat', methods=['POST'])
    def chat():
        try:
            data = request.json
            user_message = data.get('message')
            patient_id = data.get('patient_id')

            if not user_message or not patient_id:
                return jsonify({"error": "Message and patient_id required"}), 400

            history = get_chat_history(patient_id)
            context = "\n".join(
                [f"Clinician: {entry['user']}\nAI: {entry['model']}" for entry in history])
            full_query = f"{context}\n\nClinician: {user_message}" if context else user_message

            # Generate the full response as a string (no streaming)
            full_response = "".join(chunk for chunk in query_model(full_query))
            add_chat_entry(patient_id, user_message, full_response)
            return jsonify({"model_response": full_response})
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    @app.route('/history/<int:patient_id>', methods=['GET'])
    def get_history(patient_id):
        try:
            history = get_chat_history(patient_id)
            return jsonify(history)
        except Exception as e:
            return jsonify({"error": str(e)}), 500
