from flask import Flask, request, jsonify, session
from flask_cors import CORS
from openai import OpenAI
import os
import PyPDF2
import docx
import json
import re
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask_session import Session
from dotenv import load_dotenv
# Load environment variables from a .env file
load_dotenv()

app = Flask(__name__)
# Configure server-side session
app.config["SESSION_TYPE"] = "filesystem"
app.config["SECRET_KEY"] = os.environ.get("SECRET_KEY", "dev-secret-key")
Session(app)

# Securely load the OpenAI API key
client = OpenAI(api_key = os.environ.get("OPENAI_API_KEY"))
CORS(app, resources={r"/*": {"origins": ["http://localhost:3000", "https://amoahy15.github.io"]}})

def extract_portfolio_details(resume_text: str) -> dict:
    """
    Pre-process the resume text and send it to ChatGPT for extracting key portfolio details.
    """
    if not resume_text:
        return {"error": "No resume provided"}
    
    try:
        system_prompt = (
            "Extract key details from the resume text and return only valid JSON with the following structure. "
            "All fields must be included, even if empty. For 'experience', include key roles, company names, and bullet points of responsibilities or achievements. For 'projects', include the project name, the skills used, and bullet points of information about the project:\n\n"
            "{\n"
            "  \"name\": string,\n"
            "  \"link(s)\": [string],\n"
            "  \"education\": [string],\n"
            "  \"coursework\": [string],\n"
            "  \"skills\": [string],\n"
            "  \"projects\": [string],\n"
            "  \"experience\": [string]\n"
            "}"
        )
        
        response = client.chat.completions.create(
            model="ft:gpt-4o-mini-2024-07-18:gitfolio::BO7w5BdR",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": resume_text}
            ],
            max_tokens=1000,
            temperature=0.5
        )
        
        portfolio_data = response.choices[0].message.content.strip()
        portfolio_data = re.sub(r"```(?:json)?\n?(.*?)```", r"\1", portfolio_data, flags=re.DOTALL).strip()
        portfolio_data = re.sub(r",\s*(\}|\])", r"\1", portfolio_data)
        try: 
            portfolio_json = json.loads(portfolio_data)
            return portfolio_json
        except json.JSONDecodeError:
            return {"raw_response": portfolio_data, "warning": "Could not parse JSON"}
        
    except Exception as e:
        return {"error": f"OpenAI API error: {str(e)}"}
    
    
def generate_portfolio_html(portfolio_data: dict) -> dict:
    """
    Generate an HTML portfolio page using GPT based on extracted portfolio data.
    Returns a dictionary with either the HTML or an error message.
    """
    if "error" in portfolio_data:
        return {"error": "Invalid input data: " + portfolio_data["error"]}
    
    try:
        system_prompt = (
            "You are a friendly personal assistant for building a web portfolio. "
            "You provide thoughtful, non-pushy suggestions based on the user's input and the needs of the computer science job market. "
            "Take the following JSON data extracted from a resume and generate an HTML file to create a web portfolio."
        )

        user_input = json.dumps(portfolio_data, indent=2)

        response = client.chat.completions.create(
            model="ft:gpt-4o-mini-2024-07-18:gitfolio::BO7w5BdR",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_input}
            ],
            max_tokens=3000,
            temperature=0.4
        )

        html_content = response.choices[0].message.content.strip()
        html_content = re.sub(r'^```(?:html)?|```$', '', html_content.strip(), flags=re.MULTILINE).strip()
        if not html_content.startswith("<!DOCTYPE html>"):
            return {"error": "Unexpected response format", "raw_response": html_content}
        
        return {"html": html_content}

    except Exception as e:
        return {"error": f"OpenAI API error: {str(e)}"}

