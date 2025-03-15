import React, { useState, useRef, useEffect } from 'react';
import { uploadImageForDetection, sendChatMessage } from '../../Services/apiChatbot';
import { toast } from 'react-hot-toast';
import './Chatbot.css';

const Chatbot = () => {
    // State for messages, loading status, and detected disease
    const [messages, setMessages] = useState([
        { type: 'bot', text: 'Hello! How can I help you?' }
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const [detectedDisease, setDetectedDisease] = useState(null);
    const [inputMessage, setInputMessage] = useState('');
    
    // Refs for file input and message container
    const fileInputRef = useRef(null);
    const messagesEndRef = useRef(null);
    
    // Auto-scroll to bottom when messages change
    useEffect(() => {
        scrollToBottom();
    }, [messages]);
    
    // Function to scroll to bottom of messages
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };
    
    // Handle file selection for image upload
    const handleFileSelect = async (event) => {
        const file = event.target.files[0];
        if (!file) return;
        
        // Validate file is an image
        if (!file.type.startsWith('image/')) {
            toast.error('Please upload an image file');
            return;
        }
        
        // Add user message with image
        const imageUrl = URL.createObjectURL(file);
        setMessages(prev => [...prev, { 
            type: 'user', 
            text: 'I want to detect disease in this wheat plant.',
            image: imageUrl
        }]);
        
        // Show loading message
        setIsLoading(true);
        setMessages(prev => [...prev, { type: 'bot', text: 'Analyzing your image...', loading: true }]);
        
        try {
            // Upload image for disease detection
            const result = await uploadImageForDetection(file);
            
            // Remove loading message
            setMessages(prev => prev.filter(msg => !msg.loading));
            
            // Store detected disease for future conversation
            setDetectedDisease(result.disease);
            
            // Add response from AI
            setMessages(prev => [...prev, { 
                type: 'bot', 
                text: result.response,
                diseaseInfo: {
                    name: result.disease,
                    confidence: result.confidence,
                    isHealthy: result.is_healthy
                }
            }]);
            
        } catch (error) {
            // Remove loading message
            setMessages(prev => prev.filter(msg => !msg.loading));
            
            // Add error message
            setMessages(prev => [...prev, { 
                type: 'bot', 
                text: 'Sorry, I had trouble analyzing that image. Please try again or upload a clearer image.'
            }]);
            
            console.error('Error processing image:', error);
            toast.error('Failed to process image');
        } finally {
            setIsLoading(false);
        }
    };
    
    // Handle sending text message
    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!inputMessage.trim()) return;
        
        // Add user message
        setMessages(prev => [...prev, { type: 'user', text: inputMessage }]);
        
        // Clear input
        const userQuery = inputMessage;
        setInputMessage('');
        
        // If no disease detected yet, respond with generic message
        if (!detectedDisease) {
            setMessages(prev => [...prev, { 
                type: 'bot', 
                text: 'Please upload an image of a wheat plant first so I can help you with specific disease information.'
            }]);
            return;
        }
        
        // Show loading message
        setIsLoading(true);
        setMessages(prev => [...prev, { type: 'bot', text: 'Thinking...', loading: true }]);
        
        try {
            // Send chat message to continue conversation
            const result = await sendChatMessage(detectedDisease, userQuery);
            
            // Remove loading message
            setMessages(prev => prev.filter(msg => !msg.loading));
            
            // Add response from AI
            setMessages(prev => [...prev, { type: 'bot', text: result.response }]);
            
        } catch (error) {
            // Remove loading message
            setMessages(prev => prev.filter(msg => !msg.loading));
            
            // Add error message
            setMessages(prev => [...prev, { 
                type: 'bot', 
                text: 'Sorry, I encountered an error while processing your question. Please try again.'
            }]);
            
            console.error('Error sending message:', error);
            toast.error('Failed to send message');
        } finally {
            setIsLoading(false);
        }
    };
    
    // Trigger file input click
    const handleAttachmentClick = () => {
        fileInputRef.current.click();
    };
    
    return (
        <div className="chatbot-container">
            <div className="chatbot-header">
                <h2>AI CHATBOT</h2>
            </div>
            
            <div className="chatbot-messages">
                {messages.map((message, index) => (
                    <div key={index} className={`message ${message.type}`}>
                        {message.image && (
                            <div className="message-image">
                                <img src={message.image} alt="Uploaded wheat plant" />
                            </div>
                        )}
                        <div className="message-text">
                            {message.text}
                            {message.diseaseInfo && (
                                <div className="disease-info">
                                    <p className="disease-name">
                                        {message.diseaseInfo.isHealthy 
                                            ? '✅ Healthy plant detected' 
                                            : `🔍 Detected: ${message.diseaseInfo.name}`}
                                    </p>
                                    <p className="disease-confidence">
                                        Confidence: {(message.diseaseInfo.confidence * 100).toFixed(2)}%
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>
            
            <form className="chatbot-input" onSubmit={handleSendMessage}>
                <button 
                    type="button" 
                    className="attachment-button" 
                    onClick={handleAttachmentClick}
                    disabled={isLoading}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path>
                    </svg>
                </button>
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    style={{ display: 'none' }}
                    accept="image/*"
                />
                <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Type your message..."
                    disabled={isLoading}
                />
                <button 
                    type="submit" 
                    className="send-button"
                    disabled={isLoading || !inputMessage.trim()}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="22" y1="2" x2="11" y2="13"></line>
                        <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                    </svg>
                </button>
            </form>
        </div>
    );
};

export default Chatbot;
