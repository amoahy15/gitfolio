import React, { useState } from 'react';
import '../styles/ChatPortfolio.css';
import ChatInterface from './ChatInterface';
import PortfolioPreview from './PortfolioPreview';

const ChatPortfolio = () => {
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [file, setFile] = useState(null);
  const [generatedHtml, setGeneratedHtml] = useState('');
  const [hasInteracted, setHasInteracted] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSend = async () => {
    try {
      if (file) {
        const formData = new FormData();
        formData.append('resume_file', file);
  
        const response = await fetch('http://127.0.0.1:5000/generate_portfolio', {
          method: 'POST',
          body: formData,
        });
  
        const result = await response.json();
        if (result.html) {
          setGeneratedHtml(result.html);
          setHasInteracted(true);
        } else {
          alert("Portfolio generation failed.");
        }
      } else {
        const updatedChat = [...chatHistory, { sender: 'user', text: chatInput }];
        const response = await fetch('http://127.0.0.1:5000/chat_portfolio', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ conversation: updatedChat }),
        });
  
        const result = await response.json();
        setChatHistory([
          ...updatedChat,
          { sender: 'bot', text: result.suggestion || 'No response' },
        ]);
      }
  
      setChatInput('');
      setFile(null);
    } catch (err) {
      console.error("Fetch error:", err);
      alert("Failed to contact backend. Make sure Flask is running.");
    }
  };

  return (
    <div className="chat-portfolio-container">
      <ChatInterface 
        chatInput={chatInput}
        setChatInput={setChatInput}
        chatHistory={chatHistory}
        handleFileChange={handleFileChange}
        handleSend={handleSend}
        file={file}
      />
      <PortfolioPreview hasInteracted={hasInteracted} generatedHtml={generatedHtml} />
    </div>
  );
};

export default ChatPortfolio;
