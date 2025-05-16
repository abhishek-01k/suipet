import React, { useState } from 'react';
import { useWallet } from '../hooks/useWallet';
import { petInteractionTransaction } from '../lib/contractInteraction';
import { toast } from 'react-toastify';

interface PetInteractionProps {
  petId: string;
  onInteractionComplete: () => void;
}

export default function PetInteraction({ petId, onInteractionComplete }: PetInteractionProps) {
  const { executeTransaction, isTransacting } = useWallet();
  const [interactionType, setInteractionType] = useState<'feed' | 'play' | 'train' | null>(null);
  
  const handleInteraction = async (action: 'feed' | 'play' | 'train') => {
    setInteractionType(action);
    
    try {
      const tx = petInteractionTransaction(petId, action);
      const result = await executeTransaction(tx);
      
      if (result) {
        let message = '';
        switch (action) {
          case 'feed':
            message = '🍖 Pet has been fed! Health increased.';
            break;
          case 'play':
            message = '🎾 Had fun playing! Happiness increased.';
            break;
          case 'train':
            message = '💪 Training complete! Experience gained.';
            break;
        }
        
        toast.success(message);
        onInteractionComplete();
      }
    } catch (error) {
      console.error(`Error during ${action}:`, error);
      toast.error(`Failed to ${action} pet: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setInteractionType(null);
    }
  };
  
  return (
    <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-lg p-6 mb-6">
      <h3 className="text-xl font-bold mb-4">Interact with Your Pet</h3>
      <div className="grid grid-cols-3 gap-4">
        <button
          onClick={() => handleInteraction('feed')}
          disabled={isTransacting}
          className={`
            py-3 px-4 border-4 border-black rounded-lg font-bold
            ${isTransacting && interactionType === 'feed' 
              ? 'bg-gray-200 opacity-70' 
              : 'bg-green-400 hover:bg-green-500 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all'}
          `}
        >
          {isTransacting && interactionType === 'feed' ? 'Feeding...' : '🍖 Feed'}
        </button>
        
        <button
          onClick={() => handleInteraction('play')}
          disabled={isTransacting}
          className={`
            py-3 px-4 border-4 border-black rounded-lg font-bold
            ${isTransacting && interactionType === 'play' 
              ? 'bg-gray-200 opacity-70' 
              : 'bg-blue-400 hover:bg-blue-500 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all'}
          `}
        >
          {isTransacting && interactionType === 'play' ? 'Playing...' : '🎾 Play'}
        </button>
        
        <button
          onClick={() => handleInteraction('train')}
          disabled={isTransacting}
          className={`
            py-3 px-4 border-4 border-black rounded-lg font-bold
            ${isTransacting && interactionType === 'train' 
              ? 'bg-gray-200 opacity-70' 
              : 'bg-purple-400 hover:bg-purple-500 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all'}
          `}
        >
          {isTransacting && interactionType === 'train' ? 'Training...' : '💪 Train'}
        </button>
      </div>
      
      <div className="mt-4 text-sm">
        <p className="text-gray-600">
          <strong>Feed:</strong> Increases health but gives less experience.
        </p>
        <p className="text-gray-600">
          <strong>Play:</strong> Increases happiness and gives moderate experience.
        </p>
        <p className="text-gray-600">
          <strong>Train:</strong> Gives the most experience but decreases health and happiness.
        </p>
      </div>
    </div>
  );
} 