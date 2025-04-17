import React, { useRef } from 'react';
import '../styles/ChatInterface.css';
// Import the icons (adjust paths as needed)
import uploadIcon from '../assets/upload.png';
import sendIcon from '../assets/up-arrow.png';

const ChatInterface = ({ chatInput, setChatInput, chatHistory, handleFileChange, handleSend, file }) => {
  // Create a reference to the hidden file input
  const fileInputRef = useRef(null);

  // Function to trigger the file input click
  const triggerFileInput = () => {
    fileInputRef.current.click();
  };
  
  const handleRemoveFile = () => {
    const changeEvent = { 
      target: { 
        files: [] 
      } 
    };
    handleFileChange(changeEvent);
  };

  return (
    <div className="chat-window">
      <div className="chat-header-container">
        <h2 className="chat-header">Chat with GitFolio</h2>
      </div>
      <div className="chat-history">
        {chatHistory.map((msg, index) => (
          <div key={index} className={`chat-message ${msg.sender}`}>
            <p className="chat-text">{msg.text}</p>
            {msg.file && <p className="chat-file"><em>Attached file: {msg.file}</em></p>}
          </div>
        ))}
      </div>
      <div className="chat-controls">
        <div className="chat-input-container">
          <textarea
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder="Start Chatting Now..."
            className="chat-textarea"
          />
        </div>
        
        <div className="chat-actions">
          <div className="chat-actions-left">
            {/* Hidden file input */}
            <input 
              type="file" 
              onChange={handleFileChange} 
              ref={fileInputRef}
              style={{ display: 'none' }} 
            />
            {/* Upload button */}
            <button 
              className="action-button file-button" 
              onClick={triggerFileInput}
              title="Attach File"
            >
              <img 
                src={uploadIcon} 
                alt="Upload file" 
                className="button-icon"
              />
            </button>
          </div>
          
          <div className="chat-actions-right">
            {/* Send button */}
            <button 
              className="action-button send-button" 
              onClick={handleSend}
              title="Send Message"
              disabled={chatInput.trim() === '' && !file}
            >
              <img 
                src={sendIcon} 
                alt="" 
                className="button-icon send-icon"
              />
            </button>
          </div>
        </div>
        
        {/* File indicator */}
        {file && (
          <div className="selected-file">
            <span className="file-indicator">
              <span className="file-name">{file.name}</span>
              <button 
                className="remove-file" 
                onClick={handleRemoveFile}
                title="Remove file"
              >
                ×
              </button>
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatInterface;