import React, { useState } from 'react';
import '../styles/ChatPortfolio.css';

const ChatPortfolio = () => {
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [file, setFile] = useState(null);

  const handleInputChange = (e) => {
    setChatInput(e.target.value);
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSend = () => {
    if (chatInput.trim() === '' && !file) return;
    
    // Integrate the ChatGPT API and file processing.
    // Currently, it simply addss the user's message (and filename if attached) to the chat history.
    const newMessage = { sender: 'user', text: chatInput, file: file ? file.name : null };
    setChatHistory([...chatHistory, newMessage]);
    
    // Reset the input field and file attachment.
    setChatInput('');
    setFile(null);
  };

  return (
    <div className="chat-portfolio-container">
      <div className="chat-window">
        <h2>Chat with GitFolio</h2>
        <div className="chat-history">
          {chatHistory.map((msg, index) => (
            <div key={index} className={`chat-message ${msg.sender}`}>
              <p>{msg.text}</p>
              {msg.file && <p className="file-info"><em>Attached file: {msg.file}</em></p>}
            </div>
          ))}
        </div>
        <div className="chat-input-area">
          <textarea
            value={chatInput}
            onChange={handleInputChange}
            placeholder="Enter your requirements here..."
          />
          <input type="file" onChange={handleFileChange} />
          <button onClick={handleSend}>Send</button>
        </div>
      </div>
      <div className="preview-window">
        <h2>Portfolio Preview</h2>
        <iframe
          title="Portfolio Preview"
          src="http://localhost:3000/gitfolio"
          width="100%"
          height="100%"
          frameBorder="0"
        ></iframe>
      </div>
    </div>
  );
};

export default ChatPortfolio;
