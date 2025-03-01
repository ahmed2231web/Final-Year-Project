import React, { useState, useEffect, useRef } from "react";
import { Paperclip, Send } from "lucide-react"; // Icons for upload and send

function Chatbot() {
  const [messages, setMessages] = useState([
    { text: "Hello! How can I help you?", isBot: true }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [image, setImage] = useState(null);
  const messagesEndRef = useRef(null);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputMessage.trim() && !image) return;

    const newMessage = { text: inputMessage, image, isBot: false };
    setMessages((prev) => [...prev, newMessage]);

    // Simulated bot response after 1s
    setTimeout(() => {
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: "I'm a demo chatbot. This is a simulated response.", isBot: true }
      ]);
    }, 1000);

    // Clear input fields
    setInputMessage("");
    setImage(null);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImage(reader.result);
      reader.readAsDataURL(file);
    }
  };
  
  return (
    <div className="h-[calc(100vh-90px)] flex flex-col bg-gray-50 overflow-hidden">
      {/* Header */}
      <header className="text-3xl font-bold text-gray-800 p-6">
        AI CHATBOT
      </header>

      {/* Messages Container */}
      <main className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-100">
        {messages.map((message, index) => (
          <div key={index} className={`flex ${message.isBot ? "justify-start" : "justify-end"}`}>
            <div
              className={`max-w-[80%] px-4 py-2 rounded-lg text-sm ${
                message.isBot
                  ? "bg-white text-gray-800 shadow-sm"
                  : "bg-green-500 text-white shadow-md"
              }`}
            >
              {message.text}
              {message.image && (
                <img src={message.image} alt="Uploaded" className="mt-2 max-w-xs rounded-lg" />
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef}></div>
      </main>

      {/* Footer */}
      <footer className="p-4 border-t bg-white">
        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
          {/* Upload Icon */}
          <label className="cursor-pointer text-green-600 hover:text-green-700">
            <Paperclip className="w-6 h-6" />
            <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
          </label>

          {/* Text Input */}
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 border rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
          />

          {/* Image Preview (Small) */}
          {image && (
            <div className="relative w-12 h-12">
              <img src={image} alt="Preview" className="w-full h-full rounded-lg" />
              <button
                type="button"
                onClick={() => setImage(null)}
                className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center"
              >
                ×
              </button>
            </div>
          )}

          {/* Send Button */}
          <button
            type="submit"
            className="bg-green-500 text-white p-2 rounded-full hover:bg-green-600 transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </footer>
    </div>
  );
}

export default Chatbot;
