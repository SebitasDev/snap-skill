import { WalletClient, parseUnits } from "viem";
import { base, arbitrum } from "viem/chains";

// USDC Contract Addresses
const USDC_ADDRESSES: Record<number, `0x${string}`> = {
  [base.id]: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
  [arbitrum.id]: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
};

// Minimal ERC20 ABI for transfer
const ERC20_ABI = [
  {
    name: "transfer",
    type: "function",
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ type: "bool" }],
  },
] as const;

export interface PaymentResult {
  success: boolean;
  txHash?: string;
  error?: string;
}

/**
 * Simple USDC Transfer - MetaMask handles gas (can pay with USDC via MetaMask settings)
 */
export async function executeDirectUSDCPayment(
  walletClient: WalletClient,
  from: `0x${string}`,
  to: `0x${string}`,
  amountUSD: number,
  chainId: number = base.id
): Promise<PaymentResult> {
  try {
    const usdcAddress = USDC_ADDRESSES[chainId];
    if (!usdcAddress) {
      throw new Error(`USDC not supported on chain ${chainId}`);
    }

    // Convert to USDC decimals (6)
    const amount = parseUnits(amountUSD.toFixed(6), 6);

    // Execute transfer - MetaMask will show balance and handle gas
    const hash = await walletClient.writeContract({
      address: usdcAddress,
      abi: ERC20_ABI,
      functionName: "transfer",
      args: [to, amount],
      account: from,
      chain: chainId === base.id ? base : arbitrum,
    });

    return { success: true, txHash: hash };
  } catch (error: any) {
    console.error("USDC payment error:", error);

    // User rejected
    if (error.message?.includes("User rejected") || error.message?.includes("denied")) {
      return { success: false, error: "Transaction cancelled" };
    }

    return {
      success: false,
      error: error.shortMessage || error.message || "Payment failed",
    };
  }
}
