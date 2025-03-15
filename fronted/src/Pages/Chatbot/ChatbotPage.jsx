import React from 'react';
import Chatbot from '../../Components/Chatbot/Chatbot';
import { useNavigate } from 'react-router-dom';
import './ChatbotPage.css';

/**
 * ChatbotPage component that displays the AI Chatbot for wheat disease detection
 * This page provides a dedicated space for users to interact with the AI assistant
 */
const ChatbotPage = () => {
    const navigate = useNavigate();
    
    return (
        <div className="chatbot-page">
            <div className="chatbot-page-header">
                <button 
                    className="back-button"
                    onClick={() => navigate(-1)}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M19 12H5M12 19l-7-7 7-7"/>
                    </svg>
                    Back
                </button>
                <h1>Wheat Disease Detection Assistant</h1>
            </div>
            
            <div className="chatbot-page-content">
                <div className="chatbot-info">
                    <h2>How to Use the AI Assistant</h2>
                    <ul>
                        <li>Upload a photo of your wheat plant using the attachment button</li>
                        <li>The AI will analyze the image and detect any diseases</li>
                        <li>Ask follow-up questions about the detected disease</li>
                        <li>Get recommendations for treatment and prevention</li>
                    </ul>
                    <div className="chatbot-note">
                        <p><strong>Note:</strong> For best results, upload clear images of wheat plants showing the affected areas. The AI can detect healthy plants, leaf rust, crown and root rot, and loose smut.</p>
                    </div>
                </div>
                
                <div className="chatbot-wrapper">
                    <Chatbot />
                </div>
            </div>
        </div>
    );
};

export default ChatbotPage;
