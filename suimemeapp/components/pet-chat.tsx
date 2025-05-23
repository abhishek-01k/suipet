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
  const [showScrollButton, setShowScrollButton] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

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

  // Smart auto-scroll: only scroll to bottom if user is already near bottom
  useEffect(() => {
    const container = chatContainerRef.current;
    if (container) {
      const isNearBottom = container.scrollTop >= container.scrollHeight - container.clientHeight - 100;
      if (isNearBottom) {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        setShowScrollButton(false);
      } else {
        setShowScrollButton(true);
      }
    }
  }, [messages]);

  // Handle scroll to check if user scrolled up
  const handleScroll = () => {
    const container = chatContainerRef.current;
    if (container) {
      const isNearBottom = container.scrollTop >= container.scrollHeight - container.clientHeight - 100;
      setShowScrollButton(!isNearBottom);
    }
  };

  // Manual scroll to bottom
  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    setShowScrollButton(false);
  };

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
        <h3 className="text-xl font-bold text-black">Chat with {petName}</h3>
        <div className="bg-gray-100 px-3 py-1 rounded-full border-2 border-black">
          <span className="text-black font-medium">Mood: {renderMoodEmoji()}</span>
        </div>
      </div>
      
      <div className="border-2 border-gray-300 rounded-lg bg-gray-50 h-96 flex flex-col relative">
        <div className="flex-1 overflow-y-auto p-4 max-h-80" style={{ scrollBehavior: 'smooth' }} ref={chatContainerRef} onScroll={handleScroll}>
          {messages.map((message) => (
            <div 
              key={message.id} 
              className={`mb-4 ${message.sender === 'user' ? 'text-right' : 'text-left'}`}
            >
              <div 
                className={`inline-block max-w-[80%] px-4 py-2 rounded-lg ${
                  message.sender === 'user' 
                    ? 'bg-purple-500 text-white rounded-tr-none border-2 border-purple-700' 
                    : 'bg-white text-black rounded-tl-none border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)]'
                }`}
              >
                <span className="font-medium text-sm md:text-base">{message.content}</span>
              </div>
              <div className="text-xs text-gray-600 mt-1 font-medium">
                {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="text-left mb-4">
              <div className="inline-block bg-white text-black px-4 py-2 rounded-lg rounded-tl-none border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)]">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-700 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-gray-700 rounded-full animate-bounce" style={{ animationDelay: '200ms' }}></div>
                  <div className="w-2 h-2 bg-gray-700 rounded-full animate-bounce" style={{ animationDelay: '400ms' }}></div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={chatEndRef} />
        </div>

        {/* Scroll to bottom button */}
        {showScrollButton && (
          <button
            onClick={scrollToBottom}
            className="absolute bottom-20 right-4 bg-purple-500 text-white p-2 rounded-full border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.5)] hover:bg-purple-600 transition-all z-10"
            title="Scroll to bottom"
          >
            ↓
          </button>
        )}
        
        {/* Suggested responses */}
        <div className="px-3 py-2 border-t-2 border-gray-300 flex flex-wrap gap-2 bg-gray-100">
          {suggestedResponses.map((response, index) => (
            <button
              key={index}
              onClick={() => handleSendMessage(response)}
              className="bg-white text-black text-sm border-2 border-black rounded-full px-3 py-1 hover:bg-gray-100 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)] transition-all font-medium"
            >
              {response}
            </button>
          ))}
        </div>
        
        <div className="border-t-2 border-gray-300 p-3 flex bg-gray-100">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Type a message..."
            className="flex-1 bg-white border-2 border-black rounded-lg px-3 py-2 mr-2 text-black font-medium placeholder-gray-500"
          />
          <Button 
            onClick={() => handleSendMessage()}
            disabled={!input.trim() || isTyping}
            className="bg-purple-500 hover:bg-purple-600 text-white font-bold border-2 border-black"
          >
            Send
          </Button>
        </div>
      </div>
      
      <div className="mt-3 text-sm text-gray-700 bg-gray-100 p-3 rounded-lg border-2 border-gray-300">
        <p className="font-medium">
          <strong className="text-black">Note:</strong> {petName}'s AI personality is based on its type ({petType}) and the {petMemecoin.symbol} memecoin traits.
        </p>
      </div>
    </div>
  );
} 