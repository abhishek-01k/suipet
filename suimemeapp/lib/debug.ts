// Debug utilities for contract interactions

export function logTransaction(description: string, tx: any) {
  console.group(`🔍 ${description}`);
  console.log('Transaction object:', tx);
  console.log('Transaction JSON:', JSON.stringify(tx, null, 2));
  console.groupEnd();
}

export function logError(context: string, error: any) {
  console.group(`❌ Error in ${context}`);
  console.error('Error details:', error);
  console.error('Error message:', error?.message);
  console.error('Error stack:', error?.stack);
  
  // Parse Sui-specific errors
  if (error?.data?.stack) {
    console.error('Sui error stack:', error.data.stack);
  }
  
  if (error?.shape?.message) {
    console.error('Shaped error message:', error.shape.message);
  }
  
  console.groupEnd();
}

export function logSuccess(context: string, result: any) {
  console.group(`✅ Success in ${context}`);
  console.log('Result:', result);
  console.log('Transaction digest:', result?.digest);
  console.log('Effects:', result?.effects);
  console.groupEnd();
} 