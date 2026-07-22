"""This file contains the intent classification logic for the mental health assistant.
"""
from routes.patient_routes import register_routes as register_patient_routes
from routes.chat_routes import register_routes as register_chat_routes
from routes.note_routes import register_routes as register_note_routes
from routes.extra_routes import register_routes as register_extra_routes


def register_routes(app):
    """Register all routes with the Flask app."""

    register_patient_routes(app)
    register_chat_routes(app)
    register_note_routes(app)
    register_extra_routes(app)
