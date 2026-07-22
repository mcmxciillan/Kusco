from flask import Flask
from database import init_db
from routes.route import register_routes

app = Flask(__name__)

# Initialize the database
init_db()

# Register all modular routes
register_routes(app)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=1993, debug=True)