def update_portfolio_html(user_request: str, current_portfolio_html: str, portfolio_data: dict) -> dict:
    """
    Update the existing HTML portfolio based on user's chat request.
    Returns a dictionary with the updated HTML or an error message.
    """
    if not current_portfolio_html:
        return {"error": "No existing portfolio to update"}
    
    try:
        system_prompt = (
            "You are a friendly personal assistant for building a web portfolio. "
            "You help users update their portfolio based on their requests. "
            "The user wants to update their existing portfolio HTML. "
            "You should modify the HTML to incorporate their requested changes while maintaining the overall structure. "
            "Return ONLY the complete updated HTML file with no additional text before or after."
        )

        context = (
            f"Here is the portfolio data extracted from the user's resume:\n"
            f"{json.dumps(portfolio_data, indent=2)}\n\n"
            f"Here is the current HTML portfolio:\n"
            f"{current_portfolio_html}\n\n"
            f"The user wants this change: {user_request}"
        )

        response = client.chat.completions.create(
            model="ft:gpt-4o-mini-2024-07-18:gitfolio::BO7w5BdR",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": context}
            ],
            max_tokens=3000,
            temperature=0.4
        )

        updated_html = response.choices[0].message.content.strip()
        updated_html = re.sub(r'^```(?:html)?|```$', '', updated_html.strip(), flags=re.MULTILINE).strip()
        
        if not updated_html.startswith("<!DOCTYPE html>"):
            return {"error": "Unexpected response format", "raw_response": updated_html}
        
        return {"html": updated_html}

    except Exception as e:
        return {"error": f"OpenAI API error: {str(e)}"}

@app.route('/')
def home():
    return "GitFolio Portfolio Generator API"

limiter = Limiter(
    app=app,
    key_func=get_remote_address,
    default_limits=["200 per day", "50 per hour"]
)

@app.route('/generate_portfolio', methods=['POST'])
@limiter.limit("10/minute")
def generate_portfolio():
    """
    Endpoint that receives a resume via POST, processes it with ChatGPT,
    and returns the extracted portfolio details.
    """
    MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB Maximum
    if request.content_length > MAX_FILE_SIZE:
        return jsonify({"error": "File size exceeds 10MB limit"}), 413

    data = request.files.get('resume_file')
    if not data or data.filename == '':
        return jsonify({"error": "No file selected"}), 400
    
    try:
        # Extract text from the resume file
        if(data.filename.endswith('.pdf')):
            reader = PyPDF2.PdfReader(data)
            resume_text = ' '.join(page.extract_text() for page in reader.pages if page.extract_text())
        elif data.filename.endswith('.txt'):
            resume_text = data.read().decode('utf-8')
        elif data.filename.endswith('.docx'):
            doc = docx.Document(data)
            resume_text = "\n".join([para.text for para in doc.paragraphs])
        else:
            return jsonify({"error": "Unsupported file type"}), 400
        
        # Extract portfolio details
        result = extract_portfolio_details(resume_text)
        if "error" in result:
            return jsonify(result), 400
        
        # Generate HTML portfolio
        portfolio = generate_portfolio_html(result)
        status = 400 if "error" in portfolio else 200
        
        # Store the portfolio data and HTML in the session
        session['portfolio_data'] = result
        if "html" in portfolio:
            session['portfolio_html'] = portfolio["html"]
        
        # Initialize conversation history
        session['conversation'] = [
            {"role": "system", "content": "You are a friendly personal assistant for building a web portfolio. You provide thoughtful, non-pushy suggestions based on the user's input and the needs of the computer science job market."},
            {"role": "assistant", "content": "Thanks for uploading your resume! I've created a portfolio based on the information you provided. Is there anything specific you'd like to change or improve in the portfolio?"}
        ]
        
        return jsonify(portfolio), status
    
    except Exception as e:
        return jsonify({"error": f"Failed to process file: {str(e)}"}), 500


