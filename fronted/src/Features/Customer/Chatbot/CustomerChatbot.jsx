import React, { useState, useRef, useEffect } from 'react';
import { FaPaperPlane, FaRobot, FaUser, FaSpinner, FaLeaf, FaTrash } from 'react-icons/fa';
import { initChatSession, sendMessageStream } from '../../../Services/apiCustomerChatbot';
import { toast } from 'react-hot-toast';

const CustomerChatbot = () => {
  // Get user ID from localStorage (stored during login)
  const userId = localStorage.getItem('userId') || 'guest';
  const chatStorageKey = `agrobot_chat_${userId}`;
  
  // Clear any potentially corrupted chat history on component mount
  useEffect(() => {
    // Check if the stored chat history is valid
    try {
      const savedMessages = localStorage.getItem(chatStorageKey);
      if (savedMessages) {
        const parsedMessages = JSON.parse(savedMessages);
        // If we have invalid or duplicate messages, clear the history
        if (!Array.isArray(parsedMessages) || parsedMessages.length === 0) {
          localStorage.removeItem(chatStorageKey);
        }
      }
    } catch (error) {
      console.error('Error parsing chat history, clearing it:', error);
      localStorage.removeItem(chatStorageKey);
    }
  }, [chatStorageKey]);
  
  // Load messages from localStorage on initial render with user-specific key
  const [messages, setMessages] = useState(() => {
    try {
      const savedMessages = localStorage.getItem(chatStorageKey);
      if (savedMessages) {
        const parsedMessages = JSON.parse(savedMessages);
        if (Array.isArray(parsedMessages) && parsedMessages.length > 0) {
          return parsedMessages;
        }
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
    
    // Default initial message if nothing valid in localStorage
    return [{ 
      sender: 'bot', 
      text: 'Hello! How can I help you with your agricultural needs today?' 
    }];
  });
  
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatSession, setChatSession] = useState(null);
  const inputRef = useRef(null);

  // Initialize chat session on component mount
  useEffect(() => {
    const initializeChat = async () => {
      try {
        const session = initChatSession();
        setChatSession(session);
        console.log("Chat session initialized successfully");
      } catch (error) {
        console.error('Error initializing chat session:', error);
        setMessages(prev => [
          ...prev, 
          { 
            sender: 'bot', 
            text: 'Sorry, I had trouble connecting. Please try again later.'
          }
        ]);
      }
    };
    
    initializeChat();
  }, []);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(chatStorageKey, JSON.stringify(messages));
    }
  }, [messages, chatStorageKey]);

  // Focus input field when component mounts
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading || !chatSession) return;

    const userMessage = input.trim();
    setInput('');
    
    // Add user message to chat
    setMessages(prev => [...prev, { sender: 'user', text: userMessage }]);
    
    // Add temporary bot message
    setMessages(prev => [...prev, { sender: 'bot', text: '', isTyping: true }]);
    
    setIsLoading(true);

    try {
      // Accumulate the response text
      let responseText = '';
      
      // Stream the response and update the bot message as chunks arrive
      await sendMessageStream(
        chatSession,
        userMessage,
        (chunk) => {
          responseText += chunk;
          setMessages(prev => {
            const newMessages = [...prev];
            const lastMessage = newMessages[newMessages.length - 1];
            if (lastMessage.sender === 'bot' && lastMessage.isTyping) {
              lastMessage.text = responseText;
            }
            return newMessages;
          });
        }
      );

      // Update the last message to remove typing indicator
      setMessages(prev => {
        const newMessages = [...prev];
        const lastMessage = newMessages[newMessages.length - 1];
        if (lastMessage.sender === 'bot' && lastMessage.isTyping) {
          lastMessage.isTyping = false;
        }
        return newMessages;
      });
    } catch (error) {
      console.error('Error getting response from Gemini:', error);
      setMessages(prev => {
        const newMessages = [...prev];
        const lastMessage = newMessages[newMessages.length - 1];
        if (lastMessage.sender === 'bot' && lastMessage.isTyping) {
          lastMessage.text = 'Sorry, I encountered an error. Please try again.';
          lastMessage.isTyping = false;
        }
        return newMessages;
      });
      
      toast.error('Failed to get response from AgroBot');
    } finally {
      setIsLoading(false);
    }
  };

  // Format message content with line breaks
  const formatMessage = (content) => {
    if (!content) return "";
    
    // Handle line breaks
    const withLineBreaks = content.split('\n').map((line, i) => (
      <React.Fragment key={i}>
        {line}
        {i < content.split('\n').length - 1 && <br />}
      </React.Fragment>
    ));
    
    return withLineBreaks;
  };
  
  // Clear chat history function
  const clearChatHistory = () => {
    // Clear localStorage first to prevent duplicate messages
    localStorage.removeItem(chatStorageKey);
    
    setMessages([
      { 
        sender: 'bot', 
        text: 'Chat history cleared. How can I help you today?'
      }
    ]);
    toast.success('Chat history cleared');
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-lg overflow-hidden border border-green-200">
      <div className="bg-green-600 text-white p-4 flex items-center justify-between">
        <div className="flex items-center">
          <FaLeaf className="text-2xl mr-2" />
          <h2 className="text-xl font-semibold">AgroBot Assistant</h2>
        </div>
        <button
          onClick={clearChatHistory}
          className="text-white hover:text-red-100 flex items-center text-sm"
          title="Clear chat history"
        >
          <FaTrash className="mr-1" />
          Clear Chat
        </button>
      </div>
      
      <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
        {messages.map((message, index) => (
          <div 
            key={index} 
            className={`flex mb-4 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div 
              className={`
                max-w-[80%] p-3 rounded-lg shadow-sm
                ${message.sender === 'user' 
                  ? 'bg-green-500 text-white rounded-tr-none' 
                  : 'bg-white border border-gray-200 rounded-tl-none'}
              `}
            >
              <div className="flex items-center mb-1">
                {message.sender === 'user' ? (
                  <>
                    <span className="font-medium">You</span>
                    <FaUser className="ml-2 text-xs" />
                  </>
                ) : (
                  <>
                    <span className="font-medium text-green-600">AgroBot</span>
                    <FaRobot className="ml-2 text-xs text-green-600" />
                  </>
                )}
              </div>
              <div className={`${message.isTyping ? 'animate-pulse' : ''} whitespace-pre-wrap`}>
                {formatMessage(message.text)}
                {message.isTyping && (
                  <span className="inline-block ml-1 animate-pulse">▌</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <form onSubmit={handleSubmit} className="p-3 border-t border-gray-200 bg-white">
        <div className="flex items-center">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about crops, farming techniques, or agricultural advice..."
            className="flex-1 p-3 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            disabled={isLoading || !chatSession}
          />
          <button
            type="submit"
            className={`
              p-3 rounded-r-lg text-white transition-colors duration-200 flex items-center justify-center w-12
              ${isLoading || !chatSession || !input.trim()
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700'}
            `}
            disabled={isLoading || !chatSession || !input.trim()}
          >
            {isLoading ? <FaSpinner className="animate-spin" /> : <FaPaperPlane />}
          </button>
        </div>
        {!chatSession && (
          <p className="text-red-500 text-sm mt-2">
            Connecting to AI service... If this persists, please refresh the page.
          </p>
        )}
      </form>
    </div>
  );
};

export default CustomerChatbot;
