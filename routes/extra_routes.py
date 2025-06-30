from flask import request, jsonify
from database import (
    get_surveys, add_survey,
    get_keywords, get_diagnoses,
    get_goals, get_resources
)


def register_routes(app):
    @app.route('/surveys/<int:patient_id>', methods=['GET'])
    def get_patient_surveys(patient_id):
        try:
            surveys = get_surveys(patient_id)
            return jsonify(surveys)
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    @app.route('/surveys', methods=['POST'])
    def add_patient_survey():
        try:
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
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    @app.route('/keywords/<int:patient_id>', methods=['GET'])
    def get_patient_keywords(patient_id):
        try:
            keywords = get_keywords(patient_id)
            return jsonify(keywords)
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    @app.route('/diagnoses/<int:patient_id>', methods=['GET'])
    def get_patient_diagnoses(patient_id):
        try:
            diagnoses = get_diagnoses(patient_id)
            return jsonify(diagnoses)
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    @app.route('/goals/<int:patient_id>', methods=['GET'])
    def get_patient_goals(patient_id):
        try:
            goals = get_goals(patient_id)
            return jsonify(goals)
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    @app.route('/resources/<int:patient_id>', methods=['GET'])
    def get_patient_resources(patient_id):
        try:
            resources = get_resources(patient_id)
            return jsonify(resources)
        except Exception as e:
            return jsonify({"error": str(e)}), 500
