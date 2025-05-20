import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useCurrentAccount, useSuiClient } from "@mysten/dapp-kit";
import { Button } from './ui/8bit/button';
import { Card, CardContent, CardHeader } from './ui/8bit/card';
import { Progress } from './ui/8bit/progress';
import { toast } from 'react-toastify';
import { useWallet } from '@/hooks/useWallet';

interface MemeCompetition {
  id: string;
  title: string;
  memecoinSymbol: string;
  memecoinImage: string;
  description: string;
  entryFee: number; // Amount of memecoin required to enter
  prizePool: number;
  participants: number;
  endDate: Date;
  isActive: boolean;
  userParticipated: boolean;
  submissions: MemeSubmission[];
}

interface MemeSubmission {
  id: string;
  userId: string;
  username: string;
  memeUrl: string;
  twitterUrl: string;
  votes: number;
  timestamp: Date;
}

interface Pet {
  id: string;
  name: string;
  memecoin: {
    symbol: string;
    name: string;
    image: string;
  };
}

interface MemeCompetitionsProps {
  userPets: Pet[];
}

export default function MemeCompetitions({ userPets }: MemeCompetitionsProps) {
  const [competitions, setCompetitions] = useState<MemeCompetition[]>([]);
  const [selectedCompetition, setSelectedCompetition] = useState<MemeCompetition | null>(null);
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);
  const [twitterUrl, setTwitterUrl] = useState('');
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const account = useCurrentAccount();
  const { executeTransaction, isTransacting } = useWallet();

  // Mock competitions data - in production this would come from the blockchain
  useEffect(() => {
    const mockCompetitions: MemeCompetition[] = [
      {
        id: 'comp_1',
        title: 'UNI Meme Master Challenge',
        memecoinSymbol: 'UNI',
        memecoinImage: '/memecoins/uni.png',
        description: 'Create the most creative UNI-related meme and share it on Twitter! Show your UNI pet pride!',
        entryFee: 100,
        prizePool: 2500,
        participants: 42,
        endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        isActive: true,
        userParticipated: false,
        submissions: []
      },
      {
        id: 'comp_2',
        title: 'GLUB Ocean Adventures',
        memecoinSymbol: 'GLUB',
        memecoinImage: '/memecoins/glub.webp',
        description: 'Dive deep into GLUB memes! Create underwater-themed content featuring your GLUB pet!',
        entryFee: 150,
        prizePool: 1800,
        participants: 28,
        endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        isActive: true,
        userParticipated: true,
        submissions: [
          {
            id: 'sub_1',
            userId: 'user_1',
            username: 'CryptoCat',
            memeUrl: '/sample/meme1.jpg',
            twitterUrl: 'https://twitter.com/example/status/123',
            votes: 45,
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000)
          }
        ]
      },
      {
        id: 'comp_3',
        title: 'LOFI Chill Vibes Contest',
        memecoinSymbol: 'LOFI',
        memecoinImage: '/memecoins/lofi.webp',
        description: 'Create relaxing, chill LOFI memes that capture the zen spirit of your LOFI pet!',
        entryFee: 75,
        prizePool: 3200,
        participants: 67,
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        isActive: true,
        userParticipated: false,
        submissions: []
      }
    ];

    setCompetitions(mockCompetitions);
    setIsLoading(false);
  }, []);

  const getTimeRemaining = (endDate: Date) => {
    const now = new Date();
    const timeDiff = endDate.getTime() - now.getTime();
    
    if (timeDiff <= 0) return { days: 0, hours: 0, minutes: 0, expired: true };
    
    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
    
    return { days, hours, minutes, expired: false };
  };

  const getUserEligiblePets = (memecoinSymbol: string) => {
    return userPets.filter(pet => pet.memecoin.symbol === memecoinSymbol);
  };

  const handleJoinCompetition = async (competition: MemeCompetition) => {
    const eligiblePets = getUserEligiblePets(competition.memecoinSymbol);
    
    if (eligiblePets.length === 0) {
      toast.error(`You need a ${competition.memecoinSymbol} pet to participate in this competition!`);
      return;
    }

    setSelectedCompetition(competition);
    setSelectedPet(eligiblePets[0]); // Auto-select first eligible pet
    setShowSubmissionModal(true);
  };

  const handleSubmitMeme = async () => {
    if (!selectedCompetition || !selectedPet || !twitterUrl.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Validate Twitter URL
    if (!twitterUrl.includes('twitter.com') && !twitterUrl.includes('x.com')) {
      toast.error('Please enter a valid Twitter/X URL');
      return;
    }

    try {
      // In a real implementation, this would:
      // 1. Create a transaction to deposit the entry fee
      // 2. Submit the meme URL to the smart contract
      // 3. Track the submission on-chain
      
      toast.success(`Successfully joined ${selectedCompetition.title}! Your meme has been submitted.`);
      
      // Update the competition to show user has participated
      setCompetitions(prev => 
        prev.map(comp => 
          comp.id === selectedCompetition.id 
            ? { ...comp, userParticipated: true, participants: comp.participants + 1 }
            : comp
        )
      );

      // Reset form
      setShowSubmissionModal(false);
      setTwitterUrl('');
      setSelectedPet(null);
      setSelectedCompetition(null);
      
    } catch (error) {
      console.error('Error submitting meme:', error);
      toast.error('Failed to submit meme. Please try again.');
    }
  };

  const getProgressPercentage = (endDate: Date) => {
    const now = new Date();
    const weekInMs = 7 * 24 * 60 * 60 * 1000; // 7 days
    const startDate = new Date(endDate.getTime() - weekInMs);
    const totalDuration = endDate.getTime() - startDate.getTime();
    const elapsed = now.getTime() - startDate.getTime();
    return Math.max(0, Math.min(100, (elapsed / totalDuration) * 100));
  };

  if (!account) {
    return (
      <Card className="p-8 text-center">
        <h2 className="text-2xl font-bold mb-4 text-foreground">🏆 Meme Competitions</h2>
        <p className="mb-6 text-gray-600 dark:text-gray-400">
          Connect your wallet to participate in weekly meme competitions and win prizes!
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-4 text-foreground">🏆 Weekly Meme Competitions</h2>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Show off your creativity! Participate in memecoin-specific competitions, create viral memes, 
          and compete for prize pools. Only pet owners of the specified memecoin can participate!
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <Card key={i} className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {competitions.map((competition) => {
            const timeRemaining = getTimeRemaining(competition.endDate);
            const progressPercentage = getProgressPercentage(competition.endDate);
            const eligiblePets = getUserEligiblePets(competition.memecoinSymbol);
            
            return (
              <motion.div
                key={competition.id}
                whileHover={{ scale: 1.02, y: -4 }}
                className="relative"
              >
                <Card className="border-4 border-black dark:border-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] bg-white dark:bg-gray-800 overflow-hidden h-full">
                  {/* Competition Status Badge */}
                  <div className="absolute top-4 right-4 z-10">
                    {competition.userParticipated ? (
                      <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                        ✓ Joined
                      </span>
                    ) : (
                      <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                        Open
                      </span>
                    )}
                  </div>

                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3 mb-2">
                      <Image 
                        src={competition.memecoinImage}
                        alt={competition.memecoinSymbol}
                        width={40}
                        height={40}
                        className="rounded-full"
                      />
                      <div>
                        <h3 className="font-bold text-lg text-foreground">{competition.title}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{competition.memecoinSymbol} Competition</p>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                      {competition.description}
                    </p>

                    {/* Competition Stats */}
                    <div className="grid grid-cols-2 gap-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border-2 border-gray-200 dark:border-gray-600">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{competition.prizePool}</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">{competition.memecoinSymbol} Prize Pool</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{competition.participants}</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">Participants</div>
                      </div>
                    </div>

                    {/* Time Remaining */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium text-foreground">Time Remaining:</span>
                        <span className={timeRemaining.expired ? 'text-red-500 dark:text-red-400' : 'text-green-600 dark:text-green-400'}>
                          {timeRemaining.expired 
                            ? 'Expired' 
                            : `${timeRemaining.days}d ${timeRemaining.hours}h ${timeRemaining.minutes}m`
                          }
                        </span>
                      </div>
                      <Progress 
                        value={progressPercentage}
                        className="h-2 border border-gray-300 dark:border-gray-600"
                      />
                    </div>

                    {/* Entry Requirements */}
                    <div className="text-xs text-gray-600 dark:text-gray-400 bg-yellow-50 dark:bg-yellow-900 p-2 rounded border border-yellow-200 dark:border-yellow-700">
                      <strong>Entry Fee:</strong> {competition.entryFee} {competition.memecoinSymbol}
                      <br />
                      <strong>Requirement:</strong> Own a {competition.memecoinSymbol} pet
                    </div>

                    {/* Eligible Pets Indicator */}
                    {eligiblePets.length > 0 ? (
                      <div className="text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900 p-2 rounded border border-green-200 dark:border-green-700">
                        ✓ You have {eligiblePets.length} eligible {competition.memecoinSymbol} pet(s)
                      </div>
                    ) : (
                      <div className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900 p-2 rounded border border-red-200 dark:border-red-700">
                        ✗ You need a {competition.memecoinSymbol} pet to participate
                      </div>
                    )}

                    {/* Action Button */}
                    <Button
                      onClick={() => handleJoinCompetition(competition)}
                      disabled={
                        competition.userParticipated || 
                        timeRemaining.expired || 
                        eligiblePets.length === 0 ||
                        isTransacting
                      }
                      className={`w-full font-bold ${
                        competition.userParticipated 
                          ? 'bg-gray-300 dark:bg-gray-700 text-gray-600 dark:text-gray-400' 
                          : eligiblePets.length === 0
                            ? 'bg-red-400 text-white'
                            : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600'
                      }`}
                    >
                      {competition.userParticipated 
                        ? '✓ Already Participating' 
                        : timeRemaining.expired
                          ? 'Competition Ended'
                          : eligiblePets.length === 0
                            ? `Need ${competition.memecoinSymbol} Pet`
                            : '🚀 Join Competition'
                      }
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Submission Modal */}
      <AnimatePresence>
        {showSubmissionModal && selectedCompetition && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white dark:bg-gray-800 border-4 border-black dark:border-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] rounded-lg p-6 w-full max-w-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-foreground">🎨 Submit Your Meme</h2>
                <button
                  onClick={() => setShowSubmissionModal(false)}
                  className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 text-2xl"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                {/* Competition Info */}
                <div className="p-4 bg-purple-100 dark:bg-purple-900 border-2 border-purple-300 dark:border-purple-700 rounded-lg">
                  <h3 className="font-bold text-lg mb-2 text-foreground">{selectedCompetition.title}</h3>
                  <p className="text-gray-700 dark:text-gray-300 mb-3">{selectedCompetition.description}</p>
                  <div className="text-sm text-foreground">
                    <strong>Entry Fee:</strong> {selectedCompetition.entryFee} {selectedCompetition.memecoinSymbol}
                  </div>
                </div>

                {/* Instructions */}
                <div className="p-4 bg-blue-100 dark:bg-blue-900 border-2 border-blue-300 dark:border-blue-700 rounded-lg">
                  <h4 className="font-bold mb-2 text-foreground">📝 How to Participate:</h4>
                  <ol className="list-decimal list-inside text-sm space-y-1 text-gray-700 dark:text-gray-300">
                    <li>Create an awesome meme featuring {selectedCompetition.memecoinSymbol}</li>
                    <li>Post it on Twitter/X with hashtags #{selectedCompetition.memecoinSymbol}Meme #MemePetContest</li>
                    <li>Copy the tweet URL and paste it below</li>
                    <li>Pay the entry fee to join the competition</li>
                  </ol>
                </div>

                {/* Twitter URL Input */}
                <div>
                  <label className="block font-bold mb-2 text-foreground">Twitter/X Post URL *</label>
                  <input
                    type="url"
                    value={twitterUrl}
                    onChange={(e) => setTwitterUrl(e.target.value)}
                    placeholder="https://twitter.com/yourhandle/status/..."
                    className="w-full p-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:border-purple-500 outline-none bg-white dark:bg-gray-800 text-foreground"
                  />
                </div>

                {/* Selected Pet Display */}
                {selectedPet && (
                  <div className="p-3 bg-gray-100 dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Image 
                        src={selectedPet.memecoin.image}
                        alt={selectedPet.memecoin.symbol}
                        width={32}
                        height={32}
                        className="rounded-full"
                      />
                      <div>
                        <div className="font-bold text-foreground">{selectedPet.name}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">{selectedPet.memecoin.symbol} Pet</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-4">
                  <Button
                    onClick={handleSubmitMeme}
                    disabled={!twitterUrl.trim() || isTransacting}
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold"
                  >
                    {isTransacting ? '🔄 Submitting...' : '💎 Submit & Pay Fee'}
                  </Button>
                  <Button
                    onClick={() => setShowSubmissionModal(false)}
                    variant="outline"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
} 