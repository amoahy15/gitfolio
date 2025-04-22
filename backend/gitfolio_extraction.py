from flask import Flask, request, jsonify, session
from flask_cors import CORS
from openai import OpenAI
import os
import PyPDF2
import docx
import re
from flask_session import Session
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Create Flask app
app = Flask(__name__)

# Configure session
app.config["SESSION_TYPE"] = "filesystem"
app.config["SECRET_KEY"] = os.environ.get("SECRET_KEY", "dev-secret-key")
app.config["SESSION_PERMANENT"] = True
app.config["SESSION_USE_SIGNER"] = True
app.config["SESSION_COOKIE_SAMESITE"] = "None"  # or 'Lax'
app.config["SESSION_COOKIE_SECURE"] = True

Session(app)


CORS(app, resources={r"/*": {
    "origins": ["http://localhost:3000"], 
    "supports_credentials": True,
    "methods": ["GET", "POST", "OPTIONS"],
    "allow_headers": ["Content-Type", "Authorization"]
}})

# Initialize OpenAI client
client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))

@app.route('/')
def home():
    return "GitFolio API"

@app.route('/generate_portfolio', methods=['POST'])
def generate_portfolio():
    """Simple endpoint to process a resume file and generate portfolio HTML."""
    file = request.files.get('resume_file')
    if not file:
        return jsonify({"error": "No file selected"}), 400
    
    try:
        # Extract text from file
        if file.filename.endswith('.pdf'):
            reader = PyPDF2.PdfReader(file)
            resume_text = ' '.join(page.extract_text() for page in reader.pages if page.extract_text())
        elif file.filename.endswith('.txt'):
            resume_text = file.read().decode('utf-8')
        elif file.filename.endswith('.docx'):
            doc = docx.Document(file)
            resume_text = "\n".join([para.text for para in doc.paragraphs])
        else:
            return jsonify({"error": "Unsupported file type"}), 400
        
        # Send to ChatGPT to process and generate HTML
        response = client.chat.completions.create(
            model="ft:gpt-4o-mini-2024-07-18:gitfolio::BOc6D4PJ",
            messages=[
                {"role": "system", "content": "You are an Expert Frontend web developer with creativity and nice Chatbot Assitante. Process thdddis resume text and create a complete HTML/CSS portfolio page that is creative and uses in line css tags. Include all the data from the re  Return ONLY valid HTML starting with <!DOCTYPE html>. Allow the user to make changes to the styling and you willupdate the html using in line styling tags. Use some of the code you are fine tuned with to output different and creative portfolios."},
                {"role": "user", "content": resume_text}
            ],
            max_tokens=3000,
            temperature=0.4
        )
        
        html_content = response.choices[0].message.content.strip()
        
        # Clean up any code blocks from the response
        html_content = re.sub(r'^```(?:html)?|```$', '', html_content, flags=re.MULTILINE).strip()
        
        # Store in session
        session['portfolio_html'] = html_content
        session.modified = True
        
        # Return HTML directly
        return jsonify({"html": html_content}), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/chat_portfolio', methods=['POST'])
