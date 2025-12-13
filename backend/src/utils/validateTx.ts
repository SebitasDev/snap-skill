import { createPublicClient, http } from "viem";
import { polygon } from "viem/chains";

const client = createPublicClient({
  chain: polygon,
  transport: http(),
});

interface ValidateTxParams {
  txHash: `0x${string}`;
  expectedSender: string;
  expectedReceiver: string;
  expectedAmount: number;
}

export default async function validateTx({
  txHash,
  expectedSender,
  expectedReceiver,
  expectedAmount,
}: ValidateTxParams) {
  try {
    const tx = await client.getTransaction({ hash: txHash });

    if (!tx) return { valid: false, reason: "Transaction not found" };

    if (tx.from.toLowerCase() !== expectedSender.toLowerCase())
      return { valid: false, reason: "Sender mismatch" };

    if (!tx.to) {
      return { valid: false, reason: "Receiver mismatch (Contract creation)" };
    }

    if (tx.to.toLowerCase() !== expectedReceiver.toLowerCase()) {
      return { valid: false, reason: "Receiver mismatch" };
    }

    const amountSent = Number(tx.value) / 1e18;
    if (amountSent < expectedAmount)
      return { valid: false, reason: "Amount mismatch" };

    return { valid: true };
  } catch (err) {
    let errorMessage: string;

    if (err instanceof Error) {
      errorMessage = err.message;
    } else if (
      typeof err === "object" &&
      err !== null &&
      "message" in err &&
      typeof err.message === "string"
    ) {
      errorMessage = err.message;
    } else {
      errorMessage = "An unknown error occurred.";
    }

    return { valid: false, reason: errorMessage };
  }
}
