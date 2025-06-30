

from flask import request, jsonify
from database import get_patients, add_patient, rename_patient


def register_routes(app):
    @app.route('/patients', methods=['GET'])
    def patient_list():
        patients = get_patients()
        print(f"Retrieved patients: {patients}")
        return jsonify(patients)

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
        except Exception as e:
            return jsonify({"error": str(e)}), 400