def chat_portfolio():
    """Simple endpoint to receive a chat message and return both conversation and HTML responses."""
    try:
        data = request.get_json()
        user_message = data.get("message", "")
        
        if not user_message:
            return jsonify({"error": "No message provided"}), 400
        
        # Get current HTML if available
        current_html = session.get('portfolio_html', '')
        has_portfolio = bool(current_html)
        
        # Check if the message is likely a portfolio update request
        likely_update_keywords = ['change', 'update', 'modify', 'style', 'color', 'font', 
                                'add', 'remove', 'make it', 'background', 'layout', 'create']
        is_likely_update = any(keyword in user_message.lower() for keyword in likely_update_keywords)
        
        # Adjust system prompt based on message content
        if is_likely_update and has_portfolio:
            system_content = "You are a web developer assistant. The user is requesting updates to their portfolio. Respond with valid HTML that incorporates their requested changes. The HTML should start with <!DOCTYPE html>."
        else:
            system_content = "You are a conversational assistant helping with portfolio creation. DO NOT output HTML code unless explicitly asked to modify the portfolio. Respond conversationally to help the user."
        
        # Send both the message and current HTML to ChatGPT
        response = client.chat.completions.create(
            model="ft:gpt-4o-mini-2024-07-18:gitfolio::BOc6D4PJ",
            messages=[
                {"role": "system", "content": system_content},
                {"role": "user", "content": f"Current HTML: {current_html}\n\nUser message: {user_message}"}
            ],
            max_tokens=3000,
            temperature=0.5
        )
        
        assistant_response = response.choices[0].message.content.strip()
        
        # Check if the response looks like HTML
        if assistant_response.startswith("<!DOCTYPE html>") or "<html" in assistant_response[:100].lower():
            # It's HTML - clean it up, store it, and return it
            html_content = re.sub(r'^```(?:html)?|```$', '', assistant_response, flags=re.MULTILINE).strip()
            session['portfolio_html'] = html_content
            session.modified = True
            
            # Return both the HTML and a confirmation message
            return jsonify({
                "html": html_content,
                "response": "I've updated your portfolio based on your request. You can see the changes in the preview panel.",
                "has_portfolio": True
            }), 200
        else:
            # It's a conversational response
            return jsonify({
                "response": assistant_response,
                "has_portfolio": has_portfolio
            }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    """Simple endpoint to receive a chat message and return both conversation and HTML responses."""
    try:
        data = request.get_json()
        user_message = data.get("message", "")
        
        if not user_message:
            return jsonify({"error": "No message provided"}), 400
        
        # Get current HTML if available
        current_html = session.get('portfolio_html', '')
        has_portfolio = bool(current_html)
        
        # Send both the message and current HTML to ChatGPT
        response = client.chat.completions.create(
            model="ft:gpt-4o-mini-2024-07-18:gitfolio::BOc6D4PJ",
            messages=[
                {"role": "system", "content": "You are a web developer assistant. The user might want to update their portfolio. IF their message requests style changes, color changes, or other updates to their website, respond with valid HTML that incorporates their changes. The HTML should start with <!DOCTYPE html>. OTHERWISE, respond conversationally to help them."},
                {"role": "user", "content": f"Current HTML: {current_html}\n\nUser message: {user_message}"}
            ],
            max_tokens=3000,
            temperature=0.5
        )
        
        assistant_response = response.choices[0].message.content.strip()
        
        # Check if the response looks like HTML
        if assistant_response.startswith("<!DOCTYPE html>") or "<html" in assistant_response[:100].lower():
            # It's HTML - clean it up, store it, and return it
            html_content = re.sub(r'^```(?:html)?|```$', '', assistant_response, flags=re.MULTILINE).strip()
            session['portfolio_html'] = html_content
            session.modified = True
            
            # Return both the HTML and a confirmation message
            return jsonify({
                "html": html_content,
                "response": "I've updated your portfolio based on your request. You can see the changes in the preview panel.",
                "has_portfolio": True
            }), 200
        else:
            # It's a conversational response
            return jsonify({
                "response": assistant_response,
                "has_portfolio": has_portfolio
            }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/get_portfolio', methods=['GET'])
def get_portfolio():
    """Get the current portfolio HTML from the session."""
    if 'portfolio_html' not in session:
        return jsonify({"error": "No portfolio has been generated yet"}), 404
    
    return jsonify({"html": session['portfolio_html']}), 200

@app.route('/save_conversation', methods=['POST', 'OPTIONS'])
def save_conversation():
    """Save the current conversation history to the session."""
    # Handle preflight OPTIONS request for CORS
    if request.method == 'OPTIONS':
        response = app.make_default_options_response()
        return response
        
    try:
        data = request.get_json()
        chat_history = data.get("chatHistory", [])
        
        if not chat_history:
            return jsonify({"error": "No chat history provided"}), 400
        
        # Store in session
        session['chat_history'] = chat_history
        session.modified = True
        
        return jsonify({"success": True}), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/get_conversation', methods=['GET'])
def get_conversation():
    """Get the current conversation history from the session."""
    if 'chat_history' not in session:
        # Return empty array instead of 404 error
        return jsonify({"chatHistory": []}), 200
    
    return jsonify({"chatHistory": session['chat_history']}), 200

# Additional function to debug sessions
@app.route('/debug_session', methods=['GET'])
def debug_session():
    """Debug endpoint to check session contents."""
    return jsonify({
        "has_portfolio": 'portfolio_html' in session,
        "has_chat_history": 'chat_history' in session,
        "session_keys": list(session.keys())
    }), 200

if __name__ == '__main__':
    app.run(debug=True)