@app.route('/chat_portfolio', methods=['POST'])
@limiter.limit("20/minute")
def chat_portfolio():
    """
    Endpoint that allows the user to interact with the portfolio assistant.
    The user sends their message and receives a response based on the conversation history.
    """
    try:
        data = request.get_json()
        
        # Get the user's message
        user_message = data.get("message", "")
        update_portfolio = data.get("update_portfolio", False)
        
        if not user_message:
            return jsonify({"error": "No message provided"}), 400
        
        # Check if we have a conversation history in the session
        if 'conversation' not in session:
            # Initialize with system prompt if this is a new conversation
            session['conversation'] = [
                {"role": "system", "content": "You are a friendly personal assistant for building a web portfolio. You provide thoughtful, non-pushy suggestions based on the user's input and the needs of the computer science job market."}
            ]
        
        # Add the user's message to the conversation
        conversation = session['conversation']
        conversation.append({"role": "user", "content": user_message})
        
        # Determine if we need portfolio context
        portfolio_context = ""
        if 'portfolio_data' in session:
            portfolio_context = "The user has already uploaded a resume and I've extracted the following information:\n"
            portfolio_context += json.dumps(session['portfolio_data'], indent=2)
            
            if 'portfolio_html' in session:
                portfolio_context += "\n\nAnd generated this HTML portfolio:\n"
                # Only add a brief snippet to avoid token limits
                portfolio_context += session['portfolio_html'][:500] + "... (HTML continues)"
        
        # Variable to track if portfolio was updated
        portfolio_updated = False
        
        # Try to update the portfolio if requested and we have the necessary data
        if update_portfolio and 'portfolio_html' in session and 'portfolio_data' in session:
            # Check if the message contains a request to update the portfolio
            update_indicators = [
                "change", "update", "modify", "add", "remove", "edit", "adjust", 
                "different", "replace", "switch", "improve", "enhance", "fix"
            ]
            
            # Only attempt to update if the message seems like an update request
            should_update = any(indicator in user_message.lower() for indicator in update_indicators)
            
            if should_update:
                # Try to update the portfolio
                portfolio_update = update_portfolio_html(
                    user_message, 
                    session['portfolio_html'], 
                    session['portfolio_data']
                )
                
                if "html" in portfolio_update:
                    # Update was successful, store the new HTML
                    session['portfolio_html'] = portfolio_update["html"]
                    portfolio_updated = True
        
        # Prepare system message with context
        system_message = {
            "role": "system", 
            "content": (
                "You are a friendly personal assistant for building a web portfolio. "
                "You provide thoughtful, non-pushy suggestions based on the user's input and the needs of the computer science job market. "
                f"{portfolio_context}"
            )
        }
        
        # Create messages for the API call
        messages = [system_message] + conversation[1:] if len(conversation) > 1 else [system_message, conversation[0]]
        
        # Generate response
        response = client.chat.completions.create(
            model="ft:gpt-4o-mini-2024-07-18:gitfolio::BO7w5BdR",
            messages=messages,
            max_tokens=500,
            temperature=0.7
        )
        
        assistant_response = response.choices[0].message.content
        
        # If portfolio was updated, acknowledge this in the response
        if portfolio_updated and "I've updated" not in assistant_response:
            if "I'll" in assistant_response and "update" in assistant_response:
                # Already talking about updates in future tense, change to past tense
                assistant_response = assistant_response.replace("I'll", "I've")
            else:
                # Add acknowledgment to the beginning of the response
                assistant_response = "I've updated your portfolio with those changes. " + assistant_response
        
        # Add the assistant's response to the conversation history
        conversation.append({"role": "assistant", "content": assistant_response})
        
        # Keep only the last 10 messages to avoid excessive history
        if len(conversation) > 12:  # System prompt + 10 exchanges
            conversation = [conversation[0]] + conversation[-10:]
        
        # Update the session
        session['conversation'] = conversation
        
        return jsonify({
            "response": assistant_response,
            "has_portfolio": 'portfolio_html' in session,
            "portfolio_updated": portfolio_updated
        }), 200
        
    except Exception as e:
        return jsonify({"error": f"Chat API error: {str(e)}"}), 500

@app.route('/get_portfolio', methods=['GET'])
def get_portfolio():
    """
    Endpoint to retrieve the generated portfolio HTML
    """
    if 'portfolio_html' not in session:
        return jsonify({"error": "No portfolio has been generated yet"}), 404
    
    return jsonify({"html": session['portfolio_html']}), 200

@app.route('/clear_session', methods=['POST'])
def clear_session():
    """
    Endpoint to clear the current session and start fresh
    """
    session.clear()
    return jsonify({"message": "Session cleared successfully"}), 200

if __name__ == '__main__':
    app.run(debug=True)