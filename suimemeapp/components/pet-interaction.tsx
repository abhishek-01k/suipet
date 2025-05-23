import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWallet } from '../hooks/useWallet';
import { petInteractionTransaction } from '../lib/contractInteraction';
import { toast } from 'react-toastify';
import LiveDetection from './live-detection';

interface PetInteractionProps {
  petId: string;
  onInteractionComplete: () => void;
}

export default function PetInteraction({ petId, onInteractionComplete }: PetInteractionProps) {
  const { executeTransaction, isTransacting } = useWallet();
  const [interactionType, setInteractionType] = useState<'feed' | 'play' | 'train' | null>(null);
  const [showTrainingModal, setShowTrainingModal] = useState(false);
  const [trainingCompleted, setTrainingCompleted] = useState(false);
  const [currentExercise, setCurrentExercise] = useState<'bicep-curl' | 'push-up' | 'squat'>('bicep-curl');
  
  const handleInteraction = async (action: 'feed' | 'play' | 'train') => {
    // For training, we need verification first
    if (action === 'train') {
      setShowTrainingModal(true);
      setCurrentExercise('bicep-curl'); // Start with bicep curls
      return;
    }

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

  const handleTrainingComplete = async () => {
    if (!trainingCompleted) {
      toast.error("Please complete the exercise verification first!");
      return;
    }

    setInteractionType('train');
    
    try {
      const tx = petInteractionTransaction(petId, 'train');
      const result = await executeTransaction(tx);
      
      if (result) {
        toast.success('💪 Training complete! Experience gained and your pet is stronger!');
        onInteractionComplete();
        setShowTrainingModal(false);
        setTrainingCompleted(false);
      }
    } catch (error) {
      console.error('Error during training:', error);
      toast.error(`Failed to complete training: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setInteractionType(null);
    }
  };

  const onExerciseComplete = (repsCompleted: number, targetReps: number) => {
    if (repsCompleted >= targetReps) {
      setTrainingCompleted(true);
      toast.success(`Great job! You completed ${repsCompleted} ${currentExercise}s. Your pet is impressed!`);
    } else {
      toast.warning(`You only completed ${repsCompleted} out of ${targetReps} reps. Try again!`);
    }
  };
  
  return (
    <>
      <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-lg p-6 mb-6">
        <h3 className="text-xl font-bold mb-4">Interact with Your Pet</h3>
        
        <div className="grid grid-cols-3 gap-4">
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleInteraction('feed')}
            disabled={isTransacting}
            className={`
              py-3 px-4 border-4 border-black rounded-lg font-bold transition-all
              ${isTransacting && interactionType === 'feed' 
                ? 'bg-gray-200 opacity-70' 
                : 'bg-green-400 hover:bg-green-500 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'}
            `}
          >
            {isTransacting && interactionType === 'feed' ? 'Feeding...' : '🍖 Feed'}
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleInteraction('play')}
            disabled={isTransacting}
            className={`
              py-3 px-4 border-4 border-black rounded-lg font-bold transition-all
              ${isTransacting && interactionType === 'play' 
                ? 'bg-gray-200 opacity-70' 
                : 'bg-blue-400 hover:bg-blue-500 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'}
            `}
          >
            {isTransacting && interactionType === 'play' ? 'Playing...' : '🎾 Play'}
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleInteraction('train')}
            disabled={isTransacting}
            className={`
              py-3 px-4 border-4 border-black rounded-lg font-bold transition-all
              ${isTransacting && interactionType === 'train' 
                ? 'bg-gray-200 opacity-70' 
                : 'bg-purple-400 hover:bg-purple-500 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'}
            `}
          >
            {isTransacting && interactionType === 'train' ? 'Training...' : '💪 Train'}
          </motion.button>
        </div>
        
        <div className="mt-4 text-sm space-y-2">
          <p className="text-gray-600">
            <strong>Feed:</strong> Increases health but gives less experience.
          </p>
          <p className="text-gray-600">
            <strong>Play:</strong> Increases happiness and gives moderate experience.
          </p>
          <p className="text-gray-600">
            <strong>Train:</strong> Requires exercise verification! Gives the most experience but decreases health and happiness initially.
          </p>
        </div>
      </div>

      {/* Training Verification Modal */}
      <AnimatePresence>
        {showTrainingModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">💪 Training Verification</h2>
                <button
                  onClick={() => {
                    setShowTrainingModal(false);
                    setTrainingCompleted(false);
                  }}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ✕
                </button>
              </div>

              <div className="mb-6 p-4 bg-purple-100 border-2 border-purple-300 rounded-lg">
                <h3 className="font-bold text-lg mb-2">🎯 Exercise Challenge</h3>
                <p className="text-gray-700">
                  To train your pet, you must complete a real workout! Choose an exercise and demonstrate proper form.
                  Your pet learns by watching you get stronger! 💪
                </p>
              </div>

              {/* Exercise Selection */}
              <div className="mb-6">
                <h4 className="font-bold text-lg mb-3">Choose Your Exercise:</h4>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { key: 'bicep-curl', name: 'Bicep Curls', emoji: '💪', reps: 10 },
                    { key: 'push-up', name: 'Push-ups', emoji: '🏋️', reps: 5 },
                    { key: 'squat', name: 'Squats', emoji: '🦵', reps: 8 }
                  ].map((exercise) => (
                    <motion.button
                      key={exercise.key}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setCurrentExercise(exercise.key as any)}
                      className={`p-4 border-2 rounded-lg transition-all ${
                        currentExercise === exercise.key
                          ? 'border-purple-500 bg-purple-100 shadow-[4px_4px_0px_0px_rgba(147,51,234,0.5)]'
                          : 'border-gray-300 bg-white hover:border-purple-300'
                      }`}
                    >
                      <div className="text-3xl mb-2">{exercise.emoji}</div>
                      <div className="font-bold">{exercise.name}</div>
                      <div className="text-sm text-gray-600">{exercise.reps} reps required</div>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Live Detection Component */}
              <div className="mb-6 border-2 border-gray-300 rounded-lg overflow-hidden">
                <LiveDetection 
                  exerciseSubType={currentExercise}
                  onExerciseComplete={onExerciseComplete}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-center gap-4">
                {trainingCompleted ? (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleTrainingComplete}
                    disabled={isTransacting}
                    className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-8 rounded-lg border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
                  >
                    {isTransacting ? '🏆 Processing Training...' : '🏆 Complete Training!'}
                  </motion.button>
                ) : (
                  <div className="text-center p-4 bg-yellow-100 border-2 border-yellow-400 rounded-lg">
                    <p className="font-bold text-yellow-800">
                      Complete the exercise above to unlock training! 💪
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
} 