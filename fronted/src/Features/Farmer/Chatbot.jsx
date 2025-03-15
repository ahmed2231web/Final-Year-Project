import React, { useState, useEffect, useRef } from "react";
import { Paperclip, Send, X, Trash2, Image } from "lucide-react"; 
import { uploadImageForDetection, sendChatMessage } from "../../Services/apiChatbot";
import { toast } from "react-hot-toast";
import "../../Components/Chatbot/Chatbot.css";

function Chatbot() {
  // Load messages from localStorage on initial render
  const [messages, setMessages] = useState(() => {
    const savedMessages = localStorage.getItem('chatMessages');
    return savedMessages ? JSON.parse(savedMessages) : [
      { text: "Hello! How can I help you?", isBot: true }
    ];
  });
  
  const [inputMessage, setInputMessage] = useState("");
  const [image, setImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Load detected disease from localStorage
  const [detectedDisease, setDetectedDisease] = useState(() => {
    return localStorage.getItem('detectedDisease') || null;
  });
  
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const [selectedFileName, setSelectedFileName] = useState("");

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  // Save messages to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('chatMessages', JSON.stringify(messages));
  }, [messages]);
  
  // Save detected disease to localStorage whenever it changes
  useEffect(() => {
    if (detectedDisease) {
      localStorage.setItem('detectedDisease', detectedDisease);
    }
  }, [detectedDisease]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() && !image) return;

    // Add user message to chat
    const newMessage = { text: inputMessage || "I want to detect disease in this wheat plant.", image, isBot: false };
    setMessages((prev) => [...prev, newMessage]);

    // Clear input fields
    const userQuery = inputMessage;
    setInputMessage("");
    
    // If image was uploaded, process it for disease detection
    if (image) {
      await processImageForDiseaseDetection(image);
      setImage(null);
      setSelectedFileName("");
      return;
    }

    // If no disease detected yet, respond with prompt to upload image
    if (!detectedDisease) {
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          { 
            text: "Please upload an image of a wheat plant first so I can help you with specific disease information.", 
            isBot: true 
          }
        ]);
      }, 500);
      return;
    }

    // For text messages when disease is already detected
    if (detectedDisease) {
      await processChatMessage(userQuery);
    }
  };

  const processImageForDiseaseDetection = async (imageData) => {
    setIsLoading(true);
    
    // Add loading message
    setMessages((prev) => [...prev, { text: "Analyzing your image...", isBot: true, isLoading: true }]);
    
    try {
      // Convert base64 to file object
      const imageFile = await base64ToFile(imageData, "wheat_plant.jpg");
      
      // Upload image for disease detection
      const result = await uploadImageForDetection(imageFile);
      
      // Remove loading message
      setMessages((prev) => prev.filter(msg => !msg.isLoading));
      
      // Store detected disease for future conversation
      setDetectedDisease(result.disease);
      
      // Add response from AI
      setMessages((prev) => [
        ...prev, 
        { 
          text: result.response,
          isBot: true,
          diseaseInfo: {
            name: result.disease,
            confidence: result.confidence,
            isHealthy: result.is_healthy
          }
        }
      ]);
      
    } catch (error) {
      // Remove loading message
      setMessages((prev) => prev.filter(msg => !msg.isLoading));
      
      // Add error message
      setMessages((prev) => [
        ...prev, 
        { 
          text: "Sorry, I had trouble analyzing that image. Please try again or upload a clearer image.",
          isBot: true
        }
      ]);
      
      console.error("Error processing image:", error);
      toast.error("Failed to process image");
    } finally {
      setIsLoading(false);
    }
  };

  const processChatMessage = async (userQuery) => {
    setIsLoading(true);
    
    // Add loading message
    setMessages((prev) => [...prev, { text: "Thinking...", isBot: true, isLoading: true }]);
    
    try {
      // Send chat message to continue conversation
      const result = await sendChatMessage(detectedDisease, userQuery);
      
      // Remove loading message
      setMessages((prev) => prev.filter(msg => !msg.isLoading));
      
      // Add response from AI
      setMessages((prev) => [...prev, { text: result.response, isBot: true }]);
      
    } catch (error) {
      // Remove loading message
      setMessages((prev) => prev.filter(msg => !msg.isLoading));
      
      // Add error message
      setMessages((prev) => [
        ...prev, 
        { 
          text: "Sorry, I encountered an error while processing your question. Please try again.",
          isBot: true
        }
      ]);
      
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Validate file is an image
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }
    
    // Show toast notification for successful selection
    toast.success(`Selected image: ${file.name}`);
    setSelectedFileName(file.name);
    
    // Read the file as data URL
    const reader = new FileReader();
    reader.onload = (event) => {
      setImage(event.target.result);
    };
    reader.onerror = () => {
      toast.error('Error reading file');
    };
    reader.readAsDataURL(file);
  };
  
  // Helper function to convert base64 to file
  const base64ToFile = (dataUrl, filename) => {
    return new Promise((resolve, reject) => {
      try {
        const arr = dataUrl.split(',');
        const mime = arr[0].match(/:(.*?);/)[1];
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        
        while (n--) {
          u8arr[n] = bstr.charCodeAt(n);
        }
        
        const file = new File([u8arr], filename, { type: mime });
        resolve(file);
      } catch (error) {
        reject(error);
      }
    });
  };
  
  // Helper function to format text with markdown-like syntax
  const formatMessage = (text) => {
    if (!text) return "";
    
    // Replace **text** with <strong>text</strong> for bold formatting
    return text.split(/(\*\*.*?\*\*)/).map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        // Extract the text between ** and render it as bold
        const boldText = part.substring(2, part.length - 2);
        return <strong key={index}>{boldText}</strong>;
      }
      return part;
    });
  };

  // Clear chat history function
  const clearChatHistory = () => {
    setMessages([{ text: "Hello! How can I help you?", isBot: true }]);
    setDetectedDisease(null);
    localStorage.removeItem('chatMessages');
    localStorage.removeItem('detectedDisease');
  };

  return (
    <div className="h-[calc(100vh-90px)] flex flex-col bg-gray-50 overflow-hidden">
      {/* Header */}
      <header className="text-3xl font-bold text-gray-800 p-6 flex justify-between items-center">
        <span>AI CHATBOT</span>
        <button
          type="button"
          onClick={clearChatHistory}
          className="flex items-center text-sm text-red-600 hover:text-red-800 px-3 py-1 rounded-md hover:bg-red-50"
        >
          <Trash2 size={16} className="mr-1" />
          Clear Chat
        </button>
      </header>

      {/* Messages Container */}
      <main className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-100">
        {messages.map((message, index) => (
          <div key={index} className={`flex ${message.isBot ? "justify-start" : "justify-end"}`}>
            <div
              className={`max-w-[75%] rounded-lg p-3 ${
                message.isBot
                  ? "bg-white text-gray-800 shadow"
                  : "bg-green-600 text-white"
              }`}
            >
              {message.image && (
                <div className="mb-2">
                  <img
                    src={message.image}
                    alt="Uploaded"
                    className="max-w-full rounded"
                    style={{ maxHeight: "200px" }}
                  />
                </div>
              )}
              <p className="whitespace-pre-wrap">
                {message.isBot ? formatMessage(message.text) : message.text}
              </p>
              
              {message.diseaseInfo && (
                <div className="mt-2 pt-2 border-t border-gray-200">
                  <p className="font-semibold">
                    {message.diseaseInfo.isHealthy 
                      ? '✅ Healthy plant detected' 
                      : `🔍 Detected: ${message.diseaseInfo.name}`}
                  </p>
                  <p className="text-sm text-gray-600">
                    Confidence: {(message.diseaseInfo.confidence * 100).toFixed(2)}%
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </main>

      {/* Input Area */}
      <form
        onSubmit={handleSendMessage}
        className="p-4 bg-white border-t border-gray-200 flex flex-col"
      >
        <div className="flex items-center space-x-2">
          <div className="relative">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className={`p-2 rounded-full hover:bg-gray-100 text-gray-500 disabled:opacity-50 ${image ? 'bg-green-50 text-green-600' : ''}`}
              disabled={isLoading}
              title="Upload image"
            >
              {image ? <Image className="h-5 w-5" /> : <Paperclip className="h-5 w-5" />}
            </button>
            {image && (
              <div className="absolute -top-1 -right-1 h-3 w-3 bg-green-500 rounded-full border border-white"></div>
            )}
          </div>
          
          {/* Small preview tooltip that appears on hover */}
          {image && (
            <div className="flex items-center bg-gray-50 rounded-md px-2 py-1 max-w-[150px] border border-gray-200">
              <div className="w-6 h-6 mr-1 flex-shrink-0">
                <img 
                  src={image} 
                  alt="Preview" 
                  className="w-full h-full object-cover rounded"
                />
              </div>
              <span className="text-xs text-gray-600 truncate">{selectedFileName}</span>
              <button
                type="button"
                onClick={() => {
                  setImage(null);
                  setSelectedFileName("");
                }}
                className="ml-1 text-gray-400 hover:text-red-500"
              >
                <X size={12} />
              </button>
            </div>
          )}
          
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageUpload}
            className="hidden"
            accept="image/*"
            key={image ? "reset" : "default"} // Force re-render of input when image is cleared
          />
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            className="p-2 rounded-full bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
            disabled={isLoading || (!inputMessage.trim() && !image)}
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </form>
    </div>
  );
}

export default Chatbot;
