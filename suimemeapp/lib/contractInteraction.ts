import { Transaction } from '@mysten/sui/transactions';

// Update with the actual package ID from deployment
export const PACKAGE_ID = '0xd4ee2dfed544edb28216f7dd587416817afa7f69ca9e9683fdfc529871dff059';

// Admin Cap object ID from deployment
export const ADMIN_CAP_ID = '0x7925580cb274c7d5c89207d72e53fc2862b4830865b813bd95d1be62bbfb64f8';

// Supported memecoin addresses
export const MEMECOIN_ADDRESSES = {
  UNI: process.env.NEXT_PUBLIC_UNI_ADDRESS || '0xc905c9263609d6ea700ff6267978107336beab3df377d58a1c53f6e25b7630ee',
  GLUB: process.env.NEXT_PUBLIC_GLUB_ADDRESS || '0x33fb202f090f797eab5dc35e64cffbb051341dc4df6af4c3fba685390bf94df7',
  LOFI: process.env.NEXT_PUBLIC_LOFI_ADDRESS || '0xd6918afa64d432b84b48088d165b0dda0b7459463a7d66365f7ff890cae22d2d',
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

export interface SaveChatMessageParams {
  petId: string;
  message: string;
  isFromPet: boolean;
  timestamp: number;
}

// Add this new interface for pet evolution
export interface PetEvolutionParams {
  petId: string;
  currentStage: number;
  nextStage: number;
}

/**
 * Creates a transaction to mint a new pet
 */
export function createPetTransaction(params: CreatePetParams): Transaction {
  const { name, petType, memecoinAddress, imageUrl, paymentAmount } = params;
  
  const tx = new Transaction();
  
  // Convert SUI to MIST (1 SUI = 10^9 MIST)
  const paymentMist = paymentAmount * 1_000_000_000;
  
  // For gas budget, add extra for the payment amount plus execution costs
  tx.setGasBudget(paymentMist + 10_000_000); // Extra 0.01 SUI for execution
  
  // Call the create_pet function - pass the gas coin directly as mutable reference
  // The Move contract will split the required amount from it
  tx.moveCall({
    target: `${PACKAGE_ID}::memepet::create_pet`,
    arguments: [
      tx.pure.vector("u8", Array.from(new TextEncoder().encode(name))),
      tx.pure.u8(petType),
      tx.pure.address(memecoinAddress),
      tx.pure.vector("u8", Array.from(new TextEncoder().encode(imageUrl))),
      tx.gas, // Pass gas coin directly as mutable reference
    ],
  });
  
  return tx;
}

/**
 * Creates a transaction to interact with a pet (feed, play, train)
 */
export function petInteractionTransaction(petId: string, action: 'feed' | 'play' | 'train'): Transaction {
  const tx = new Transaction();
  
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
export function startMissionTransaction(params: StartMissionParams): Transaction {
  const { petId, missionType, difficulty } = params;
  
  const tx = new Transaction();
  
  // Get the pet object and shared clock object
  const pet = tx.object(petId);
  const clock = tx.object(CLOCK_OBJECT_ID); // Use the constant
  
  // Call the start_mission function
  tx.moveCall({
    target: `${PACKAGE_ID}::pet_actions::start_mission`,
    arguments: [
      pet,
      tx.pure.u8(missionType),
      tx.pure.u8(difficulty),
      clock,
    ],
  });
  
  return tx;
}

/**
 * Creates a transaction to complete a mission
 */
export function completeMissionTransaction(params: CompleteMissionParams): Transaction {
  const { missionId, petId } = params;
  
  const tx = new Transaction();
  
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
export function listPetTransaction(params: ListPetParams): Transaction {
  const { petId, price } = params;
  
  const tx = new Transaction();
  
  // Convert SUI to MIST (1 SUI = 10^9 MIST)
  const priceMist = price * 1_000_000_000;
  
  // Get the pet object
  const pet = tx.object(petId);
  
  // Call the create_listing function
  tx.moveCall({
    target: `${PACKAGE_ID}::pet_market::create_listing`,
    arguments: [
      pet,
      tx.pure.u64(priceMist),
    ],
  });
  
  return tx;
}

/**
 * Creates a transaction to buy a pet from the marketplace
 */
export function buyPetTransaction(params: BuyPetParams): Transaction {
  const { listingId, price } = params;
  
  const tx = new Transaction();
  
  // Convert SUI to MIST (1 SUI = 10^9 MIST)
  const priceMist = price * 1_000_000_000;
  
  // Split coin for payment
  const [coin] = tx.splitCoins(tx.gas, [priceMist]);
  
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
 * Creates a transaction to cancel a listing
 */
export function cancelListingTransaction(listingId: string): Transaction {
  const tx = new Transaction();
  
  // Get the listing object
  const listing = tx.object(listingId);
  
  // Call the cancel_listing function
  tx.moveCall({
    target: `${PACKAGE_ID}::pet_market::cancel_listing`,
    arguments: [listing],
  });
  
  return tx;
}

/**
 * Creates a transaction to save a chat message (for AI chat feature)
 */
export function saveChatMessageTransaction(params: SaveChatMessageParams): Transaction {
  const { petId, message, isFromPet, timestamp } = params;
  
  const tx = new Transaction();
  
  // Get the pet object
  const pet = tx.object(petId);
  
  // Call a function to save chat messages (this would need to be added to the contract)
  tx.moveCall({
    target: `${PACKAGE_ID}::memepet::save_chat_message`,
    arguments: [
      pet,
      tx.pure.string(message),
      tx.pure.bool(isFromPet),
      tx.pure.u64(timestamp),
    ],
  });
  
  return tx;
}

/**
 * Creates a transaction for evolving a pet to the next stage
 */
export function petEvolutionTransaction(params: PetEvolutionParams): Transaction {
  const { petId, currentStage, nextStage } = params;
  
  const tx = new Transaction();
  
  // Get the pet object
  const pet = tx.object(petId);
  const clock = tx.object(CLOCK_OBJECT_ID);
  
  // Call the evolve_pet function
  tx.moveCall({
    target: `${PACKAGE_ID}::memepet::evolve_pet`,
    arguments: [
      pet,
      tx.pure.u8(nextStage),
      clock,
    ],
  });
  
  return tx;
}