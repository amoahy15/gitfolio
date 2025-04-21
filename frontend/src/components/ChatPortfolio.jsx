import React, { useState, useEffect } from 'react';
import '../styles/ChatPortfolio.css';
import ChatInterface from './ChatInterface';
import PortfolioPreview from './PortfolioPreview';

const ChatPortfolio = () => {
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [file, setFile] = useState(null);
  const [generatedHtml, setGeneratedHtml] = useState('');
  const [hasPortfolio, setHasPortfolio] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typingMessage, setTypingMessage] = useState('');
  const [fullResponse, setFullResponse] = useState('');
  const [typeIndex, setTypeIndex] = useState(0);

  // Handle the realistic typing effect
  useEffect(() => {
    if (isTyping && fullResponse) {
      if (typeIndex < fullResponse.length) {
        // Set a random typing speed between 20ms and 60ms for realism
        const randomDelay = Math.floor(Math.random() * 40) + 20;
        
        const timer = setTimeout(() => {
          // Add the next character to the displayed message
          setTypingMessage(prev => prev + fullResponse.charAt(typeIndex));
          setTypeIndex(prevIndex => prevIndex + 1);
        }, randomDelay);
        
        return () => clearTimeout(timer);
      } else {
        // Typing is complete - NOW add the message to chat history
        setIsTyping(false);
        setChatHistory(prevHistory => [
          ...prevHistory, 
          {
            sender: 'bot',
            text: fullResponse,
            isTyping: false
          }
        ]);
        
        // Reset the typing state
        setFullResponse('');
        setTypingMessage('');
        setTypeIndex(0);
      }
    }
  }, [isTyping, fullResponse, typeIndex, typingMessage]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
    } else {
      setFile(null);
    }
  };

  // Function to fetch the latest portfolio HTML
  const fetchCurrentPortfolio = async () => {
    try {
      const portfolioResponse = await fetch('http://127.0.0.1:5000/get_portfolio');
      if (portfolioResponse.ok) {
        const portfolioData = await portfolioResponse.json();
        setGeneratedHtml(portfolioData.html);
        setHasPortfolio(true);
      }
    } catch (err) {
      console.error("Error fetching updated portfolio:", err);
    }
  };

  const handleSend = async () => {
    if ((!chatInput.trim() && !file) || isTyping) return;
    
    // Create new message from user
    const newUserMessage = { 
      sender: 'user', 
      text: chatInput,
      file: file ? file.name : null
    };
    
    // Add user message to chat history
    const updatedChatHistory = [...chatHistory, newUserMessage];
    setChatHistory(updatedChatHistory);
    
    // Set typing to true to show the typing indicator
    setIsTyping(true);
    setTypingMessage('');
    setTypeIndex(0);
    
    try {
      if (file) {
        // Handle file upload and portfolio generation
        const formData = new FormData();
        formData.append('resume_file', file);
        
        // Set generating state to true to show spinner
        setIsGenerating(true);
        
        const response = await fetch('http://127.0.0.1:5000/generate_portfolio', {
          method: 'POST',
          body: formData,
        });
  
        const result = await response.json();
        
        // Portfolio generation complete
        setIsGenerating(false);
        
        if (response.ok && result.html) {
          setGeneratedHtml(result.html);
          setHasPortfolio(true);
          
          // Set the response to be typed out
          setFullResponse('Your portfolio has been generated! You can view it in the preview panel. Is there anything specific you\'d like to change or improve?');
        } else {
          // Handle error
          setFullResponse(`Failed to generate portfolio: ${result.error || 'Unknown error'}`);
        }
      } else {
        // Regular chat message processing - simulate a delay like real chat APIs
        await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
        
        // Make API call
        const response = await fetch('http://127.0.0.1:5000/chat_portfolio', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            message: chatInput,
            update_portfolio: true  // Add this flag to indicate we want to update the portfolio
          }),
        });
  
        const result = await response.json();
        
        // Set the response to be typed out
        setFullResponse(result.response || 'Sorry, I couldn\'t process your request.');
        
        // Check if portfolio was updated and fetch the latest version
        if (result.portfolio_updated) {
          // Fetch the updated portfolio HTML
          await fetchCurrentPortfolio();
        }
        
        // Update portfolio state if the backend indicates we have one
        if (result.has_portfolio && !hasPortfolio) {
          // Fetch the portfolio HTML if we don't already have it
          await fetchCurrentPortfolio();
        }
      }
  
      // Clear input and file after sending
      setChatInput('');
      setFile(null);
    } catch (err) {
      console.error("Fetch error:", err);
      
      // Set error message for typing
      setFullResponse('Failed to contact the server. Make sure Flask is running.');
      
      // Reset generating state if it was on
      setIsGenerating(false);
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
        isTyping={isTyping}
        typingMessage={typingMessage}
      />
      <PortfolioPreview 
        hasPortfolio={hasPortfolio} 
        generatedHtml={generatedHtml} 
        isGenerating={isGenerating}
      />
    </div>
  );
};

export default ChatPortfolio;