import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Button } from './ui/8bit/button';
import { Badge } from './ui/8bit/badge';

// Pet type names
const PET_TYPES = {
  0: "Dog",
  1: "Fish",
  2: "Yeti",
  3: "Custom"
};

interface MarketplaceListingProps {
  listing: {
    id: string;
    pet: {
      id: string;
      name: string;
      type: number;
      level: number;
      memecoin: {
        name: string;
        symbol: string;
        image: string;
      };
    };
    price: number;
    seller: string;
  };
  onBuy: (listingId: string) => void;
  isCurrentUserSeller: boolean;
  onCancel?: (listingId: string) => void;
  isLoading?: boolean;
}

export default function MarketplaceListing({
  listing,
  onBuy,
  isCurrentUserSeller,
  onCancel,
  isLoading = false
}: MarketplaceListingProps) {
  // Format the price to 3 decimal places max
  const formattedPrice = listing.price.toFixed(Math.min(3, listing.price.toString().split('.')[1]?.length || 0));
  
  return (
    <motion.div
      className="bg-white border-4 border-black rounded-lg shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden"
      whileHover={{ translateY: -5 }}
      transition={{ duration: 0.2 }}
    >
      <div className="relative aspect-square">
        <Image
          src={listing.pet.memecoin.image}
          alt={listing.pet.name}
          fill
          className="object-cover"
        />
        <Badge className="absolute top-2 right-2 bg-white/90 border-2 border-black">
          {listing.pet.memecoin.symbol}
        </Badge>
      </div>
      
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-bold truncate">{listing.pet.name}</h3>
          <Badge className={`
            ${listing.pet.type === 0 ? 'bg-yellow-400' : 
              listing.pet.type === 1 ? 'bg-blue-400' : 
              listing.pet.type === 2 ? 'bg-green-400' : 'bg-purple-400'} 
            border-2 border-black
          `}>
            {PET_TYPES[listing.pet.type as keyof typeof PET_TYPES]}
          </Badge>
        </div>
        
        <div className="text-sm text-gray-600 mb-3">
          Level {listing.pet.level} • {listing.pet.memecoin.name}
        </div>
        
        <div className="flex items-center justify-between mb-4">
          <div className="text-2xl font-bold text-green-700">{formattedPrice} SUI</div>
        </div>
        
        {isCurrentUserSeller ? (
          <Button 
            variant="destructive" 
            onClick={() => onCancel?.(listing.id)}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? 'Canceling...' : 'Cancel Listing'}
          </Button>
        ) : (
          <Button 
            onClick={() => onBuy(listing.id)}
            disabled={isLoading}
            className="w-full bg-purple-500 hover:bg-purple-600 border-2 border-black"
          >
            {isLoading ? 'Buying...' : 'Buy Now'}
          </Button>
        )}
        
        <div className="mt-2 text-xs text-gray-500 truncate">
          ID: {listing.id.substring(0, 10)}...
        </div>
      </div>
    </motion.div>
  );
} 