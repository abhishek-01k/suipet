// List of supported memecoins for MemePet
// Each memecoin has a name, symbol, description, image, and address

export interface Memecoin {
  id: string;
  name: string;
  symbol: string;
  description: string;
  image: string;
  address: string;
  petType: number; // Default pet type to assign
}

export const SUPPORTED_MEMECOINS: Memecoin[] = [
  {
    id: 'uni',
    name: 'UNI',
    symbol: 'UNI',
    description: 'UNI is the dog of Sui co-founder, represented as a memecoin. UNI pets have enhanced loyalty and playfulness!',
    image: '/memecoins/uni.png',
    address: '0xc905c9263609d6ea700ff6267978107336beab3df377d58a1c53f6e25b7630ee', // Will be updated with real address
    petType: 0 // Dog
  },
  {
    id: 'glub',
    name: 'GLUB',
    symbol: 'GLUB',
    description: 'GLUB is an aquatic-themed memecoin on Sui. GLUB pets excel at water-based missions!',
    image: '/memecoins/glub.webp',
    address: '0x33fb202f090f797eab5dc35e64cffbb051341dc4df6af4c3fba685390bf94df7', // Will be updated with real address
    petType: 2 // Fish
  },
  {
    id: 'lofi',
    name: 'LOFI',
    symbol: 'LOFI',
    description: 'LOFI promotes relaxation and chill vibes on Sui. LOFI pets have increased happiness regeneration!',
    image: '/memecoins/lofi.webp',
    address: '0xd6918afa64d432b84b48088d165b0dda0b7459463a7d66365f7ff890cae22d2d', // Will be updated with real address
    petType: 1 // Cat
  }
];

// Helper function to get memecoin by ID
export function getMemecoinById(id: string): Memecoin | undefined {
  return SUPPORTED_MEMECOINS.find(coin => coin.id === id);
}

// Helper function to get memecoin by address
export function getMemecoinByAddress(address: string): Memecoin | undefined {
  return SUPPORTED_MEMECOINS.find(coin => coin.address === address);
} 