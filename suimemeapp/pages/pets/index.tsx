"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useCurrentAccount, useSuiClient } from "@mysten/dapp-kit";
import { Button } from "@/components/ui/8bit/button";
import { Card } from "@/components/ui/8bit/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/8bit/tabs";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

import PetInteraction from "@/components/pet-interaction";
import PetMissions from "@/components/pet-missions";
import PetChat from "@/components/pet-chat";
import PetEvolution from "@/components/pet-evolution";
import { useWallet } from "@/hooks/useWallet";
import { petInteractionTransaction, startMissionTransaction, completeMissionTransaction } from "@/lib/contractInteraction";

// Import additional components from 8bitcn UI
import { Progress } from "@/components/ui/8bit/progress";
import { Badge } from "@/components/ui/8bit/badge";
import { Skeleton } from "@/components/ui/8bit/skeleton";
import { PACKAGE_ID } from "@/lib/contractInteraction";
import { getMemecoinByAddress } from "@/constants/memecoins";

// Pet type helper
const PET_TYPES = {
  0: "Dog",
  1: "Cat",
  2: "Fish",
  3: "Custom"
};

// Empty state component with 8bitcn styling
const EmptyPetsState = () => (
  <div className="flex flex-col gap-4 items-center justify-center p-8 text-center border-4 border-black dark:border-white rounded-lg shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] bg-purple-100 dark:bg-purple-900">
    <div className="flex justify-center items-center">
      <Image
        src='/pets/sad_puppy.webp'
        width={180}
        height={180}
        alt="Sad_puppy"
        className="rounded-lg"
      />
    </div>
    <h3 className="text-xl font-bold mb-2 dark:text-white">No Pets Found</h3>
    <p className="mb-4 text-gray-600 dark:text-gray-300 text-left">Create your first one!</p>
    <Link href="/create-pet">
      <Button>Create a Pet</Button>
    </Link>
  </div>
);

