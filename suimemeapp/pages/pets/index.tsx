"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useCurrentAccount, useSuiClient } from "@mysten/dapp-kit";
import { Button } from "@/components/ui/8bit/button";
import { Card } from "@/components/ui/8bit/card";

// Mock data for demonstration
const MOCK_PETS = [
  {
    id: "0x123",
    name: "Doggo",
    type: 0,
    level: 5,
    experience: 230,
    health: 80,
    happiness: 90,
    memecoin: {
      name: "Dogecoin",
      symbol: "DOGE",
      image: "/sample/doge.png"
    },
    onMission: false
  },
  {
    id: "0x456",
    name: "Kitty",
    type: 1,
    level: 3,
    experience: 120,
    health: 70,
    happiness: 60,
    memecoin: {
      name: "Shiba Inu",
      symbol: "SHIB",
      image: "/sample/shib.png"
    },
    onMission: true,
    missionEndTime: Date.now() + 300000 // 5 minutes from now
  },
];

export default function MyPets() {
  const [pets, setPets] = useState(MOCK_PETS);
  const [selectedPet, setSelectedPet] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("stats");
  
  const account = useCurrentAccount();
  const suiClient = useSuiClient();
  
  // In a real app, this would fetch the user's pets from the blockchain
  useEffect(() => {
    if (account) {
      // This would be replaced with actual blockchain data fetching
      console.log("Would fetch pets owned by", account.address);
    }
  }, [account]);

  // Helper function to format countdown time
  const formatCountdown = (timestamp: number) => {
    const diff = Math.max(0, timestamp - Date.now());
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  };
  
  const handlePetAction = (action: string) => {
    if (!selectedPet) return;
    
    // In a real app, this would call the smart contract
    console.log(`Performing ${action} on pet ${selectedPet.name}`);
    
    // Mock updates to pet stats for demonstration
    const updatedPets = pets.map(pet => {
      if (pet.id === selectedPet.id) {
        switch (action) {
          case "feed":
            return { ...pet, health: Math.min(100, pet.health + 10) };
          case "play":
            return { ...pet, happiness: Math.min(100, pet.happiness + 10) };
          case "train":
            return { 
              ...pet, 
              experience: pet.experience + 20,
              health: Math.max(0, pet.health - 5),
              happiness: Math.max(0, pet.happiness - 10)
            };
          default:
            return pet;
        }
      }
      return pet;
    });
    
    setPets(updatedPets);
    setSelectedPet(updatedPets.find(p => p.id === selectedPet.id));
  };
  
  const startMission = (difficulty: string) => {
    if (!selectedPet) return;
    
    // In a real app, this would call the smart contract
    console.log(`Starting ${difficulty} mission for pet ${selectedPet.name}`);
    
    // Mock starting a mission for demonstration
    const duration = difficulty === "easy" ? 300000 : difficulty === "medium" ? 900000 : 1800000;
    const updatedPets = pets.map(pet => {
      if (pet.id === selectedPet.id) {
        return {
          ...pet,
          onMission: true,
          missionEndTime: Date.now() + duration
        };
      }
      return pet;
    });
    
    setPets(updatedPets);
    setSelectedPet(updatedPets.find(p => p.id === selectedPet.id));
  };
  
  // Render no pets message when user has no pets
  if (pets.length === 0 && account) {
    return (
      <main className="flex min-h-screen flex-col items-center py-16 px-4">
        <div className="max-w-4xl w-full mx-auto text-center">
          <h1 className="text-3xl font-bold mb-6">My Pets</h1>
          <Card className="p-8 flex flex-col items-center">
            <div className="text-5xl mb-4">🐾</div>
            <h2 className="text-2xl font-bold mb-4">No Pets Found</h2>
            <p className="mb-6 text-gray-600">
              You don't have any MemePets yet. Create your first pet to get started!
            </p>
            <Link href="/create-pet">
              <Button className="bg-purple-500 text-white">Create Your First Pet</Button>
            </Link>
          </Card>
        </div>
      </main>
    );
  }
  
  return (
    <main className="flex min-h-screen flex-col items-center py-16 px-4">
      <div className="max-w-6xl w-full mx-auto">
        <h1 className="text-3xl font-bold mb-6">My Pets</h1>
        
        {!account ? (
          <Card className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Connect Your Wallet</h2>
            <p className="mb-6 text-gray-600">
              Connect your wallet to view your MemePets.
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Pet List */}
            <div className="col-span-1">
              <div className="grid gap-4">
                {pets.map((pet) => (
                  <motion.div
                    key={pet.id}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => setSelectedPet(pet)}
                    className={`cursor-pointer p-4 border-2 rounded-lg ${selectedPet?.id === pet.id ? 'border-purple-500 bg-purple-50' : 'border-gray-200'}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="relative w-12 h-12">
                        <Image
                          src={pet.memecoin.image}
                          alt={pet.name}
                          fill
                          className="object-contain"
                        />
                      </div>
                      <div>
                        <h3 className="font-bold">{pet.name}</h3>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">Lvl {pet.level}</span>
                          {pet.onMission && (
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                              On Mission
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
                
                <Link href="/create-pet">
                  <Button className="w-full">Create New Pet</Button>
                </Link>
              </div>
            </div>
            
            {/* Pet Details */}
            <div className="col-span-1 md:col-span-2">
              {selectedPet ? (
                <Card className="p-6">
                  <div className="flex flex-col md:flex-row gap-8">
                    {/* Pet Avatar & Basic Info */}
                    <div className="w-full md:w-1/3 flex flex-col items-center">
                      <div className="relative w-32 h-32 mb-4">
                        <Image
                          src={selectedPet.memecoin.image}
                          alt={selectedPet.name}
                          fill
                          className="object-contain"
                        />
                      </div>
                      <h2 className="text-2xl font-bold mb-1">{selectedPet.name}</h2>
                      <div className="flex items-center gap-2 mb-4">
                        <span className="text-sm bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">
                          Level {selectedPet.level}
                        </span>
                        <span className="text-sm text-gray-600">
                          {selectedPet.memecoin.symbol}
                        </span>
                      </div>
                      
                      {selectedPet.onMission && (
                        <div className="w-full bg-blue-100 p-3 rounded-lg text-center mb-4">
                          <p className="text-sm font-semibold text-blue-800">On Mission</p>
                          <p className="text-xs text-blue-600">
                            Returns in: {formatCountdown(selectedPet.missionEndTime)}
                          </p>
                        </div>
                      )}
                    </div>
                    
                    {/* Pet Details & Actions */}
                    <div className="w-full md:w-2/3">
                      {/* Tabs */}
                      <div className="flex border-b border-gray-200 mb-4">
                        <button
                          className={`px-4 py-2 ${activeTab === 'stats' ? 'border-b-2 border-purple-500 font-medium' : 'text-gray-500'}`}
                          onClick={() => setActiveTab('stats')}
                        >
                          Stats
                        </button>
                        <button
                          className={`px-4 py-2 ${activeTab === 'actions' ? 'border-b-2 border-purple-500 font-medium' : 'text-gray-500'}`}
                          onClick={() => setActiveTab('actions')}
                        >
                          Actions
                        </button>
                        <button
                          className={`px-4 py-2 ${activeTab === 'missions' ? 'border-b-2 border-purple-500 font-medium' : 'text-gray-500'}`}
                          onClick={() => setActiveTab('missions')}
                        >
                          Missions
                        </button>
                        <button
                          className={`px-4 py-2 ${activeTab === 'chat' ? 'border-b-2 border-purple-500 font-medium' : 'text-gray-500'}`}
                          onClick={() => setActiveTab('chat')}
                        >
                          Chat
                        </button>
                      </div>
                      
                      {/* Stats Tab */}
                      {activeTab === 'stats' && (
                        <div>
                          <div className="mb-4">
                            <label className="block text-sm font-medium mb-1">Health</label>
                            <div className="w-full bg-gray-200 rounded-full h-4">
                              <div 
                                className="bg-green-500 h-4 rounded-full"
                                style={{ width: `${selectedPet.health}%` }}
                              ></div>
                            </div>
                            <div className="flex justify-between text-xs mt-1">
                              <span>{selectedPet.health}/100</span>
                            </div>
                          </div>
                          
                          <div className="mb-4">
                            <label className="block text-sm font-medium mb-1">Happiness</label>
                            <div className="w-full bg-gray-200 rounded-full h-4">
                              <div 
                                className="bg-yellow-500 h-4 rounded-full"
                                style={{ width: `${selectedPet.happiness}%` }}
                              ></div>
                            </div>
                            <div className="flex justify-between text-xs mt-1">
                              <span>{selectedPet.happiness}/100</span>
                            </div>
                          </div>
                          
                          <div className="mb-4">
                            <label className="block text-sm font-medium mb-1">Experience</label>
                            <div className="w-full bg-gray-200 rounded-full h-4">
                              <div 
                                className="bg-blue-500 h-4 rounded-full"
                                style={{ width: `${(selectedPet.experience % 100)}%` }}
                              ></div>
                            </div>
                            <div className="flex justify-between text-xs mt-1">
                              <span>{selectedPet.experience % 100}/100 to next level</span>
                              <span>Total: {selectedPet.experience} XP</span>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* Actions Tab */}
                      {activeTab === 'actions' && (
                        <div className="grid grid-cols-3 gap-4">
                          <Button
                            onClick={() => handlePetAction('feed')}
                            disabled={selectedPet.onMission}
                            className="p-4 h-24 flex flex-col items-center justify-center"
                          >
                            <span className="text-2xl mb-1">🍖</span>
                            <span>Feed</span>
                          </Button>
                          
                          <Button
                            onClick={() => handlePetAction('play')}
                            disabled={selectedPet.onMission}
                            className="p-4 h-24 flex flex-col items-center justify-center"
                          >
                            <span className="text-2xl mb-1">🎮</span>
                            <span>Play</span>
                          </Button>
                          
                          <Button
                            onClick={() => handlePetAction('train')}
                            disabled={selectedPet.onMission}
                            className="p-4 h-24 flex flex-col items-center justify-center"
                          >
                            <span className="text-2xl mb-1">🏋️</span>
                            <span>Train</span>
                          </Button>
                        </div>
                      )}
                      
                      {/* Missions Tab */}
                      {activeTab === 'missions' && (
                        <div>
                          {selectedPet.onMission ? (
                            <div className="text-center p-6">
                              <p className="text-xl font-bold mb-2">Mission in Progress</p>
                              <p className="mb-4">Your pet is currently on a mission and will return in {formatCountdown(selectedPet.missionEndTime)}.</p>
                            </div>
                          ) : (
                            <div>
                              <p className="mb-4">Send your pet on a mission to earn rewards!</p>
                              
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <Button
                                  onClick={() => startMission('easy')}
                                  className="p-4 flex flex-col items-center"
                                >
                                  <span className="font-bold">Easy Mission</span>
                                  <span className="text-sm">5 minutes</span>
                                  <span className="text-sm">+25 XP</span>
                                </Button>
                                
                                <Button
                                  onClick={() => startMission('medium')}
                                  disabled={selectedPet.level < 5}
                                  className="p-4 flex flex-col items-center"
                                >
                                  <span className="font-bold">Medium Mission</span>
                                  <span className="text-sm">15 minutes</span>
                                  <span className="text-sm">+75 XP</span>
                                  {selectedPet.level < 5 && (
                                    <span className="text-xs text-red-500">Requires Level 5</span>
                                  )}
                                </Button>
                                
                                <Button
                                  onClick={() => startMission('hard')}
                                  disabled={selectedPet.level < 10}
                                  className="p-4 flex flex-col items-center"
                                >
                                  <span className="font-bold">Hard Mission</span>
                                  <span className="text-sm">30 minutes</span>
                                  <span className="text-sm">+150 XP</span>
                                  {selectedPet.level < 10 && (
                                    <span className="text-xs text-red-500">Requires Level 10</span>
                                  )}
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {/* Chat Tab */}
                      {activeTab === 'chat' && (
                        <div className="flex flex-col h-64">
                          <div className="flex-grow border border-gray-200 rounded-lg p-4 mb-4 overflow-y-auto">
                            <div className="flex justify-start mb-2">
                              <div className="bg-gray-200 rounded-lg p-2 max-w-[80%]">
                                <p>Hi there! I'm {selectedPet.name}. How can I help you today?</p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex gap-2">
                            <input
                              type="text"
                              className="flex-grow p-2 border-2 border-gray-300 rounded-lg"
                              placeholder="Chat with your pet..."
                              disabled={selectedPet.onMission}
                            />
                            <Button disabled={selectedPet.onMission}>Send</Button>
                          </div>
                          {selectedPet.onMission && (
                            <p className="text-sm text-gray-500 mt-2">Your pet is on a mission and can't chat right now.</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ) : (
                <div className="h-full flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-12">
                  <div className="text-center">
                    <p className="text-gray-500 mb-4">Select a pet to view details</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
} 