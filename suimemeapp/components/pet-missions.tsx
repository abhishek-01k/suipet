import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWallet } from '../hooks/useWallet';
import { startMissionTransaction, completeMissionTransaction } from '../lib/contractInteraction';
import { toast } from 'react-toastify';
import { Progress } from './ui/8bit/progress';

// Mission types and difficulties from the smart contract
const MISSION_TYPES = [
  { 
    id: 0, 
    name: 'Explore', 
    description: 'Explore mysterious lands to find treasures and gain experience', 
    emoji: '🗺️',
    background: 'bg-gradient-to-r from-green-400 to-emerald-500',
    rewards: ['Experience +15', 'Health +5', 'Rare Items']
  },
  { 
    id: 1, 
    name: 'Guard', 
    description: 'Protect important locations from threats and earn respect', 
    emoji: '🛡️',
    background: 'bg-gradient-to-r from-blue-400 to-cyan-500',
    rewards: ['Experience +20', 'Happiness +10', 'Defense Items']
  },
  { 
    id: 2, 
    name: 'Treasure Hunt', 
    description: 'Search for hidden treasures and ancient artifacts', 
    emoji: '💎',
    background: 'bg-gradient-to-r from-yellow-400 to-orange-500',
    rewards: ['Experience +25', 'Rare Treasures', 'Bonus Coins']
  }
];

