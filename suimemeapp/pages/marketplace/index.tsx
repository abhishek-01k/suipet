"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useCurrentAccount, useSuiClient } from "@mysten/dapp-kit";
import { Button } from "@/components/ui/8bit/button";
import { Card } from "@/components/ui/8bit/card";
import { Input } from "@/components/ui/8bit/input";
import MarketplaceListing from "@/components/marketplace-listing";

// Mock marketplace data
const MOCK_LISTINGS = [
  {
    id: "0x789",
    pet: {
      id: "0xabc",
      name: "SuperDoge",
      type: 0,
      level: 8,
      memecoin: {
        name: "Dogecoin",
        symbol: "DOGE",
        image: "/sample/doge.png"
      }
    },
    price: 0.5, // In SUI
    seller: "0x123456"
  },
  {
    id: "0xdef",
    pet: {
      id: "0xfed",
      name: "MoonKitty",
      type: 1,
      level: 4,
      memecoin: {
        name: "Shiba Inu",
        symbol: "SHIB",
        image: "/sample/shib.png"
      }
    },
    price: 0.3, // In SUI
    seller: "0x654321"
  },
  {
    id: "0x111",
    pet: {
      id: "0x222",
      name: "BubbleFish",
      type: 2,
      level: 6,
      memecoin: {
        name: "Pepe",
        symbol: "PEPE",
        image: "/sample/pepe.png"
      }
    },
    price: 0.8, // In SUI
    seller: "0x789012"
  }
];

// Mock my pet data (for listing)
const MY_PETS = [
  {
    id: "0x123",
    name: "Doggo",
    type: 0,
    level: 5,
    memecoin: {
      name: "Dogecoin",
      symbol: "DOGE",
      image: "/sample/doge.png"
    }
  },
  {
    id: "0x456",
    name: "Kitty",
    type: 1,
    level: 3,
    memecoin: {
      name: "Shiba Inu",
      symbol: "SHIB",
      image: "/sample/shib.png"
    }
  }
];

