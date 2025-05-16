import React, { useState } from 'react';
import { useWallet } from '../hooks/useWallet';
import { startMissionTransaction, completeMissionTransaction } from '../lib/contractInteraction';
import { toast } from 'react-toastify';

// Mission types and difficulties from the smart contract
const MISSION_TYPES = [
  { id: 0, name: 'Explore', description: 'Explore the surroundings to find treasures', emoji: '🗺️' },
  { id: 1, name: 'Guard', description: 'Guard an important location', emoji: '🛡️' },
  { id: 2, name: 'Treasure', description: 'Find hidden treasure', emoji: '💎' }
];

const DIFFICULTY_LEVELS = [
  { id: 0, name: 'Easy', description: '5 minutes, Level 1+ required', requiredLevel: 1, durationMinutes: 5, emoji: '🟢' },
  { id: 1, name: 'Medium', description: '15 minutes, Level 5+ required', requiredLevel: 5, durationMinutes: 15, emoji: '🟡' },
  { id: 2, name: 'Hard', description: '30 minutes, Level 10+ required', requiredLevel: 10, durationMinutes: 30, emoji: '🔴' }
];

interface PetMissionsProps {
  petId: string;
  petLevel: number;
  activeMission?: {
    id: string;
    type: number;
    difficulty: number;
    startTime: number;
    duration: number;
    completed: boolean;
  } | null;
  onMissionChange: () => void;
}

export default function PetMissions({ petId, petLevel, activeMission, onMissionChange }: PetMissionsProps) {
  const { executeTransaction, isTransacting } = useWallet();
  const [selectedMissionType, setSelectedMissionType] = useState<number>(0);
  const [selectedDifficulty, setSelectedDifficulty] = useState<number>(0);
  
  // Calculate time remaining for active mission
  const calculateTimeRemaining = () => {
    if (!activeMission) return { hours: 0, minutes: 0, seconds: 0, isComplete: true };
    
    const endTime = (activeMission.startTime + activeMission.duration) * 1000; // Convert to milliseconds
    const now = Date.now();
    const remaining = Math.max(0, endTime - now);
    
    const hours = Math.floor(remaining / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((remaining % (1000 * 60)) / 1000);
    
    return {
      hours,
      minutes,
      seconds,
      isComplete: remaining <= 0
    };
  };
  
  const timeRemaining = calculateTimeRemaining();
  
  // Start a new mission
  const handleStartMission = async () => {
    try {
      // Check if pet meets level requirement
      const requiredLevel = DIFFICULTY_LEVELS[selectedDifficulty].requiredLevel;
      if (petLevel < requiredLevel) {
        toast.error(`Your pet needs to be level ${requiredLevel} for this difficulty!`);
        return;
      }
      
      const tx = startMissionTransaction({
        petId,
        missionType: selectedMissionType,
        difficulty: selectedDifficulty
      });
      
      const result = await executeTransaction(tx);
      
      if (result) {
        toast.success(`Mission started! Your pet will return in ${DIFFICULTY_LEVELS[selectedDifficulty].durationMinutes} minutes.`);
        onMissionChange();
      }
    } catch (error) {
      console.error('Error starting mission:', error);
      toast.error(`Failed to start mission: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };
  
  // Complete a mission
  const handleCompleteMission = async () => {
    if (!activeMission) return;
    
    try {
      const tx = completeMissionTransaction({
        missionId: activeMission.id,
        petId
      });
      
      const result = await executeTransaction(tx);
      
      if (result) {
        toast.success('Mission completed! Your pet gained experience.');
        onMissionChange();
      }
    } catch (error) {
      console.error('Error completing mission:', error);
      toast.error(`Failed to complete mission: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };
  
  return (
    <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-lg p-6 mb-6">
      <h3 className="text-xl font-bold mb-4">Missions</h3>
      
      {activeMission ? (
        <div>
          <div className="bg-gray-100 border-2 border-gray-300 rounded-lg p-4 mb-4">
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-bold text-lg">
                {MISSION_TYPES[activeMission.type].emoji} {MISSION_TYPES[activeMission.type].name} Mission
              </h4>
              <span className="inline-block px-3 py-1 bg-gray-200 rounded-full text-xs font-semibold">
                {DIFFICULTY_LEVELS[activeMission.difficulty].emoji} {DIFFICULTY_LEVELS[activeMission.difficulty].name}
              </span>
            </div>
            
            {timeRemaining.isComplete ? (
              <div className="text-center py-3">
                <p className="text-green-600 font-bold mb-3">Mission complete! Your pet is waiting for you.</p>
                <button
                  onClick={handleCompleteMission}
                  disabled={isTransacting}
                  className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded-lg border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
                >
                  {isTransacting ? 'Collecting Rewards...' : 'Collect Rewards'}
                </button>
              </div>
            ) : (
              <div>
                <p className="mb-2">Your pet is on a mission and will return in:</p>
                <div className="text-center py-2 px-4 bg-white rounded-lg border-2 border-gray-300">
                  <span className="text-xl font-mono font-bold">
                    {String(timeRemaining.hours).padStart(2, '0')}:{String(timeRemaining.minutes).padStart(2, '0')}:{String(timeRemaining.seconds).padStart(2, '0')}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div>
          <div className="mb-4">
            <label className="block font-semibold mb-2">Mission Type</label>
            <div className="grid grid-cols-3 gap-2">
              {MISSION_TYPES.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setSelectedMissionType(type.id)}
                  className={`p-2 rounded-lg border-2 ${
                    selectedMissionType === type.id 
                    ? 'border-black bg-yellow-200' 
                    : 'border-gray-300 hover:border-gray-500'
                  }`}
                >
                  <div className="text-center mb-1 text-xl">{type.emoji}</div>
                  <div className="font-bold text-sm">{type.name}</div>
                </button>
              ))}
            </div>
            <p className="mt-1 text-sm text-gray-600">{MISSION_TYPES[selectedMissionType].description}</p>
          </div>
          
          <div className="mb-6">
            <label className="block font-semibold mb-2">Difficulty</label>
            <div className="grid grid-cols-3 gap-2">
              {DIFFICULTY_LEVELS.map((level) => (
                <button
                  key={level.id}
                  onClick={() => setSelectedDifficulty(level.id)}
                  disabled={petLevel < level.requiredLevel}
                  className={`p-2 rounded-lg border-2 ${
                    petLevel < level.requiredLevel 
                    ? 'border-gray-200 bg-gray-100 opacity-60 cursor-not-allowed' 
                    : selectedDifficulty === level.id 
                      ? 'border-black bg-yellow-200' 
                      : 'border-gray-300 hover:border-gray-500'
                  }`}
                >
                  <div className="text-center mb-1 text-xl">{level.emoji}</div>
                  <div className="font-bold text-sm">{level.name}</div>
                </button>
              ))}
            </div>
            <p className="mt-1 text-sm text-gray-600">
              {DIFFICULTY_LEVELS[selectedDifficulty].description}
              {petLevel < DIFFICULTY_LEVELS[selectedDifficulty].requiredLevel && (
                <span className="text-red-500 ml-1">Your pet's level is too low!</span>
              )}
            </p>
          </div>
          
          <div className="text-center">
            <button
              onClick={handleStartMission}
              disabled={isTransacting || petLevel < DIFFICULTY_LEVELS[selectedDifficulty].requiredLevel}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-8 rounded-lg border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
            >
              {isTransacting ? 'Starting Mission...' : 'Start Mission'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 