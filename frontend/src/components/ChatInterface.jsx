import React, { useRef, useEffect } from 'react';
import '../styles/ChatInterface.css';
// Import the icons (adjust paths as needed)
import uploadIcon from '../assets/upload.png';
import sendIcon from '../assets/up-arrow.png';

const ChatInterface = ({ 
  chatInput, 
  setChatInput, 
  chatHistory, 
  handleFileChange, 
  handleSend, 
  file, 
  isTyping,
  typingMessage
}) => {
  // Create a reference to the hidden file input and chat history
  const fileInputRef = useRef(null);
  const chatHistoryRef = useRef(null);
  const textareaRef = useRef(null);

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

  // Handle form submission when pressing Enter (but allow shift+enter for new lines)
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Auto-expand the textarea as the user types
  const autoResizeTextarea = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  };

  // Auto-scroll to bottom when messages change or during typing
  useEffect(() => {
    if (chatHistoryRef.current) {
      chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
    }
  }, [chatHistory, typingMessage]);

  // Resize textarea on input change
  useEffect(() => {
    autoResizeTextarea();
  }, [chatInput]);

  return (
    <div className="chat-window">
      <div className="chat-header-container">
        <h2 className="chat-header">Chat with GitFolio</h2>
      </div>
      <div className="chat-history" ref={chatHistoryRef}>
        {chatHistory.length === 0 && !isTyping ? (
          <div className="empty-chat">
            <p>Upload your resume or start chatting to create your portfolio</p>
          </div>
        ) : (
          <div className="conversation-container">
            {/* Actual chat messages */}
            {chatHistory.map((msg, index) => (
              <div key={index} className={`message-group ${msg.sender}`}>
                <div className="message-role">
                  {msg.sender === 'user' ? 'You' : 'GitFolio'}
                </div>
                <div className="message-content">
                  <p>{msg.text}</p>
                  
                  {/* Show file attachment for user messages */}
                  {msg.file && (
                    <div className="message-file">
                      <span className="file-icon">📎</span>
                      <span>{msg.file}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {/* Show typing effect SEPARATE from chat history */}
            {isTyping && (
              <div className="message-group bot">
                <div className="message-role">GitFolio</div>
                <div className="message-content">
                  {typingMessage ? (
                    <p>{typingMessage}<span className="cursor-blink">|</span></p>
                  ) : (
                    <div className="typing-indicator">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      <div className="chat-controls">
        <div className="chat-input-container">
          <textarea
            ref={textareaRef}
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Send a message..."
            className="chat-textarea"
            rows="1"
            // Remove disabled property to allow typing while bot is responding
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
              accept=".pdf,.docx,.txt"
            />
            {/* Upload button */}
            <button
              className="action-button file-button"
              onClick={triggerFileInput}
              title="Upload Resume (PDF, DOCX, TXT)"
              disabled={isTyping}
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
              disabled={(chatInput.trim() === '' && !file) || isTyping}
            >
              <img
                src={sendIcon}
                alt="Send"
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
                disabled={isTyping}
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