// Test utilities for contract interaction

import { createPetTransaction } from './contractInteraction';
import { SUPPORTED_MEMECOINS } from '@/constants/memecoins';

export function testCreatePetTransaction() {
  try {
    const tx = createPetTransaction({
      name: "Luna",
      petType: 0,
      memecoinAddress: SUPPORTED_MEMECOINS[0].address,
      imageUrl: SUPPORTED_MEMECOINS[0].image,
      paymentAmount: 0.1
    });

    console.group('🧪 Transaction Test');
    console.log('Transaction created successfully:', tx);
    console.log('Transaction type:', typeof tx);
    console.log('Transaction constructor:', tx.constructor.name);
    
    // Serialize to check structure
    try {
      const serialized = tx.serialize();
      console.log('Serialization successful');
      console.log('Serialized length:', serialized.length);
    } catch (serError) {
      console.error('Serialization error:', serError);
    }
    
    console.groupEnd();
    return true;
  } catch (error) {
    console.error('❌ Transaction creation failed:', error);
    return false;
  }
}

export function logTransactionStructure(tx: any) {
  console.group('🔍 Transaction Structure Analysis');
  console.log('Transaction object:', tx);
  console.log('Available methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(tx)));
  console.log('Transaction data:', {
    inputs: tx.getData?.()?.inputs || 'Not available',
    commands: tx.getData?.()?.commands || 'Not available'
  });
  console.groupEnd();
} 