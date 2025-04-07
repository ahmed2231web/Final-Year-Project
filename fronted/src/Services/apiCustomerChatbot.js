import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

/**
 * Service for interacting with Google's Gemini AI for customer chatbot functionality
 */

// API key from environment variables
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

// Initialize the Generative AI instance
const genAI = new GoogleGenerativeAI(apiKey);

// Generation configuration
const generationConfig = {
  temperature: 0.9,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 8192,
  responseMimeType: "text/plain",
};

// Safety settings to prevent harmful content
const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
];

/**
 * Initialize a new chat session with Gemini
 * @returns {Object} - Chat session object
 */
export const initChatSession = () => {
  try {
    console.log("Initializing chat session with API key:", apiKey);
    
    // Get the generative model
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-pro",
      generationConfig,
      safetySettings,
    });
    
    // Initialize chat history with a system message
    const chatSession = model.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: "You are AgroBot, an agricultural assistant for AgroConnect platform. Provide helpful, concise information about farming, crops, and agricultural practices. Keep responses brief and focused." }],
        },
        {
          role: "model",
          parts: [{ text: "I understand my role as AgroBot. I'll provide helpful agricultural information in a concise manner. How can I assist you today?" }],
        },
      ],
    });
    
    console.log("Chat session initialized successfully");
    return chatSession;
  } catch (error) {
    console.error("Error starting chat session:", error);
    throw error;
  }
};

/**
 * Send a message to the Gemini AI and get a response
 * @param {Object} chatSession - The chat session object
 * @param {string} message - The user's message
 * @param {function} onChunk - Optional callback function for each text chunk received
 * @returns {Promise<string>} - The complete response text
 */
export const sendMessageStream = async (chatSession, message, onChunk) => {
  if (!chatSession) {
    throw new Error("Chat session is not initialized");
  }

  try {
    console.log("Sending message to Gemini:", message);
    
    // Send message to the model
    const result = await chatSession.sendMessage(message);
    const response = result.response.text();
    
    console.log("Received response:", response);
    
    // If onChunk callback is provided, simulate streaming
    if (onChunk && typeof onChunk === 'function') {
      // Break the response into smaller chunks
      const chunks = response.match(/(.{1,20}(?:\s|$))/g) || [response];
      
      for (const chunk of chunks) {
        onChunk(chunk);
        // Small delay to simulate streaming
        await new Promise(resolve => setTimeout(resolve, 30));
      }
    }
    
    return response;
  } catch (error) {
    console.error("Error sending message to Gemini:", error);
    throw error;
  }
};

/**
 * Send a message to the Gemini AI and get a complete response
 * @param {Object} chatSession - The chat session object
 * @param {string} message - The user's message
 * @returns {Promise<string>} - The complete response text
 */
export const sendMessage = async (chatSession, message) => {
  if (!chatSession) {
    throw new Error("Chat session is not initialized");
  }

  try {
    const result = await chatSession.sendMessage(message);
    return result.response.text();
  } catch (error) {
    console.error("Error sending message to Gemini:", error);
    throw error;
  }
};
