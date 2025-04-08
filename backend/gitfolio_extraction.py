from flask import Flask, request, jsonify
import openai
import os
from dotenv import load_dotenv
import math

# Load environment variables from a .env file
load_dotenv()

app = Flask(__name__)

# Securely load the OpenAI API key
openai.api_key = os.getenv("OPENAI_API_KEY")

def extract_portfolio_details(resume_text: str) -> dict:
    """
    Pre-process the resume text and send it to ChatGPT for extracting key portfolio details.
    """
    if not resume_text:
        return {"error": "No resume provided"}
    
    try:
        system_prompt = (
            "Extract key details from the resume for a portfolio. "
            "Return only the following details in order (each on a new line): "
            "Name, Job Title, Skills (comma-separated), and Projects (comma-separated)."
        )
        
        response = openai.ChatCompletion.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": resume_text}
            ],
            max_tokens=250,
            temperature=0.5
        )
        
        portfolio_data = response["choices"][0]["message"]["content"]
        return {"portfolio_data": portfolio_data}
    
    except openai.error.OpenAIError as e:
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
    data = request.get_json()
    resume_text = data.get("resume", "")
    result = extract_portfolio_details(resume_text)
    status = 400 if "error" in result else 200
    return jsonify(result), status

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
            "Give clear, concise suggestions to help improve the portfolio, but let the user decide."
        )
    }
    
    messages = [system_message] + conversation
    
    try:
        response = openai.ChatCompletion.create(
            model="gpt-4o-mini",
            messages=messages,
            max_tokens=150,
            temperature=0.7
        )
        suggestion = response["choices"][0]["message"]["content"]
        return jsonify({"suggestion": suggestion}), 200
    except openai.error.OpenAIError as e:
        return jsonify({"error": f"OpenAI API error: {str(e)}"}), 500

if __name__ == '__main__':
    app.run(debug=True)
