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

  const [portfolioPreviewUrl, setPortfolioPreviewUrl] = useState(null);

  const handleSend = async () => {
    if (!chatInput.trim() && !file) return;
  
    const newMessage = {
      sender: 'user',
      text: chatInput,
      file: file?.name || null,
    };
  
    setChatHistory([...chatHistory, newMessage]);
  
    if (file) {
      const formData = new FormData();
      formData.append('resume_file', file);
  
      try {
        const response = await fetch('http://localhost:5000/generate_portfolio', {
          method: 'POST',
          body: formData,
        });
  
        const result = await response.json();
  
        if (result.html) {
          // Dynamically create a blob URL to preview it
          const blob = new Blob([result.html], { type: 'text/html' });
          const previewURL = URL.createObjectURL(blob);
          setPortfolioPreviewUrl(previewURL);
        } else {
          console.error(result.error || result.warning);
        }
      } catch (error) {
        console.error('Upload failed:', error);
      }
    }
  
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