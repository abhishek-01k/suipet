import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Button } from './ui/8bit/button';
import { getAIResponse, generatePetPersonality } from '@/lib/aiPersonality';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'pet';
  timestamp: number;
}

interface PetChatProps {
  petId: string;
  petName: string;
  petType: number;
  petMemecoin: {
    name: string;
    symbol: string;
  };
}

export default function PetChat({ petId, petName, petType, petMemecoin }: PetChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: `Hi there! I'm ${petName}, your ${petMemecoin.symbol} pet. How can I help you today?`,
      sender: 'pet',
      timestamp: Date.now()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [mood, setMood] = useState<'happy' | 'neutral' | 'excited'>('neutral');
  const [suggestedResponses, setSuggestedResponses] = useState<string[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Generate suggested responses based on pet personality
  useEffect(() => {
    const personality = generatePetPersonality(petType, petMemecoin.symbol);
    setSuggestedResponses([
      `Tell me about ${petMemecoin.symbol}`,
      `Can we go on a mission?`,
      `What activities do you like?`,
      `How can I help you level up?`
    ]);
  }, [petType, petMemecoin.symbol]);

  // Update mood based on recent messages
  useEffect(() => {
    if (messages.length > 1) {
      const lastPetMessage = [...messages].reverse().find(m => m.sender === 'pet');
      if (lastPetMessage) {
        if (lastPetMessage.content.includes('!')) {
          setMood('excited');
        } else if (lastPetMessage.content.includes('happy') || lastPetMessage.content.includes('love') || lastPetMessage.content.includes('play')) {
          setMood('happy');
        } else {
          setMood('neutral');
        }
      }
    }
  }, [messages]);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle sending a message
  const handleSendMessage = async (messageText: string = input) => {
    if (!messageText.trim()) return;
    
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: messageText,
      sender: 'user',
      timestamp: Date.now()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);
    
    // Get AI response using the personality service
    setTimeout(() => {
      const aiResponse = getAIResponse(petName, petType, petMemecoin.symbol, messageText);
      
      const petMessage: Message = {
        id: Date.now().toString(),
        content: aiResponse,
        sender: 'pet',
        timestamp: Date.now()
      };
      
      setMessages(prev => [...prev, petMessage]);
      setIsTyping(false);
    }, 1500);
  };

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Render mood emoji
  const renderMoodEmoji = () => {
    switch (mood) {
      case 'happy':
        return '😊';
      case 'excited':
        return '🤩';
      default:
        return '😐';
    }
  };

  return (
    <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-lg p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold">Chat with {petName}</h3>
        <div className="bg-gray-100 px-3 py-1 rounded-full border-2 border-black">
          Mood: {renderMoodEmoji()}
        </div>
      </div>
      
      <div className="border-2 border-gray-300 rounded-lg bg-gray-50 h-64 flex flex-col">
        <div className="flex-1 overflow-y-auto p-4">
          {messages.map((message) => (
            <div 
              key={message.id} 
              className={`mb-4 ${message.sender === 'user' ? 'text-right' : 'text-left'}`}
            >
              <div 
                className={`inline-block max-w-[80%] px-4 py-2 rounded-lg ${
                  message.sender === 'user' 
                    ? 'bg-purple-500 text-white rounded-tr-none' 
                    : 'bg-gray-200 text-gray-800 rounded-tl-none border-2 border-black'
                }`}
              >
                {message.content}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="text-left mb-4">
              <div className="inline-block bg-gray-200 text-gray-800 px-4 py-2 rounded-lg rounded-tl-none border-2 border-black">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '200ms' }}></div>
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '400ms' }}></div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={chatEndRef} />
        </div>
        
        {/* Suggested responses */}
        <div className="px-3 py-2 border-t-2 border-gray-300 flex flex-wrap gap-2">
          {suggestedResponses.map((response, index) => (
            <button
              key={index}
              onClick={() => handleSendMessage(response)}
              className="bg-gray-100 text-sm border-2 border-gray-300 rounded-full px-3 py-1 hover:bg-gray-200 hover:border-gray-400"
            >
              {response}
            </button>
          ))}
        </div>
        
        <div className="border-t-2 border-gray-300 p-3 flex">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Type a message..."
            className="flex-1 bg-white border-2 border-black rounded-lg px-3 py-2 mr-2"
          />
          <Button 
            onClick={() => handleSendMessage()}
            disabled={!input.trim() || isTyping}
          >
            Send
          </Button>
        </div>
      </div>
      
      <div className="mt-3 text-sm text-gray-600">
        <p>
          <strong>Note:</strong> {petName}'s AI personality is based on its type ({petType}) and the {petMemecoin.symbol} memecoin traits.
        </p>
      </div>
    </div>
  );
} 