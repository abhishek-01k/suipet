"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useCurrentAccount, useSuiClient } from "@mysten/dapp-kit";
import { Button } from "@/components/ui/8bit/button";
import { Card } from "@/components/ui/8bit/card";
import { Input } from "@/components/ui/8bit/input";
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

import MarketplaceListing from "@/components/marketplace-listing";
import { useWallet } from "@/hooks/useWallet";
import { 
  listPetTransaction, 
  buyPetTransaction, 
  cancelListingTransaction, 
  PACKAGE_ID 
} from "@/lib/contractInteraction";

// Type definitions for our marketplace
interface Pet {
  id: string;
  name: string;
  type: number;
  level: number;
  memecoin: {
    name: string;
    symbol: string;
    image: string;
  };
}

interface Listing {
  id: string;
  pet: Pet;
  price: number;
  seller: string;
}

export default function Marketplace() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [myPets, setMyPets] = useState<Pet[]>([]);
  const [isListModalOpen, setIsListModalOpen] = useState(false);
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [price, setPrice] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  
  const account = useCurrentAccount();
  const suiClient = useSuiClient();
  const { executeTransaction, isTransacting } = useWallet();
  
  // Fetch listings and pets
  useEffect(() => {
    const fetchData = async () => {
      if (!account) {
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        
        // Get marketplace listings
        const listingsResponse = await suiClient.getOwnedObjects({
          owner: PACKAGE_ID, // The marketplace contract owns the listings
          options: { showContent: true, showDisplay: true },
          filter: { StructType: `${PACKAGE_ID}::pet_market::Listing` }
        });
        
        // Process listings
        const marketListings = await Promise.all(listingsResponse.data.map(async (obj) => {
          if (!obj.data?.content?.fields) return null;
          
          const fields = obj.data.content.fields;
          
          // Get pet object
          const petObjectId = fields.pet_id;
          const petResponse = await suiClient.getObject({
            id: petObjectId,
            options: { showContent: true, showDisplay: true }
          });
          
          if (!petResponse.data?.content?.fields) return null;
          
          const petFields = petResponse.data.content.fields;
          const memecoinAddress = petFields.memecoin_address;
          
          // You would normally fetch memecoin details from your database or constants
          const memecoin = {
            name: petFields.memecoin_name || "Unknown",
            symbol: petFields.memecoin_symbol || "UNKNOWN",
            image: petFields.image_url || "/sample/default.png"
          };
          
          return {
            id: obj.data.objectId,
            pet: {
              id: petObjectId,
              name: petFields.name,
              type: Number(petFields.pet_type),
              level: Number(petFields.level),
              memecoin
            },
            price: Number(fields.price) / 1_000_000_000, // Convert from MIST to SUI
            seller: fields.seller
          };
        }));
        
        // Filter out null values
        const validListings = marketListings.filter(listing => listing !== null) as Listing[];
        setListings(validListings);
        
        // Get user's pets that aren't listed
        const userPetsResponse = await suiClient.getOwnedObjects({
          owner: account.address,
          options: { showContent: true, showDisplay: true },
          filter: { StructType: `${PACKAGE_ID}::memepet::Pet` }
        });
        
        const pets = userPetsResponse.data.map(obj => {
          if (!obj.data?.content?.fields) return null;
          
          const fields = obj.data.content.fields;
          const memecoinAddress = fields.memecoin_address;
          
          // You would fetch these details from your memecoin constants
          const memecoin = {
            name: fields.memecoin_name || "Unknown",
            symbol: fields.memecoin_symbol || "UNKNOWN",
            image: fields.image_url || "/sample/default.png"
          };
          
          return {
            id: obj.data.objectId,
            name: fields.name,
            type: Number(fields.pet_type),
            level: Number(fields.level),
            memecoin
          };
        }).filter(pet => pet !== null) as Pet[];
        
        setMyPets(pets);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching marketplace data:", error);
        toast.error("Failed to load marketplace data");
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [account, suiClient]);
  
  const handleBuy = async (listingId: string) => {
    if (!account) {
      toast.error("Please connect your wallet first");
      return;
    }
    
    try {
      // Find the listing to get the price
      const listing = listings.find(l => l.id === listingId);
      if (!listing) {
        toast.error("Listing not found");
        return;
      }
      
      // Create transaction
      const tx = buyPetTransaction({
        listingId,
        price: listing.price
      });
      
      // Execute transaction
      const result = await executeTransaction(tx);
      
      if (result) {
        toast.success("Pet purchased successfully!");
        // Update listings by removing the bought listing
        setListings(listings.filter(l => l.id !== listingId));
      }
    } catch (error) {
      console.error("Error buying pet:", error);
      toast.error(`Failed to buy pet: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };
  
  const handleListPet = async () => {
    if (!account || !selectedPet || !price) {
      toast.error("Please select a pet and enter a price");
      return;
    }
    
    const priceValue = parseFloat(price);
    if (isNaN(priceValue) || priceValue <= 0) {
      toast.error("Please enter a valid price");
      return;
    }
    
    try {
      // Create listing transaction
      const tx = listPetTransaction({
        petId: selectedPet.id,
        price: priceValue
      });
      
      // Execute transaction
      const result = await executeTransaction(tx);
      
      if (result) {
        toast.success("Pet listed successfully!");
        setIsListModalOpen(false);
        setSelectedPet(null);
        setPrice("");
        
        // You would typically refetch the data here
        // For now, we'll just remove the pet from myPets
        setMyPets(myPets.filter(p => p.id !== selectedPet.id));
      }
    } catch (error) {
      console.error("Error listing pet:", error);
      toast.error(`Failed to list pet: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };
  
  const handleCancelListing = async (listingId: string) => {
    try {
      // Create cancel listing transaction
      const tx = cancelListingTransaction(listingId);
      
      // Execute transaction
      const result = await executeTransaction(tx);
      
      if (result) {
        toast.success("Listing cancelled successfully!");
        // Update listings by removing the cancelled listing
        setListings(listings.filter(l => l.id !== listingId));
      }
    } catch (error) {
      console.error("Error cancelling listing:", error);
      toast.error(`Failed to cancel listing: ${error instanceof Error ? error.message : "Unknown error"}`);
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
                  onCancel={handleCancelListing}
                  isLoading={isLoading}
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
            
            {myPets.length === 0 ? (
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
                    {myPets.map((pet) => (
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
                  <Button onClick={handleListPet} disabled={!selectedPet || !price || isLoading} className="flex-1">
                    {isLoading ? "Listing..." : "List Pet"}
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