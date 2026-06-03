from flask import Flask, request, jsonify, session
from flask_cors import CORS
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
app.secret_key = os.getenv('SECRET_KEY', 'survey-analyzer-secret-2024')
CORS(app, resources={r"/api/*": {"origins": "*"}})

app.config['UPLOAD_FOLDER'] = os.path.join(os.path.dirname(__file__), 'uploads')
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

from routes.analyze import analyze_bp
app.register_blueprint(analyze_bp)

@app.route('/api/health')
def health():
    return jsonify({'status': 'ok', 'message': 'Survey Analyzer API running'})

if __name__ == '__main__':
    app.run(debug=True, port=5001)
