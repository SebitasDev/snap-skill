import { useState, useEffect, useCallback } from 'react';
import { Porto } from 'porto';

export function usePortoWallet() {
  const [wallet, setWallet] = useState<{ address: string; isConnected: boolean } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [porto, setPorto] = useState<Porto | null>(null);

  useEffect(() => {
    // Initialize Porto on mount
    const init = async () => {
      try {
        const portoInstance = Porto.create();
        setPorto(portoInstance);
        console.log('Porto initialized');

        // Check if already connected
        try {
          const accounts = await portoInstance.provider.request({
            method: 'eth_accounts'
          });
          console.log('Accounts from eth_accounts:', accounts);
          console.log('First account type:', typeof accounts[0], accounts[0]);
          if (accounts && Array.isArray(accounts) && accounts.length > 0) {
            // Ensure address is a string
            let address = accounts[0];
            if (typeof address !== 'string') {
              // Try to extract from object
              address = (address as any)?.address || (address as any)?.account || address?.toString() || String(address);
              console.log('Address was object, extracted:', address);
            }
            // Final validation - must be a string starting with 0x
            if (typeof address === 'string' && address.startsWith('0x')) {
              console.log('Valid address extracted:', address);
              setWallet({
                address: address,
                isConnected: true,
              });
            } else {
              console.error('Invalid address format after extraction:', address);
            }
          }
        } catch (err) {
          // Not connected, that's fine
          console.log('No existing connection');
        }
      } catch (err) {
        console.error('Failed to initialize Porto:', err);
        setError(err instanceof Error ? err.message : 'Failed to initialize Porto');
      }
    };

    init();
  }, []);

  const connect = useCallback(async () => {
    if (!porto) {
      setError('Porto not initialized');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await porto.provider.request({
        method: 'wallet_connect'
      });

      console.log('Connection result:', result);
      console.log('Accounts from connection:', result.accounts);
      if (result.accounts && Array.isArray(result.accounts) && result.accounts.length > 0) {
        // Ensure address is a string
        let address = result.accounts[0];
        console.log('First account from connection:', address, 'type:', typeof address);
        if (typeof address !== 'string') {
          // Try to extract from object
          address = (address as any)?.address || (address as any)?.account || address?.toString() || String(address);
          console.log('Address was object, extracted:', address);
        }
        // Final validation - must be a string starting with 0x
        if (typeof address === 'string' && address.startsWith('0x')) {
          console.log('Valid address extracted:', address);
          setWallet({
            address: address,
            isConnected: true,
          });
          return address;
        } else {
          console.error('Invalid address format after extraction:', address);
          throw new Error('Invalid address format returned from connection');
        }
      } else {
        throw new Error('No accounts returned from connection');
      }
    } catch (err: any) {
      console.error('Connection failed:', err);
      
      // Handle user rejection specifically
      const errorMessage = err?.message || String(err);
      const errorCode = err?.code || err?.error?.code;
      const errorName = err?.name || err?.constructor?.name;
      
      // Check for UserRejectedRequestError or common rejection patterns
      const isUserRejection = 
        errorName === 'UserRejectedRequestError' ||
        errorName?.includes('UserRejected') ||
        errorCode === 4001 ||
        errorCode === 'USER_REJECTED' ||
        errorMessage.toLowerCase().includes('reject') ||
        errorMessage.toLowerCase().includes('denied') ||
        errorMessage.toLowerCase().includes('cancelled') ||
        errorMessage.toLowerCase().includes('user rejected');
      
      if (isUserRejection) {
        const rejectionMessage = 'Connection cancelled. You can try again when ready.';
        setError(rejectionMessage);
        // Don't throw for user rejection - it's expected behavior
        return;
      }
      
      // For other errors, set error and throw
      const finalMessage = errorMessage || 'Failed to connect wallet';
      setError(finalMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [porto]);

  const disconnect = useCallback(async () => {
    if (!porto) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await porto.provider.request({
        method: 'wallet_disconnect'
      });
      setWallet(null);
    } catch (err) {
      console.error('Disconnect failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to disconnect wallet');
    } finally {
      setLoading(false);
    }
  }, [porto]);

  const getAccounts = useCallback(async () => {
    if (!porto) {
      return [];
    }

    try {
      const accounts = await porto.provider.request({
        method: 'eth_accounts'
      });
      return Array.isArray(accounts) ? accounts : [];
    } catch (err) {
      console.error('Failed to get accounts:', err);
      return [];
    }
  }, [porto]);

  const getBalance = useCallback(async (address: string) => {
    if (!address) {
      console.error('getBalance: No address provided');
      return '0';
    }

    try {
      // Ensure address is a string and properly formatted
      let addressStr = String(address);
      
      // If it's still [object Object], try to extract the actual address
      if (addressStr === '[object Object]' || addressStr.includes('[object')) {
        console.warn('Address is an object, attempting to extract:', address);
        if (typeof address === 'object' && address !== null) {
          addressStr = (address as any).address || (address as any).toString() || JSON.stringify(address);
        }
      }
      
      // Validate it's a valid Ethereum address format
      if (!addressStr.startsWith('0x') || addressStr.length !== 42) {
        console.error('Invalid address format:', addressStr);
        return '0';
      }
      
      console.log('Fetching Sepolia balance for address:', addressStr);
      
      // Query Sepolia blockchain directly via public RPC endpoint (CORS-enabled)
      // Try multiple endpoints for reliability
      const sepoliaRpcUrls = [
        'https://sepolia.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161', // Infura public endpoint
        'https://rpc2.sepolia.org',
        'https://eth-sepolia.g.alchemy.com/v2/demo',
      ];
      
      let data;
      let lastError;
      
      // Try each RPC endpoint until one works
      for (const url of sepoliaRpcUrls) {
        try {
          console.log('Trying RPC endpoint:', url);
          const response = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              jsonrpc: '2.0',
              method: 'eth_getBalance',
              params: [addressStr, 'latest'],
              id: 1,
            }),
          });
          
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
          }
          
          data = await response.json();
          console.log('Sepolia RPC response:', data);
          
          if (data.error) {
            throw new Error(data.error.message || 'RPC error');
          }
          
          // Success! Break out of loop
          console.log('Successfully fetched from:', url);
          break;
        } catch (err) {
          console.warn('Failed to fetch from', url, ':', err);
          lastError = err;
          // Continue to next endpoint
        }
      }
      
      if (!data || data.error) {
        console.error('All RPC endpoints failed. Last error:', lastError);
        return '0';
      }
      
      const balance = data.result;
      console.log('Raw balance from Sepolia:', balance, typeof balance);
      
      // Convert from wei to ETH (balance is in hex string like "0x1234...")
      if (typeof balance === 'string') {
        // Convert hex string to BigInt (BigInt accepts hex strings directly)
        const balanceInWei = BigInt(balance);
        console.log('Balance in wei:', balanceInWei.toString());
        
        if (balanceInWei === BigInt(0)) {
          console.log('Balance is zero on Sepolia');
          return '0.00000000';
        }
        
        // Use BigInt division to preserve precision for small amounts
        // Convert wei to ETH by dividing by 10^18
        const ethDivisor = BigInt(1e18);
        const ethWhole = balanceInWei / ethDivisor;
        const ethRemainder = balanceInWei % ethDivisor;
        
        console.log('ETH whole:', ethWhole.toString(), 'ETH remainder:', ethRemainder.toString());
        
        // Convert remainder to decimal string with exactly 18 digits
        const remainderStr = ethRemainder.toString().padStart(18, '0');
        console.log('Remainder string (18 digits):', remainderStr);
        
        // For very small balances, we need to preserve leading zeros
        if (ethWhole === BigInt(0)) {
          // For very small balances, show at least 8 decimal places
          // Always show the first 8 digits to preserve leading zeros
          const displayDecimals = remainderStr.slice(0, 8);
          
          console.log('Display decimals (first 8):', displayDecimals);
          return `0.${displayDecimals}`;
        } else {
          // For balances >= 1 ETH, show up to 8 decimal places
          const decimals = remainderStr.replace(/0+$/, '');
          const displayDecimals = decimals.length > 8 ? decimals.slice(0, 8) : decimals.padEnd(8, '0');
          return `${ethWhole.toString()}.${displayDecimals}`;
        }
      }
      console.error('Balance is not a string:', balance);
      return '0';
    } catch (err) {
      console.error('Failed to get balance from Sepolia:', err);
      return '0';
    }
  }, []);

  return {
    wallet,
    loading,
    error,
    isInitialized: !!porto,
    connect,
    disconnect,
    getAccounts,
    getBalance,
  };
}

