import { privateKeyToAccount } from "viem/accounts";
import { createWalletClient, createPublicClient, http, Address } from "viem";
import { base } from "viem/chains";
import { parseEther } from "viem";

export async function sendSupplierPayment(to: `0x${string}`) {
  const privateKey = process.env.VITE_PAYMASTER_PRIVATE_KEY;
  if (!privateKey) {
    console.error("Variable de entorno no encontrada:", process.env);
    throw new Error(
      "No se encontró la clave privada en las variables de entorno"
    );
  }

  const account = privateKeyToAccount(privateKey as `0x${string}`);

  const RPC = "https://mainnet.base.org";

  const walletClient = createWalletClient({
    account,
    chain: base,
    transport: http(RPC),
  });

  const publicClient = createPublicClient({
    chain: base,
    transport: http(RPC),
  });

  const value = parseEther("0.0000001");

  const txHash = await walletClient.sendTransaction({
    account,
    chain: base,
    to,
    value,
    kzg: undefined,
  });

  console.log("TX enviada:", txHash);

  const receipt = await publicClient.waitForTransactionReceipt({
    hash: txHash,
  });

  console.log("Receipt:", receipt);
  return receipt;
}