const DIFFICULTY_LEVELS = [
  { 
    id: 0, 
    name: 'Easy', 
    description: '5 minutes, Level 1+ required', 
    requiredLevel: 1, 
    durationMinutes: 5, 
    emoji: '🟢',
    multiplier: 1,
    background: 'bg-green-100 border-green-400'
  },
  { 
    id: 1, 
    name: 'Medium', 
    description: '15 minutes, Level 5+ required', 
    requiredLevel: 5, 
    durationMinutes: 15, 
    emoji: '🟡',
    multiplier: 1.5,
    background: 'bg-yellow-100 border-yellow-400'
  },
  { 
    id: 2, 
    name: 'Hard', 
    description: '30 minutes, Level 10+ required', 
    requiredLevel: 10, 
    durationMinutes: 30, 
    emoji: '🔴',
    multiplier: 2,
    background: 'bg-red-100 border-red-400'
  }
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
  const [selectedMission, setSelectedMission] = useState(0);
  const [selectedDifficulty, setSelectedDifficulty] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState({ hours: 0, minutes: 0, seconds: 0, isComplete: false });

  // Real-time countdown update
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (activeMission && !activeMission.completed) {
      interval = setInterval(() => {
        const now = Math.floor(Date.now() / 1000);
        const endTime = activeMission.startTime + activeMission.duration;
        const remaining = Math.max(0, endTime - now);
        
        if (remaining <= 0) {
          setTimeRemaining({ hours: 0, minutes: 0, seconds: 0, isComplete: true });
        } else {
          const hours = Math.floor(remaining / 3600);
          const minutes = Math.floor((remaining % 3600) / 60);
          const seconds = remaining % 60;
          setTimeRemaining({ hours, minutes, seconds, isComplete: false });
        }
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeMission]);

  const handleStartMission = async () => {
    if (petLevel < DIFFICULTY_LEVELS[selectedDifficulty].requiredLevel) {
      toast.error(`Your pet needs to be level ${DIFFICULTY_LEVELS[selectedDifficulty].requiredLevel} for this difficulty!`);
      return;
    }

    try {
      const tx = startMissionTransaction({
        petId,
        missionType: selectedMission,
        difficulty: selectedDifficulty
      });

      const result = await executeTransaction(tx);

      if (result) {
        toast.success("Mission started! Your pet is now on an adventure.");
        onMissionChange();
      }
    } catch (error) {
      console.error("Error starting mission:", error);
      toast.error(`Failed to start mission: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };

  const handleCompleteMission = async () => {
    if (!activeMission) return;

    try {
      const tx = completeMissionTransaction({
        missionId: activeMission.id,
        petId: petId
      });
      const result = await executeTransaction(tx);

      if (result) {
        toast.success("Mission completed! Your pet has returned with rewards.");
        onMissionChange();
      }
    } catch (error) {
      console.error("Error completing mission:", error);
      toast.error(`Failed to complete mission: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };

  return (
    <div className="space-y-6">
      {activeMission ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-lg p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-2xl font-bold">🎯 Active Mission</h3>
            <div className="flex items-center gap-2">
              <span className="text-sm bg-gray-100 px-3 py-1 rounded-full border-2 border-black">
                In Progress
              </span>
            </div>
          </div>
          
          <div className={`${MISSION_TYPES[activeMission.type].background} rounded-lg p-6 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mb-4`}>
            <div className="flex items-center gap-4 mb-4">
              <div className="text-6xl">{MISSION_TYPES[activeMission.type].emoji}</div>
              <div className="text-white">
                <h4 className="text-2xl font-bold">{MISSION_TYPES[activeMission.type].name}</h4>
                <p className="text-lg opacity-90">{MISSION_TYPES[activeMission.type].description}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-bold">
                    {DIFFICULTY_LEVELS[activeMission.difficulty].emoji} {DIFFICULTY_LEVELS[activeMission.difficulty].name}
                  </span>
                </div>
              </div>
            </div>
            
            {timeRemaining.isComplete ? (
              <motion.div 
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                className="text-center py-6 bg-white/20 rounded-lg border-2 border-white/30"
              >
                <div className="text-4xl mb-2">🎉</div>
                <p className="text-white font-bold text-xl mb-4">Mission Complete!</p>
                <p className="text-white/90 mb-4">Your pet is ready to return with rewards!</p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCompleteMission}
                  disabled={isTransacting}
                  className="bg-white text-black font-bold py-3 px-8 rounded-lg border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
                >
                  {isTransacting ? 'Collecting...' : 'Collect Rewards 🏆'}
                </motion.button>
              </motion.div>
            ) : (
              <div className="bg-white/20 rounded-lg p-4 border-2 border-white/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-bold">Time Remaining:</span>
                  <span className="text-white text-sm">Mission in progress...</span>
                </div>
                <div className="text-center py-4">
                  <div className="text-4xl font-mono font-bold text-white mb-2">
                    {String(timeRemaining.hours).padStart(2, '0')}:
                    {String(timeRemaining.minutes).padStart(2, '0')}:
                    {String(timeRemaining.seconds).padStart(2, '0')}
                  </div>
                  <div className="flex justify-center gap-2 text-white/80 text-sm">
                    <span>Hours</span>
                    <span>Minutes</span>
                    <span>Seconds</span>
                  </div>
                </div>
                <Progress 
                  value={((activeMission.duration - (Math.floor(Date.now() / 1000) - activeMission.startTime)) / activeMission.duration) * 100}
                  className="h-4 border-2 border-white/50"
                />
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            {MISSION_TYPES[activeMission.type].rewards.map((reward, index) => (
              <div key={index} className="bg-gray-100 p-3 rounded-lg border-2 border-gray-300 text-center">
                <div className="text-sm font-bold text-gray-700">{reward}</div>
              </div>
            ))}
          </div>
        </motion.div>
      ) : (
        <div className="space-y-6">
          <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-lg p-6">
            <h3 className="text-2xl font-bold mb-6 text-center">🌟 Choose Your Adventure</h3>
            
            {/* Mission Selection */}
            <div className="mb-8">
              <h4 className="text-lg font-bold mb-4">Select Mission Type</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {MISSION_TYPES.map((mission, index) => (
                  <motion.button
                    key={mission.id}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedMission(mission.id)}
                    className={`p-4 rounded-lg border-4 transition-all ${
                      selectedMission === mission.id
                        ? 'border-black bg-purple-100 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                        : 'border-gray-300 bg-white hover:border-gray-400'
                    }`}
                  >
                    <div className="text-4xl mb-2">{mission.emoji}</div>
                    <h5 className="font-bold text-lg mb-2">{mission.name}</h5>
                    <p className="text-sm text-gray-600 mb-3">{mission.description}</p>
                    <div className="space-y-1">
                      {mission.rewards.map((reward, idx) => (
                        <div key={idx} className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {reward}
                        </div>
                      ))}
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Difficulty Selection */}
            <div className="mb-8">
              <h4 className="text-lg font-bold mb-4">Choose Difficulty</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {DIFFICULTY_LEVELS.map((level) => (
                  <motion.button
                    key={level.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedDifficulty(level.id)}
                    disabled={petLevel < level.requiredLevel}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      petLevel < level.requiredLevel 
                        ? 'border-gray-200 bg-gray-100 opacity-60 cursor-not-allowed' 
                        : selectedDifficulty === level.id 
                          ? `border-black ${level.background} shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]`
                          : `border-gray-300 ${level.background} hover:border-gray-500`
                    }`}
                  >
                    <div className="text-3xl mb-2">{level.emoji}</div>
                    <div className="font-bold text-lg mb-1">{level.name}</div>
                    <div className="text-sm text-gray-600 mb-2">{level.description}</div>
                    <div className="text-xs bg-white/70 px-2 py-1 rounded">
                      Rewards ×{level.multiplier}
                    </div>
                    {petLevel < level.requiredLevel && (
                      <div className="text-xs text-red-500 mt-2 font-bold">
                        Level {level.requiredLevel} Required
                      </div>
                    )}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Start Mission Button */}
            <div className="text-center">
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleStartMission}
                disabled={petLevel < DIFFICULTY_LEVELS[selectedDifficulty].requiredLevel || isTransacting}
                className={`px-8 py-4 rounded-lg font-bold text-lg border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all ${
                  petLevel < DIFFICULTY_LEVELS[selectedDifficulty].requiredLevel || isTransacting
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:translate-x-1 hover:translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                }`}
              >
                {isTransacting ? '🚀 Starting Mission...' : '🚀 Start Adventure!'}
              </motion.button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 