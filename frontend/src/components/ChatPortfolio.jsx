import React, { useState } from 'react';
import '../styles/ChatPortfolio.css';
import ChatInterface from './ChatInterface';
import PortfolioPreview from './PortfolioPreview';

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
    
    // Add the user's message to the chat history
    const newMessage = { 
      sender: 'user', 
      text: chatInput, 
      file: file ? file.name : null 
    };
    
    setChatHistory([...chatHistory, newMessage]);
    
    // Reset input field and file attachment
    setChatInput('');
    setFile(null);
  };

  // Check if user has interacted with the chat
  const hasInteracted = chatHistory.length > 0;

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
      <PortfolioPreview hasInteracted={hasInteracted} />
    </div>
  );
};

export default ChatPortfolio;