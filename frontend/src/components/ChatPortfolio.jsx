import React, { useState, useEffect, useRef } from 'react';
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
  const [portfolioKey, setPortfolioKey] = useState(0); // Add a key to force re-rendering
  
  // Refs for managing the typing effect and cancellation
  const typingTimerRef = useRef(null);
  const isCanceledRef = useRef(false);
  const API_BASE_URL = 'http://127.0.0.1:5000'; // Extract as a constant

  // Handle the realistic typing effect
  useEffect(() => {
    if (isTyping && fullResponse) {
      // Clear any existing timeout
      if (typingTimerRef.current) {
        clearTimeout(typingTimerRef.current);
      }
      
      if (typeIndex < fullResponse.length && !isCanceledRef.current) {
        // Set a random typing speed between 20ms and 60ms for realism
        const randomDelay = Math.floor(Math.random() * 40) + 20;
        
        typingTimerRef.current = setTimeout(() => {
          // Add the next character to the displayed message
          setTypingMessage(prev => prev + fullResponse.charAt(typeIndex));
          setTypeIndex(prevIndex => prevIndex + 1);
        }, randomDelay);
        
        return () => {
          if (typingTimerRef.current) {
            clearTimeout(typingTimerRef.current);
          }
        };
      } else {
        // Typing is complete or cancelled - add the message to chat history
        setIsTyping(false);
        
        // If cancelled, we'll add what was typed so far
        // If completed normally, we'll add the full response
        const finalText = isCanceledRef.current ? typingMessage : fullResponse;
        
        if (finalText.trim().length > 0) {
          setChatHistory(prevHistory => [
            ...prevHistory, 
            {
              sender: 'bot',
              text: finalText,
              isTyping: false
            }
          ]);
        }
        
        // Reset the typing state
        setFullResponse('');
        setTypingMessage('');
        setTypeIndex(0);
        isCanceledRef.current = false; // Reset cancellation state
      }
    }
  }, [isTyping, fullResponse, typeIndex, typingMessage]);

  // We don't need to check for portfolio on component mount since we know it might
  // not exist yet and that's okay - removing the initial fetch to avoid 404 error
  // Let the normal workflow handle portfolio creation and updates

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
      console.log('Fetching current portfolio...');
      const portfolioResponse = await fetch(`${API_BASE_URL}/get_portfolio`, {
        credentials: 'include'  // Include cookies for session
      });
      
      if (portfolioResponse.ok) {
        const portfolioData = await portfolioResponse.json();
        console.log('Portfolio data received:', portfolioData);
        
        if (portfolioData.html) {
          console.log('Setting new HTML (length):', portfolioData.html.length);
          
          // Force a re-render by updating the key first
          setPortfolioKey(prevKey => prevKey + 1);
          
          // Then update the HTML content
          setGeneratedHtml(portfolioData.html);
          setHasPortfolio(true);
        } else {
          console.warn('No HTML in portfolio data:', portfolioData);
        }
      } else if (portfolioResponse.status === 404) {
        console.log('No portfolio exists yet (404 response)');
      } else {
        console.warn('Failed to fetch portfolio:', portfolioResponse.status);
      }
    } catch (err) {
      console.error("Error fetching updated portfolio:", err);
    }
  };
  // Handle cancelling the typing effect
  const handleCancelTyping = () => {
    // Mark as cancelled
    isCanceledRef.current = true;
    
    // Clear any existing timeout
    if (typingTimerRef.current) {
      clearTimeout(typingTimerRef.current);
      typingTimerRef.current = null;
    }
    
    // Force the typing effect to end immediately
    setIsTyping(false);
    
    // Add what was already typed to the chat history
    if (typingMessage.trim().length > 0) {
      setChatHistory(prevHistory => [
        ...prevHistory, 
        {
          sender: 'bot',
          text: typingMessage + " (Message interrupted)",
          isTyping: false
        }
      ]);
    }
    
    // Reset typing state
    setFullResponse('');
    setTypingMessage('');
    setTypeIndex(0);
  };

  const handleSend = async () => {
    if ((!chatInput.trim() && !file) || isTyping) return;
    
    // Store current input and clear the input field
    const currentInput = chatInput.trim();
    setChatInput('');
    
    // Create new message from user
    const newUserMessage = { 
      sender: 'user', 
      text: currentInput,
      file: file ? file.name : null
    };
    
    // Add user message to chat history
    const updatedChatHistory = [...chatHistory, newUserMessage];
    setChatHistory(updatedChatHistory);
    
    // Set typing indicators
    setIsTyping(true);
    setTypingMessage('');
    setTypeIndex(0);
    isCanceledRef.current = false;
    
    try {
      if (file) {
        // Handle file upload and portfolio generation
        const formData = new FormData();
        formData.append('resume_file', file);
        setIsGenerating(true);
        
        const response = await fetch(`${API_BASE_URL}/generate_portfolio`, {
          method: 'POST',
          body: formData,
          credentials: 'include',  // Include cookies for session
        });
  
        const result = await response.json();
        setIsGenerating(false);
        
        if (response.ok && result.html) {
          console.log('Setting generated HTML from upload (length):', result.html.length);
          setGeneratedHtml(result.html);
          setHasPortfolio(true);
          // Force a re-render of the preview
          setPortfolioKey(prevKey => prevKey + 1);
          
          setFullResponse('Your portfolio has been generated! You can view it in the preview panel. Is there anything specific you\'d like to change or improve?');
        } else {
          console.error('Portfolio generation failed:', result);
          setFullResponse(`Failed to generate portfolio: ${result.error || 'Unknown error'}`);
        }
      } else {
        // Regular chat message processing
        console.log('Sending chat message with update_portfolio=true');
        
        const response = await fetch(`${API_BASE_URL}/chat_portfolio`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',  // Include cookies for session
          body: JSON.stringify({ 
            message: currentInput,
            update_portfolio: true  // Try to update the portfolio if relevant
          }),
        });
  
        const result = await response.json();
        console.log('Chat response received:', result);
        
        if (isCanceledRef.current) return; // Exit if typing was cancelled
        
        setFullResponse(result.response || 'Sorry, I couldn\'t process your request.');
        
        // If portfolio was updated, fetch the latest version
        if (result.portfolio_updated) {
          console.log('Portfolio was updated, fetching latest version');
          await fetchCurrentPortfolio();
        }
      }
  
      setFile(null);
    } catch (err) {
      console.error("Fetch error:", err);
      
      if (!isCanceledRef.current) {
        setFullResponse('Failed to contact the server. Make sure Flask is running.');
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
        key={portfolioKey} // Add key to force re-render when portfolio updates
        hasPortfolio={hasPortfolio} 
        generatedHtml={generatedHtml} 
        isGenerating={isGenerating}
      />
    </div>
  );
};

export default ChatPortfolio;