import React from 'react';
import Image from 'next/image';
import { SUPPORTED_MEMECOINS, Memecoin } from '../constants/memecoins';

interface MemecoinSelectorProps {
  selectedMemecoin: Memecoin | null;
  onSelect: (memecoin: Memecoin) => void;
}

export default function MemecoinSelector({ selectedMemecoin, onSelect }: MemecoinSelectorProps) {
  return (
    <div className="w-full">
      <h3 className="text-xl font-bold mb-4">Select a Memecoin</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {SUPPORTED_MEMECOINS.map((memecoin) => (
          <div
            key={memecoin.id}
            className={`
              border-4 p-4 rounded-lg cursor-pointer transition-all duration-200 
              ${selectedMemecoin?.id === memecoin.id 
                ? 'border-yellow-500 bg-yellow-100 transform scale-105 shadow-lg' 
                : 'border-gray-300 hover:border-gray-500 hover:shadow-md'}
            `}
            onClick={() => onSelect(memecoin)}
          >
            <div className="flex items-center mb-2">
              <div className="relative w-12 h-12 mr-2">
                <Image
                  src={memecoin.image}
                  alt={memecoin.name}
                  fill
                  className="object-contain rounded-full"
                />
              </div>
              <div>
                <h4 className="font-bold">{memecoin.name}</h4>
                <p className="text-sm text-gray-600">{memecoin.symbol}</p>
              </div>
            </div>
            <p className="text-sm text-gray-800">{memecoin.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
} 