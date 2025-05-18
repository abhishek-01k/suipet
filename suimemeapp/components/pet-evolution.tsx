import React, { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Button } from './ui/8bit/button';
import { Progress } from './ui/8bit/progress';
import { toast } from 'react-toastify';
import { useWallet } from '@/hooks/useWallet';
// Note: we would need to add this function to contractInteraction.ts
import { petEvolutionTransaction } from '@/lib/contractInteraction';

interface PetEvolutionProps {
  petId: string;
  petName: string;
  petType: number;
  petLevel: number;
  petExperience: number;
  petMemecoin: {
    name: string;
    symbol: string;
  };
  onEvolve?: () => void;
}

const EVOLUTION_STAGES = {
  0: { // Dog
    1: { name: 'Puppy', image: '/evolution/dog-1.png', requiredLevel: 1 },
    2: { name: 'Adult Dog', image: '/evolution/dog-2.png', requiredLevel: 10 },
    3: { name: 'Alpha Dog', image: '/evolution/dog-3.png', requiredLevel: 25 }
  },
  1: { // Cat
    1: { name: 'Kitten', image: '/evolution/cat-1.png', requiredLevel: 1 },
    2: { name: 'Adult Cat', image: '/evolution/cat-2.png', requiredLevel: 10 },
    3: { name: 'Master Cat', image: '/evolution/cat-3.png', requiredLevel: 25 }
  },
  2: { // Fish
    1: { name: 'Small Fish', image: '/evolution/fish-1.png', requiredLevel: 1 },
    2: { name: 'Medium Fish', image: '/evolution/fish-2.png', requiredLevel: 10 },
    3: { name: 'Legendary Fish', image: '/evolution/fish-3.png', requiredLevel: 25 }
  }
};

// Default evolution stages for custom or unknown types
const DEFAULT_EVOLUTION = {
  1: { name: 'Novice', image: '/evolution/default-1.png', requiredLevel: 1 },
  2: { name: 'Adept', image: '/evolution/default-2.png', requiredLevel: 10 },
  3: { name: 'Master', image: '/evolution/default-3.png', requiredLevel: 25 }
};

