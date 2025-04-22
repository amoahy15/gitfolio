import React, { useState, useEffect, useRef } from 'react';
import '../styles/ChatPortfolio.css';
import ChatInterface from './ChatInterface';
import PortfolioPreview from './PortfolioPreview';

// Get API URL from environment variable or use default
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:5000';

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
  const [error, setError] = useState(null);
  
  // Refs for typing effect
  const typingTimerRef = useRef(null);
  const isCanceledRef = useRef(false);

  // Load existing portfolio and conversation history on mount
  useEffect(() => {
    const loadExistingData = async () => {
      try {
        console.log('Loading existing data...');
        
        // Load portfolio
        const portfolioResponse = await fetch(`${API_BASE_URL}/get_portfolio`, {
          credentials: 'include'
        });
        
        if (portfolioResponse.ok) {
          const portfolioData = await portfolioResponse.json();
          if (portfolioData.html) {
            console.log('Found existing portfolio');
            setGeneratedHtml(portfolioData.html);
            setHasPortfolio(true);
          }
        }
        
        // Load conversation history
        const historyResponse = await fetch(`${API_BASE_URL}/get_conversation`, {
          credentials: 'include'
        });
        
        if (historyResponse.ok) {
          const historyData = await historyResponse.json();
          if (historyData.chatHistory && historyData.chatHistory.length > 0) {
            console.log('Found existing conversation history');
            setChatHistory(historyData.chatHistory);
          }
        }
      } catch (err) {
        console.error('Error loading existing data:', err);
      }
    };
    
    loadExistingData();
  }, []);

  // Save conversation history when it changes
  useEffect(() => {
    const saveConversationHistory = async () => {
      if (chatHistory.length === 0) return;
      
      try {
        await fetch(`${API_BASE_URL}/save_conversation`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chatHistory }),
          credentials: 'include'
        });
        console.log('Conversation history saved');
      } catch (err) {
        console.error('Error saving conversation history:', err);
      }
    };
    
    saveConversationHistory();
  }, [chatHistory]);

  // Handle typing effect
  useEffect(() => {
    if (isTyping && fullResponse) {
      if (typingTimerRef.current) {
        clearTimeout(typingTimerRef.current);
      }
      
      if (typeIndex < fullResponse.length && !isCanceledRef.current) {
        const randomDelay = Math.floor(Math.random() * 40) + 20;
        
        typingTimerRef.current = setTimeout(() => {
          setTypingMessage(prev => prev + fullResponse.charAt(typeIndex));
          setTypeIndex(prevIndex => prevIndex + 1);
        }, randomDelay);
        
        return () => {
          if (typingTimerRef.current) {
            clearTimeout(typingTimerRef.current);
          }
        };
      } else {
        setIsTyping(false);
        setIsGenerating(false); // Make sure to set isGenerating to false when typing is done
        const finalText = isCanceledRef.current ? typingMessage : fullResponse;
        
        if (finalText.trim().length > 0) {
          setChatHistory(prevHistory => [
            ...prevHistory, 
            {
              sender: 'bot',
              text: finalText
            }
          ]);
        }
        
        setFullResponse('');
        setTypingMessage('');
        setTypeIndex(0);
        isCanceledRef.current = false;
      }
    }
  }, [isTyping, fullResponse, typeIndex, typingMessage]);

  // Handle file change
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
    } else {
      setFile(null);
    }
  };
  
  // Handle cancel typing
  const handleCancelTyping = () => {
    isCanceledRef.current = true;
    
    if (typingTimerRef.current) {
      clearTimeout(typingTimerRef.current);
    }
    
    setIsTyping(false);
    setIsGenerating(false); // Also stop generating state when typing is canceled
    
    if (typingMessage.trim().length > 0) {
      setChatHistory(prevHistory => [
        ...prevHistory, 
        {
          sender: 'bot',
          text: typingMessage + " (Message interrupted)"
        }
      ]);
    }
    
    setFullResponse('');
    setTypingMessage('');
    setTypeIndex(0);
  };

  // Handle send message
  const handleSend = async () => {
    if ((!chatInput.trim() && !file) || isTyping) return;
    
    const currentInput = chatInput.trim();
    setChatInput('');
    setError(null);
    
    const newUserMessage = { 
      sender: 'user', 
      text: currentInput,
      file: file ? file.name : null
    };
    
    setChatHistory(prevHistory => [...prevHistory, newUserMessage]);
    
    setIsTyping(true);
    setTypingMessage('');
    setTypeIndex(0);
    isCanceledRef.current = false;
    
    // Check if the user is asking for styling changes or other portfolio updates
    const isPortfolioUpdateRequest = currentInput.toLowerCase().includes('change') || 
                                    currentInput.toLowerCase().includes('update') || 
                                    currentInput.toLowerCase().includes('modify') || 
                                    currentInput.toLowerCase().includes('style') || 
                                    currentInput.toLowerCase().includes('color') ||
                                    currentInput.toLowerCase().includes('font') ||
                                    currentInput.toLowerCase().includes('add') ||
                                    currentInput.toLowerCase().includes('remove');
    
    // Set the generating state for file uploads or potential portfolio updates
    if (file || (hasPortfolio && isPortfolioUpdateRequest)) {
      setIsGenerating(true);
    }
    
    try {
      if (file) {
        // Handle file upload
        const formData = new FormData();
        formData.append('resume_file', file);
        
        const response = await fetch(`${API_BASE_URL}/generate_portfolio`, {
          method: 'POST',
          body: formData,
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.html) {
          console.log('Portfolio generated successfully');
          setGeneratedHtml(result.html);
          setHasPortfolio(true);
          setFullResponse('Your portfolio has been generated! You can view it in the preview panel. Is there anything specific you\'d like to change or improve?');
        } else {
          setError(result.error || 'Failed to generate portfolio');
          setFullResponse(`Failed to generate portfolio: ${result.error || 'Unknown error'}`);
          setIsGenerating(false);
        }
      } else {
        // Handle chat message
        console.log('Sending chat message');
        
        const response = await fetch(`${API_BASE_URL}/chat_portfolio`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: currentInput }),
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('Chat response received:', result);
        
        if (isCanceledRef.current) {
          setIsGenerating(false);
          return;
        }
        
        // If HTML was returned, update the preview
        if (result.html) {
          console.log('HTML received in response');
          setGeneratedHtml(result.html);
          setHasPortfolio(true);
        } else if (hasPortfolio && isPortfolioUpdateRequest) {
          setIsGenerating(false);
        }
        
        setFullResponse(result.response || 'Sorry, I couldn\'t process your request.');
      }
  
      setFile(null);
    } catch (err) {
      console.error("Error:", err);
      
      if (!isCanceledRef.current) {
        const errorMessage = err.message.includes('timed out') 
          ? 'Request timed out. Please try again.' 
          : 'Failed to contact the server. Please try again.';
        
        setError(errorMessage);
        setFullResponse(errorMessage);
        setIsGenerating(false);
      }
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
        handleCancelTyping={handleCancelTyping}
      />
      <PortfolioPreview 
        hasPortfolio={hasPortfolio} 
        generatedHtml={generatedHtml} 
        isGenerating={isGenerating}
        error={error}
      />
    </div>
  );
};

export default ChatPortfolio;