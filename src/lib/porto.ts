import { Porto } from 'porto';

let portoInstance: Porto | null = null;

/**
 * Initialize Porto SDK instance
 * Returns existing instance if already initialized
 */
export async function initializePorto(): Promise<Porto> {
  if (portoInstance) {
    return portoInstance;
  }

  try {
    // Initialize Porto without any parameters
    portoInstance = Porto.create();
    console.log('Porto initialized:', portoInstance);
    return portoInstance;
  } catch (error) {
    console.error('Failed to initialize Porto:', error);
    throw error;
  }
}

/**
 * Connect wallet using Porto
 * Returns the first connected account address
 */
export async function connectWallet(): Promise<string> {
  const porto = await initializePorto();

  try {
    // Use the provider.request method as shown in docs
    const result = await porto.provider.request({
      method: 'wallet_connect'
    });

    console.log('Connected:', result);
    if (result.accounts && Array.isArray(result.accounts) && result.accounts.length > 0) {
      return result.accounts[0];
    }
    throw new Error('No accounts returned from connection');
  } catch (error) {
    console.error('Failed to connect:', error);
    throw error;
  }
}

/**
 * Get current accounts from Porto
 */
export async function getAccounts(): Promise<string[]> {
  const porto = await initializePorto();

  try {
    const result = await porto.provider.request({
      method: 'eth_accounts'
    });

    return Array.isArray(result) ? result : [];
  } catch (error) {
    console.error('Failed to get accounts:', error);
    return [];
  }
}

/**
 * Disconnect wallet
 */
export async function disconnectWallet(): Promise<void> {
  const porto = await initializePorto();

  try {
    await porto.provider.request({
      method: 'wallet_disconnect'
    });
    console.log('Wallet disconnected');
  } catch (error) {
    console.error('Failed to disconnect:', error);
    throw error;
  }
}

/**
 * Get the Porto instance (for advanced usage)
 */
export function getPortoInstance(): Porto | null {
  return portoInstance;
}