export default function PetEvolution({ 
  petId, 
  petName, 
  petType, 
  petLevel, 
  petExperience,
  petMemecoin,
  onEvolve 
}: PetEvolutionProps) {
  const { executeTransaction, isTransacting } = useWallet();
  
  // Get the current and next evolution stages
  const evolutionStages = EVOLUTION_STAGES[petType as keyof typeof EVOLUTION_STAGES] || DEFAULT_EVOLUTION;
  
  const getCurrentStage = () => {
    if (petLevel >= 25) return 3;
    if (petLevel >= 10) return 2;
    return 1;
  };
  
  const currentStage = getCurrentStage();
  const nextStage = currentStage < 3 ? currentStage + 1 : null;
  const currentEvolution = evolutionStages[currentStage as keyof typeof evolutionStages];
  const nextEvolution = nextStage ? evolutionStages[nextStage as keyof typeof evolutionStages] : null;
  
  // Check if pet can evolve
  const canEvolve = nextStage && petLevel >= (nextEvolution?.requiredLevel || 999);
  
  // Handle evolution
  const handleEvolve = async () => {
    if (!canEvolve) return;
    
    try {
      // Create the evolution transaction
      // Note: This function needs to be added to contractInteraction.ts
      const tx = petEvolutionTransaction({
        petId,
        currentStage,
        nextStage: nextStage || 0
      });
      
      // Execute the transaction
      const result = await executeTransaction(tx);
      
      if (result) {
        toast.success(`${petName} has evolved to ${nextEvolution?.name}!`);
        if (onEvolve) onEvolve();
      }
    } catch (error) {
      console.error("Error evolving pet:", error);
      toast.error(`Evolution failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };
  
  return (
    <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-lg p-6 mb-6">
      <h3 className="text-xl font-bold mb-4">Pet Evolution</h3>
      
      <div className="flex flex-col md:flex-row gap-6">
        {/* Current Stage */}
        <div className="flex-1">
          <div className="border-2 border-black rounded-lg p-4 bg-purple-50">
            <h4 className="font-bold text-center mb-2">Current Stage</h4>
            <div className="relative w-full h-48 flex items-center justify-center">
              {/* This would be a real image in production */}
              <div className="w-32 h-32 bg-gray-200 rounded-full border-4 border-purple-400 flex items-center justify-center text-4xl">
                {petType === 0 ? '🐕' : petType === 1 ? '🐈' : petType === 2 ? '🐟' : '🌟'}
              </div>
            </div>
            <div className="text-center mt-2">
              <p className="font-bold">{currentEvolution.name}</p>
              <p className="text-sm text-gray-600">Level {petLevel}</p>
            </div>
          </div>
        </div>
        
        {/* Evolution Progress */}
        <div className="flex-1 flex flex-col justify-center">
          {nextStage ? (
            <>
              <h4 className="font-bold mb-2">Evolution Progress</h4>
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span>Level {petLevel}</span>
                  <span>Level {nextEvolution?.requiredLevel}</span>
                </div>
                <Progress 
                  value={(petLevel / (nextEvolution?.requiredLevel || 1)) * 100}
                  className="h-3 border-2 border-black"
                  variant="default"
                />
              </div>
              
              <Button
                onClick={handleEvolve}
                disabled={!canEvolve || isTransacting}
                className={`w-full ${canEvolve ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-gray-300'}`}
              >
                {isTransacting ? 'Evolving...' : canEvolve ? 'Evolve Now!' : `Reach Level ${nextEvolution?.requiredLevel} to Evolve`}
              </Button>
              
              {canEvolve && (
                <p className="text-center text-sm mt-2 text-green-600">
                  Your pet is ready to evolve to the next stage!
                </p>
              )}
            </>
          ) : (
            <div className="text-center p-6 border-2 border-gray-200 rounded-lg">
              <p className="text-lg font-bold mb-2">Maximum Evolution Reached!</p>
              <p className="text-gray-600">
                Your pet has reached the highest evolution stage possible.
              </p>
            </div>
          )}
        </div>
        
        {/* Next Stage */}
        {nextStage && (
          <div className="flex-1">
            <div className={`border-2 border-black rounded-lg p-4 ${canEvolve ? 'bg-yellow-50' : 'bg-gray-50'}`}>
              <h4 className="font-bold text-center mb-2">Next Stage</h4>
              <div className="relative w-full h-48 flex items-center justify-center">
                {/* This would be a real image in production */}
                <div className={`w-32 h-32 bg-gray-200 rounded-full border-4 ${canEvolve ? 'border-yellow-400' : 'border-gray-400'} flex items-center justify-center text-4xl ${!canEvolve && 'opacity-50'}`}>
                  {petType === 0 ? '🐕' : petType === 1 ? '🐈' : petType === 2 ? '🐟' : '🌟'}
                </div>
                {!canEvolve && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 rounded-lg">
                    <div className="bg-white px-2 py-1 rounded-md border-2 border-black">
                      Locked
                    </div>
                  </div>
                )}
              </div>
              <div className="text-center mt-2">
                <p className="font-bold">{nextEvolution?.name}</p>
                <p className="text-sm text-gray-600">Required Level: {nextEvolution?.requiredLevel}</p>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="mt-4 text-sm text-gray-600 border-t-2 border-gray-200 pt-4">
        <p><strong>Evolution Benefits:</strong></p>
        <ul className="list-disc pl-5 mt-1">
          <li>Increased base stats (health, happiness)</li>
          <li>New visual appearance</li>
          <li>Special abilities unique to each evolution stage</li>
          <li>Higher rewards from missions</li>
        </ul>
      </div>
    </div>
  );
} 