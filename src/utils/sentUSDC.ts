import { parseUnits, PublicClient, WalletClient } from "viem";
import { baseSepolia } from "viem/chains";

const erc20Abi = [
  {
    name: "transfer",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ type: "bool" }],
  },
];

const USDC_BASE_SEPOLIA = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";

export async function sendUsdcPayment(
  user: unknown,
  walletClient: WalletClient,
  publicClient: PublicClient,
  to: `0x${string}`,
  amount: string
) {
  if (!walletClient) throw new Error("Wallet no conectada");
  if (!user) throw new Error("Usuario sin address");
  if (!walletClient.account)
    throw new Error("walletClient no tiene signer (account null)");

  const value = parseUnits(amount, 6);

  const account = walletClient.account;

  const gas = await publicClient.estimateContractGas({
    account,
    chain: baseSepolia,
    address: USDC_BASE_SEPOLIA,
    abi: erc20Abi,
    functionName: "transfer",
    args: [to, value],
  });

  //console.log("🔋 Gas estimado:", gas.toString());

  // 2️⃣ Enviar transacción
  const txHash = await walletClient.writeContract({
    account,
    chain: baseSepolia,
    address: USDC_BASE_SEPOLIA,
    abi: erc20Abi,
    functionName: "transfer",
    args: [to, value],
    gas,
  });

  return txHash;
}

export async function createFacilitatorSignature(
  walletClient: WalletClient,
  to: `0x${string}`,
  amount: string
) {
  if (!walletClient) throw new Error("Wallet no conectada");
  if (!walletClient.account)
    throw new Error("walletClient no tiene signer (account null)");

  const account = walletClient.account;

  const message = {
    to,
    amount: parseUnits(amount, 6).toString(),
    from: account,
    timestamp: Date.now(),
  };

  const signature = await walletClient.signMessage({
    message: JSON.stringify(message),
    account: account,
  });

  return { message, signature };
}
