import { TransactionBlock } from '@mysten/sui.js/transactions';

// @kamal Get package ID from environment or use default for development
// This should be updated after deployment with the actual package ID
export const PACKAGE_ID = process.env.NEXT_PUBLIC_MEMEPET_PACKAGE_ID || '0x0'; 

// Supported memecoin addresses
export const MEMECOIN_ADDRESSES = {
  UNI: process.env.NEXT_PUBLIC_UNI_ADDRESS || '0x123456',
  GLUB: process.env.NEXT_PUBLIC_GLUB_ADDRESS || '0x234567',
  LOFI: process.env.NEXT_PUBLIC_LOFI_ADDRESS || '0x345678',
};

// System clock object ID on Sui
export const CLOCK_OBJECT_ID = '0x6';

export interface CreatePetParams {
  name: string;
  petType: number;
  memecoinAddress: string;
  imageUrl: string;
  paymentAmount: number; // In SUI (will be converted to MIST)
}

export interface StartMissionParams {
  petId: string;
  missionType: number;
  difficulty: number;
}

export interface CompleteMissionParams {
  missionId: string;
  petId: string;
}

export interface ListPetParams {
  petId: string;
  price: number; // In SUI (will be converted to MIST)
}

export interface BuyPetParams {
  listingId: string;
  price: number; // In SUI (will be converted to MIST)
}

/**
 * Creates a transaction to mint a new pet
 */
export function createPetTransaction(params: CreatePetParams): TransactionBlock {
  const { name, petType, memecoinAddress, imageUrl, paymentAmount } = params;
  
  const tx = new TransactionBlock();
  
  // Convert SUI to MIST (1 SUI = 10^9 MIST)
  const paymentMist = BigInt(paymentAmount * 1_000_000_000);
  
  // Split coin for payment
  const [coin] = tx.splitCoins(tx.gas, [tx.pure(paymentMist)]);
  
  // Call the create_pet function
  tx.moveCall({
    target: `${PACKAGE_ID}::memepet::create_pet`,
    arguments: [
      tx.pure(name),
      tx.pure(petType),
      tx.pure(memecoinAddress),
      tx.pure(imageUrl),
      coin,
    ],
  });
  
  return tx;
}

/**
 * Creates a transaction to interact with a pet (feed, play, train)
 */
export function petInteractionTransaction(petId: string, action: 'feed' | 'play' | 'train'): TransactionBlock {
  const tx = new TransactionBlock();
  
  // Get the pet object
  const pet = tx.object(petId);
  
  // Call the appropriate function based on the action
  if (action === 'feed') {
    tx.moveCall({
      target: `${PACKAGE_ID}::memepet::feed_pet`,
      arguments: [pet],
    });
  } else if (action === 'play') {
    tx.moveCall({
      target: `${PACKAGE_ID}::memepet::interact_with_pet`,
      arguments: [pet],
    });
  } else if (action === 'train') {
    tx.moveCall({
      target: `${PACKAGE_ID}::memepet::train_pet`,
      arguments: [pet],
    });
  }
  
  return tx;
}

/**
 * Creates a transaction to start a mission
 */
export function startMissionTransaction(params: StartMissionParams): TransactionBlock {
  const { petId, missionType, difficulty } = params;
  
  const tx = new TransactionBlock();
  
  // Get the pet object and shared clock object
  const pet = tx.object(petId);
  const clock = tx.object(CLOCK_OBJECT_ID); // Use the constant
  
  // Call the start_mission function
  tx.moveCall({
    target: `${PACKAGE_ID}::pet_actions::start_mission`,
    arguments: [
      pet,
      tx.pure(missionType),
      tx.pure(difficulty),
      clock,
    ],
  });
  
  return tx;
}

/**
 * Creates a transaction to complete a mission
 */
export function completeMissionTransaction(params: CompleteMissionParams): TransactionBlock {
  const { missionId, petId } = params;
  
  const tx = new TransactionBlock();
  
  // Get the mission object, pet object, and shared clock object
  const mission = tx.object(missionId);
  const pet = tx.object(petId);
  const clock = tx.object(CLOCK_OBJECT_ID); // Use the constant
  
  // Call the complete_mission function
  tx.moveCall({
    target: `${PACKAGE_ID}::pet_actions::complete_mission`,
    arguments: [
      mission,
      pet,
      clock,
    ],
  });
  
  return tx;
}

/**
 * Creates a transaction to list a pet on the marketplace
 */
export function listPetTransaction(params: ListPetParams): TransactionBlock {
  const { petId, price } = params;
  
  const tx = new TransactionBlock();
  
  // Convert SUI to MIST (1 SUI = 10^9 MIST)
  const priceMist = BigInt(price * 1_000_000_000);
  
  // Get the pet object
  const pet = tx.object(petId);
  
  // Call the create_listing function
  tx.moveCall({
    target: `${PACKAGE_ID}::pet_market::create_listing`,
    arguments: [
      pet,
      tx.pure(priceMist),
    ],
  });
  
  return tx;
}

/**
 * Creates a transaction to buy a pet from the marketplace
 */
export function buyPetTransaction(params: BuyPetParams): TransactionBlock {
  const { listingId, price } = params;
  
  const tx = new TransactionBlock();
  
  // Convert SUI to MIST (1 SUI = 10^9 MIST)
  const priceMist = BigInt(price * 1_000_000_000);
  
  // Split coin for payment
  const [coin] = tx.splitCoins(tx.gas, [tx.pure(priceMist)]);
  
  // Get the listing object
  const listing = tx.object(listingId);
  
  // Call the buy_pet function
  tx.moveCall({
    target: `${PACKAGE_ID}::pet_market::buy_pet`,
    arguments: [
      listing,
      coin,
    ],
  });
  
  return tx;
}

/**
 * Creates a transaction to cancel a marketplace listing
 */
export function cancelListingTransaction(listingId: string): TransactionBlock {
  const tx = new TransactionBlock();
  
  // Get the listing object
  const listing = tx.object(listingId);
  
  // Call the cancel_listing function
  tx.moveCall({
    target: `${PACKAGE_ID}::pet_market::cancel_listing`,
    arguments: [listing],
  });
  
  return tx;
} 