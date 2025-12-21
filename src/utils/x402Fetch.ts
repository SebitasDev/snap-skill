import { createWalletClient, custom } from "viem";
import { base } from "viem/chains";
import type { EIP1193Provider } from "viem";

type X402FetchOptions = {
  walletClient: unknown;
  publicClient: unknown;
};

export async function x402Fetch(url: string, options: X402FetchOptions) {
  // 1. Fetch inicial
  let res = await fetch(url, {
    credentials: "include",
  });

  if (res.status !== 402) return res;

  // 2. Leer challenge
  const challenge = res.headers.get("x402-challenge");
  const recipient = res.headers.get("x402-recipient");

  if (!challenge || !recipient) {
    throw new Error("Respuesta x402 inválida");
  }

  // 3. Conectar wallet
  if (!window.ethereum) {
    throw new Error("No hay wallet");
  }

  const provider = window.ethereum as EIP1193Provider;

  const walletClient = createWalletClient({
    chain: base,
    transport: custom(provider),
  });

  const [address] = await walletClient.getAddresses();

  // 4. Firmar
  const signature = await walletClient.signMessage({
    account: address,
    message: challenge,
  });

  // 5. Reintentar con headers x402
  res = await fetch(url, {
    credentials: "include",
    headers: {
      "x402-address": address,
      "x402-signature": signature,
    },
  });

  return res;
}