export default function Marketplace() {
  const [listings, setListings] = useState(MOCK_LISTINGS);
  const [isListModalOpen, setIsListModalOpen] = useState(false);
  const [selectedPet, setSelectedPet] = useState<any>(null);
  const [price, setPrice] = useState("");
  const [isListing, setIsListing] = useState(false);
  const [filter, setFilter] = useState("all");
  
  const account = useCurrentAccount();
  const suiClient = useSuiClient();
  
  const handleBuy = (listingId: string) => {
    if (!account) return;
    
    // In a real app, this would call the smart contract
    console.log(`Buying pet from listing ${listingId}`);
    
    // Mock removing the listing after purchase
    setListings(listings.filter(listing => listing.id !== listingId));
  };
  
  const handleList = async () => {
    if (!account || !selectedPet || !price) return;
    
    const priceValue = parseFloat(price);
    if (isNaN(priceValue) || priceValue <= 0) {
      alert("Please enter a valid price");
      return;
    }
    
    setIsListing(true);
    
    try {
      // In a real app, this would call the smart contract
      console.log(`Listing pet ${selectedPet.name} for ${price} SUI`);
      
      // Mock adding a new listing
      const newListing = {
        id: `0x${Math.floor(Math.random() * 1000000).toString(16)}`,
        pet: selectedPet,
        price: priceValue,
        seller: account.address
      };
      
      setListings([...listings, newListing]);
      setIsListModalOpen(false);
      setSelectedPet(null);
      setPrice("");
    } catch (error) {
      console.error("Error listing pet:", error);
      alert("Failed to list pet. See console for details.");
    } finally {
      setIsListing(false);
    }
  };
  
  const filteredListings = filter === "all" 
    ? listings 
    : filter === "dogs" 
    ? listings.filter(listing => listing.pet.type === 0)
    : filter === "cats"
    ? listings.filter(listing => listing.pet.type === 1)
    : listings.filter(listing => listing.pet.type === 2);
  
  return (
    <main className="flex min-h-screen flex-col items-center">
      <div className="w-full max-w-6xl mx-auto py-16 px-4">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <h1 className="text-3xl font-bold mb-4 md:mb-0">MemePet Marketplace</h1>
          
          <div className="flex gap-4">
            <Button onClick={() => setIsListModalOpen(true)} disabled={!account}>
              List a Pet
            </Button>
          </div>
        </div>
        
        {/* Filter Options */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 rounded-full ${filter === "all" ? "bg-purple-500 text-white" : "bg-gray-200"}`}
            >
              All Pets
            </button>
            <button
              onClick={() => setFilter("dogs")}
              className={`px-4 py-2 rounded-full ${filter === "dogs" ? "bg-purple-500 text-white" : "bg-gray-200"}`}
            >
              Dogs
            </button>
            <button
              onClick={() => setFilter("cats")}
              className={`px-4 py-2 rounded-full ${filter === "cats" ? "bg-purple-500 text-white" : "bg-gray-200"}`}
            >
              Cats
            </button>
            <button
              onClick={() => setFilter("fish")}
              className={`px-4 py-2 rounded-full ${filter === "fish" ? "bg-purple-500 text-white" : "bg-gray-200"}`}
            >
              Fish
            </button>
          </div>
        </div>
        
        {!account ? (
          <Card className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Connect Your Wallet</h2>
            <p className="mb-6 text-gray-600">
              Connect your wallet to browse and purchase MemePets.
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {filteredListings.length > 0 ? (
              filteredListings.map((listing) => (
                <MarketplaceListing
                  key={listing.id}
                  listing={listing}
                  onBuy={handleBuy}
                  isCurrentUserSeller={account?.address === listing.seller}
                  onCancel={(listingId) => {
                    // Remove the listing (in a real app, would call contract)
                    setListings(listings.filter(l => l.id !== listingId));
                  }}
                  isLoading={isListing}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-10">
                <h3 className="text-xl font-bold mb-2">No listings found</h3>
                <p className="text-gray-600">Try a different filter or check back later.</p>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* List Pet Modal */}
      {isListModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md bg-white rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-6">List a Pet for Sale</h2>
            
            {MY_PETS.length === 0 ? (
              <div className="text-center py-8">
                <p className="mb-4">You don't have any pets available to list.</p>
                <Link href="/create-pet">
                  <Button>Create a Pet</Button>
                </Link>
              </div>
            ) : (
              <>
                <div className="mb-6">
                  <label className="block mb-2 font-medium">Select Pet</label>
                  <div className="grid grid-cols-1 gap-2">
                    {MY_PETS.map((pet) => (
                      <button
                        key={pet.id}
                        type="button"
                        onClick={() => setSelectedPet(pet)}
                        className={`p-4 border-2 ${selectedPet?.id === pet.id ? 'border-purple-500 bg-purple-50' : 'border-gray-300'} rounded-md flex items-center gap-4`}
                      >
                        <div className="relative w-12 h-12">
                          <Image
                            src={pet.memecoin.image}
                            alt={pet.name}
                            fill
                            className="object-contain"
                          />
                        </div>
                        <div className="text-left">
                          <p className="font-bold">{pet.name}</p>
                          <p className="text-sm text-gray-600">Level {pet.level} • {pet.memecoin.symbol}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="mb-6">
                  <label className="block mb-2 font-medium">Price (SUI)</label>
                  <Input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="0.5"
                    min="0.01"
                    step="0.01"
                    required
                  />
                </div>
                
                <div className="flex gap-4">
                  <Button onClick={handleList} disabled={!selectedPet || !price || isListing} className="flex-1">
                    {isListing ? "Listing..." : "List Pet"}
                  </Button>
                  <Button onClick={() => setIsListModalOpen(false)} variant="outline" className="flex-1">
                    Cancel
                  </Button>
                </div>
              </>
            )}
          </Card>
        </div>
      )}
    </main>
  );
} 