from flask import Flask, request, jsonify
from openai import OpenAI
import os
from dotenv import load_dotenv
import PyPDF2
import docx
import json
import re
# Load environment variables from a .env file
load_dotenv()

app = Flask(__name__)
client = OpenAI(api_key = os.environ.get("OPENAI_API_KEY"))

# Securely load the OpenAI API key


def extract_portfolio_details(resume_text: str) -> dict:
    """
    Pre-process the resume text and send it to ChatGPT for extracting key portfolio details.
    """
    if not resume_text:
        return {"error": "No resume provided"}
    
    try:
        system_prompt = (
            "Extract key details from the resume for a portfolio. "
            "Return **only** valid JSON with the following fields:\n\n "
            "{\n"
            "  \"name\": string,\n"
            "  \"job_title\": string,\n"
            "  \"skills\": [string],\n"
            "  \"projects\": [string],\n"
            "  \"work_experience\": [string]\n"
            "}"
        )
        
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": resume_text}
            ],
            max_tokens=250,
            temperature=0.5
        )
        
        portfolio_data = response.choices[0].message.content.strip()
        portfolio_data = re.sub(r"^```(json)?|```$", "", portfolio_data.strip())
        try: 
            portfolio_json = json.loads(portfolio_data)
            return portfolio_json
        except json.JSONDecodeError:
            return {"raw_response": portfolio_data, "warning": "Could not parse JSON"}
        
    except Exception as e:
        return {"error": f"OpenAI API error: {str(e)}"}

@app.route('/')
def home():
    return "home page"

@app.route('/generate_portfolio', methods=['POST'])
def generate_portfolio():
    """
    Endpoint that receives a resume via POST, processes it with ChatGPT,
    and returns the extracted portfolio details.
    """
    
    data = request.files['resume_file']
    if data.filename == '':
        return jsonify({"error": "No file selected"}), 400
    try:
        if(data.filename.endswith('.pdf')):
            reader = PyPDF2.PdfReader(data)
            resume_text = ' '.join(page.extract_text() for page in reader.pages if page.extract_text())
        elif data.filename.endswith('.txt'):
            resume_text = data.read().decode('utf-8')
        elif data.filename.endswith('.docx'):
            doc = docx.Document(data)
            resume_text = "\n".join([para.text for para in doc.paragrahs])
        else:
            return jsonify({"error": "Unsupported file type"}), 400
        
        result = extract_portfolio_details(resume_text)
        status = 400 if "error" in result else 200
        return jsonify(result), status
    
    except Exception as e:
        jsonify({"error": f"Failed to process file: {str(e)}"}), 500

@app.route('/chat_portfolio', methods=['POST'])
def chat_portfolio():
    """
    Endpoint that allows the user to interact with the portfolio assistant.
    The user sends the conversation history (as a list of message objects)
    and receives a suggestion based on their preferences.
    """
    data = request.get_json()
    # The conversation should be a list of messages, e.g.:
    # [{"role": "user", "content": "I want a more modern design."}, ...]
    conversation = data.get("conversation", [])
    if not conversation:
        conversation = []
    
    # System prompt to set the behavior of the chatbot assistant.
    system_message = {
        "role": "system", 
        "content": (
            "You are a friendly personal assistant for building a web portfolio. "
            "You provide thoughtful, non-pushy suggestions based on the user's input and the needs of the computer science job market. "
            "Once the user gives you their resume, generate an html file to create a portfolio"
            "Give clear, concise suggestions to help improve the portfolio, but let the user decide."
        )
    }
    
    messages = [system_message] + conversation
    
    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=messages,
            max_tokens=150,
            temperature=0.7
        )
        suggestion = response.choices[0].message.content
        return jsonify({"suggestion": suggestion}), 200
    except Exception as e:
        return jsonify({"error": f"OpenAI API error: {str(e)}"}), 500
    
if __name__ == '__main__':
    app.run(debug=True)
