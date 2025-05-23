// Environment and configuration check utilities

import { PACKAGE_ID, ADMIN_CAP_ID } from './contractInteraction';

export function checkEnvironment() {
  const checks = {
    packageId: PACKAGE_ID.length > 10 && !PACKAGE_ID.includes('0x0'),
    adminCapId: ADMIN_CAP_ID.length > 10 && !ADMIN_CAP_ID.includes('0x0'),
    window: typeof window !== 'undefined',
    wallet: typeof window !== 'undefined' && 'sui' in window,
  };

  console.group('🔧 Environment Check');
  console.log('Package ID:', PACKAGE_ID, checks.packageId ? '✅' : '❌');
  console.log('Admin Cap ID:', ADMIN_CAP_ID, checks.adminCapId ? '✅' : '❌');
  console.log('Browser environment:', checks.window ? '✅' : '❌');
  console.log('Wallet available:', checks.wallet ? '✅' : '❌');
  console.groupEnd();

  return Object.values(checks).every(Boolean);
}

export function logNetworkInfo(suiClient: any) {
  console.group('🌐 Network Information');
  console.log('SUI Client:', suiClient);
  // Add more network debugging info as needed
  console.groupEnd();
} 