export default function MyPets() {
  const [pets, setPets] = useState<any[]>([]);
  const [selectedPet, setSelectedPet] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("stats");
  const [loading, setLoading] = useState(true);
  const [activeMission, setActiveMission] = useState<any>(null);

  const account = useCurrentAccount();
  const suiClient = useSuiClient();
  const { executeTransaction, isTransacting } = useWallet();

  // Fetch pets owned by the current user
  useEffect(() => {
    const fetchPets = async () => {
      if (!account) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // For a quick demo, we'll still use mock data but simulate a real fetch
        // In production, uncomment and use this code:

        const objectsResponse = await suiClient.getOwnedObjects({
          owner: account.address,
          options: { showContent: true, showDisplay: true },
          filter: { StructType: `${PACKAGE_ID}::memepet::Pet` }
        });

        const userPets = await Promise.all(objectsResponse.data.map(async (obj) => {
          if (!obj.data?.content?.fields) return null;

          const fields = obj.data.content.fields;

          // Get memecoin details
          const memecoinAddress = fields.memecoin_address;
          const memecoin = getMemecoinByAddress(memecoinAddress) || {
            name: "Custom",
            symbol: "CUSTOM",
            image: "/sample/default.png"
          };

          // Check for active missions
          const missionResponse = await suiClient.getOwnedObjects({
            owner: account.address,
            filter: { StructType: `${PACKAGE_ID}::pet_actions::Mission` }
          });

          const petMission = missionResponse.data.find(mission => {
            return mission.data?.content?.fields?.pet_id === obj.data?.objectId;
          });

          const onMission = !!petMission;
          let missionEndTime = null;
          let missionId = null;

          if (petMission && petMission.data?.content?.fields) {
            const mFields = petMission.data.content.fields;
            const startTime = Number(mFields.start_time);
            const duration = Number(mFields.duration);
            missionEndTime = (startTime + duration) * 1000;
            missionId = petMission.data.objectId;
          }

          return {
            id: obj.data.objectId,
            name: fields.name,
            type: Number(fields.pet_type),
            level: Number(fields.level),
            experience: Number(fields.experience),
            health: Number(fields.health),
            happiness: Number(fields.happiness),
            memecoin: memecoin,
            onMission: onMission,
            missionEndTime: missionEndTime,
            missionId: missionId
          };
        }));

        const filteredPets = userPets.filter(pet => pet !== null);
        setPets(filteredPets);
        setLoading(false);

        // If we have pets and none selected, select the first one
        if (filteredPets.length > 0 && !selectedPet) {
          setSelectedPet(filteredPets[0]);
        }
      } catch (error) {
        console.error("Error fetching pets:", error);
        toast.error("Failed to fetch your pets");
        setLoading(false);
      }
    };

    fetchPets();
  }, [account, suiClient]);

  // Set active mission when selecting a pet
  useEffect(() => {
    if (selectedPet && selectedPet.onMission) {
      setActiveMission({
        id: selectedPet.missionId || `mission-${selectedPet.id}`,
        type: 0, // Default to Explore mission
        difficulty: 0, // Default to Easy difficulty
        startTime: Math.floor((selectedPet.missionEndTime - 300000) / 1000), // 5 minutes before end time
        duration: 300, // 5 minutes in seconds
        completed: false
      });
    } else {
      setActiveMission(null);
    }
  }, [selectedPet]);

  const handleInteractionComplete = () => {
    // In production, this would query the blockchain for updated pet stats
    // For now, we'll simulate it
    const updatedPets = pets.map(pet => {
      if (pet.id === selectedPet?.id) {
        return {
          ...pet,
          health: Math.min(100, pet.health + 5),
          happiness: Math.min(100, pet.happiness + 5),
          experience: pet.experience + 10
        };
      }
      return pet;
    });

    setPets(updatedPets);
    setSelectedPet(updatedPets.find(p => p.id === selectedPet?.id));
  };

  const handleMissionChange = () => {
    // In production, this would query the blockchain for updated mission status
    // For now, we'll simulate it
    if (selectedPet) {
      const now = Date.now();
      const updatedPets = pets.map(pet => {
        if (pet.id === selectedPet.id) {
          if (pet.onMission) {
            // Complete the mission
            return {
              ...pet,
              onMission: false,
              experience: pet.experience + 50
            };
          } else {
            // Start a new mission
            return {
              ...pet,
              onMission: true,
              missionEndTime: now + 300000 // 5 minutes
            };
          }
        }
        return pet;
      });

      setPets(updatedPets);
      const updatedPet = updatedPets.find(p => p.id === selectedPet.id);
      setSelectedPet(updatedPet);

      if (updatedPet?.onMission) {
        setActiveMission({
          id: `mission-${updatedPet.id}-${now}`,
          type: 0, // Explore mission
          difficulty: 0, // Easy
          startTime: Math.floor(now / 1000),
          duration: 300, // 5 minutes
          completed: false
        });
      } else {
        setActiveMission(null);
      }
    }
  };

  return (
    <div className="container min-h-full mx-auto py-24">
      <div className="flex flex-col items-start mb-8">
        <h1 className="text-4xl font-bold dark:text-white">My MemePets</h1>
        <p className="text-gray-600 dark:text-gray-300 mt-2">
          Train, play, and send your virtual pets on missions!
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pet List */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 border-4 border-black dark:border-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] rounded-lg p-6 mb-6">
            <div className="flex flex-col gap-4 justify-between items-center mb-4">
              <h2 className="text-2xl font-bold dark:text-white">Your Pets</h2>
              {pets.length !== 0 && <Link href="/create-pet">
                <Button size="sm">+ New Pet</Button>
              </Link>}
            </div>

            {loading ? (
              // Loading Skeleton with 8bitcn styling
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="border-2 border-gray-200 dark:border-gray-600 rounded-lg p-4">
                    <div className="flex items-center">
                      <Skeleton className="h-12 w-12 rounded-full mr-3" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : pets.length === 0 ? (
              <EmptyPetsState />
            ) : (
              <div className="space-y-3">
                {pets.map((pet) => (
                  <motion.div
                    key={pet.id}
                    className={`
                      border-4 p-3 rounded-lg cursor-pointer transition-all duration-200 
                      ${selectedPet?.id === pet.id
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/50'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-400'}
                    `}
                    onClick={() => setSelectedPet(pet)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center">
                      <div className="relative w-12 h-12 mr-3">
                        <Image
                          src={pet.memecoin.image}
                          alt={pet.name}
                          width={48}
                          height={48}
                          className="rounded-full object-cover border-2 border-black dark:border-white"
                        />
                        {pet.onMission && (
                          <div className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs font-bold px-1 rounded-full border-2 border-black dark:border-white">
                            🚀
                          </div>
                        )}
                      </div>
                      <div>
                        <h3 className="font-bold dark:text-white">{pet.name}</h3>
                        <div className="flex items-center text-xs text-gray-600 dark:text-gray-300">
                          <span className="mr-2">Lvl {pet.level}</span>
                          <span className="mr-2">•</span>
                          <span>{PET_TYPES[pet.type as keyof typeof PET_TYPES]}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Pet Details */}
        <div className="lg:col-span-2">
          {selectedPet ? (
            <div>
              <div className="bg-white dark:bg-gray-800 border-4 border-black dark:border-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] rounded-lg p-6 mb-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center">
                  <div className="relative w-24 h-24 mb-4 sm:mb-0 sm:mr-6">
                    <Image
                      src={selectedPet.memecoin.image}
                      alt={selectedPet.name}
                      width={96}
                      height={96}
                      className="rounded-lg object-cover border-4 border-black dark:border-white"
                    />
                    <Badge variant="outline" className="absolute -top-2 -right-2 bg-white dark:bg-gray-800 border-2 border-black dark:border-white">
                      {selectedPet.memecoin.symbol}
                    </Badge>
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center mb-1">
                      <h2 className="text-3xl font-bold mr-2 dark:text-white">{selectedPet.name}</h2>
                      <Badge
                        className={`
                          ${selectedPet.type === 0 ? 'bg-yellow-400 dark:bg-yellow-600' :
                            selectedPet.type === 1 ? 'bg-blue-400 dark:bg-blue-600' :
                              selectedPet.type === 2 ? 'bg-green-400 dark:bg-green-600' : 'bg-purple-400 dark:bg-purple-600'} 
                          border-2 border-black dark:border-white
                        `}
                      >
                        {PET_TYPES[selectedPet.type as keyof typeof PET_TYPES]}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                      Level {selectedPet.level} MemePet •
                      Created from {selectedPet.memecoin.name} memecoin
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="flex justify-between text-sm font-medium mb-1 dark:text-white">
                          <span>Experience</span>
                          <span>{selectedPet.experience}/{selectedPet.level * 100}</span>
                        </div>
                        <Progress
                          value={(selectedPet.experience / (selectedPet.level * 100)) * 100}
                          className="h-3 border-2 border-black dark:border-white"
                          variant="default"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm font-medium mb-1 dark:text-white">
                          <span>Health</span>
                          <span>{selectedPet.health}/100</span>
                        </div>
                        <Progress
                          value={selectedPet.health}
                          className="h-3 border-2 border-black dark:border-white"
                          variant="default"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm font-medium mb-1 dark:text-white">
                          <span>Happiness</span>
                          <span>{selectedPet.happiness}/100</span>
                        </div>
                        <Progress
                          value={selectedPet.happiness}
                          className="h-3 border-2 border-black dark:border-white"
                          variant="default"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <Tabs defaultValue="interact" className="mb-6">
                <TabsList className="mb-4 border-4 border-black dark:border-white">
                  <TabsTrigger value="interact">Interact</TabsTrigger>
                  <TabsTrigger value="missions">Missions</TabsTrigger>
                  <TabsTrigger value="evolution">Evolution</TabsTrigger>
                  <TabsTrigger value="chat">AI Chat</TabsTrigger>
                </TabsList>

                <TabsContent value="interact">
                  <PetInteraction
                    petId={selectedPet.id}
                    onInteractionComplete={handleInteractionComplete}
                  />
                </TabsContent>

                <TabsContent value="missions">
                  <PetMissions
                    petId={selectedPet.id}
                    petLevel={selectedPet.level}
                    activeMission={activeMission}
                    onMissionChange={handleMissionChange}
                  />
                </TabsContent>

                <TabsContent value="evolution">
                  <PetEvolution
                    petId={selectedPet.id}
                    petName={selectedPet.name}
                    petType={selectedPet.type}
                    petLevel={selectedPet.level}
                    petExperience={selectedPet.experience}
                    petMemecoin={selectedPet.memecoin}
                    onEvolve={() => {
                      // In a real app, this would fetch the updated pet data after evolution
                      // For now, we'll simulate a level and stat increase
                      const updatedPets = pets.map(pet => {
                        if (pet.id === selectedPet.id) {
                          return {
                            ...pet,
                            level: pet.level + 5,
                            health: 100,
                            happiness: 100
                          };
                        }
                        return pet;
                      });

                      setPets(updatedPets);
                      setSelectedPet(updatedPets.find(p => p.id === selectedPet.id));
                    }}
                  />
                </TabsContent>

                <TabsContent value="chat">
                  <PetChat
                    petId={selectedPet.id}
                    petName={selectedPet.name}
                    petType={selectedPet.type}
                    petMemecoin={selectedPet.memecoin}
                  />
                </TabsContent>
              </Tabs>
            </div>
          ) : (
            <div className="flex flex-col gap-4 bg-white dark:bg-gray-800 border-4 border-black dark:border-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] rounded-lg p-8 text-center">
              <div className="flex justify-center items-center">
                <Image
                  src='/pets/select_pet.webp'
                  width={180}
                  height={180}
                  alt="Sad_puppy"
                  className="rounded-lg"
                />
              </div>
              <h3 className="text-xl font-bold mb-2 dark:text-white">Select a Pet</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Choose one of your pets from the list to view details and interact with them.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 