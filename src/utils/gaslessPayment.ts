import { WalletClient, toHex } from "viem";
import { base } from "viem/chains";

const API_BASE_URL = "https://wallet-multichain.vercel.app";
const USDC_BASE = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";

interface FacilitatorAddresses {
    stellarAddress: string;
    evmAddress: string;
}

export const fetchFacilitatorAddress = async (): Promise<FacilitatorAddresses> => {
    const response = await fetch(`${API_BASE_URL}/api/bridge/stellar`);
    if (!response.ok) {
        throw new Error("Failed to fetch facilitator address");
    }
    return response.json();
};

export const generateBaseSignature = async (
    walletClient: WalletClient,
    account: string,
    facilitatorAddress: string,
    amount: number
) => {
    if (!walletClient) throw new Error("Wallet client not found");

    // Logic: User signs Amount (Service Price + Fee)

    // We will assume the passed 'amount' includes the fee or we add it here?
    // Let's pass the TOTAL amount to be signed here.

    const value = BigInt(Math.floor(amount * 1_000_000)); // 6 decimals for USDC
    const validAfter = BigInt(0);
    const validBefore = BigInt(Math.floor(Date.now() / 1000) + 3600); // 1 hour
    const nonce = crypto.getRandomValues(new Uint8Array(32));
    const nonceHex = toHex(nonce);

    // domain definition
    const domain = {
        name: "USD Coin",
        version: "2",
        chainId: base.id,
        verifyingContract: USDC_BASE as `0x${string}`,
    };

    const types = {
        TransferWithAuthorization: [
            { name: "from", type: "address" },
            { name: "to", type: "address" },
            { name: "value", type: "uint256" },
            { name: "validAfter", type: "uint256" },
            { name: "validBefore", type: "uint256" },
            { name: "nonce", type: "bytes32" },
        ],
    };

    const message = {
        from: account as `0x${string}`,
        to: facilitatorAddress as `0x${string}`,
        value,
        validAfter,
        validBefore,
        nonce: nonceHex,
    };

    const signature = await walletClient.signTypedData({
        account: account as `0x${string}`,
        domain,
        types,
        primaryType: "TransferWithAuthorization",
        message,
    });

    return {
        signature,
        payload: {
            from: account,
            to: facilitatorAddress,
            value: value.toString(),
            validAfter: validAfter.toString(), // User example uses string
            validBefore: validBefore.toString(), // User example uses string
            nonce: nonceHex,
        }
    };
};

export const executeGaslessPayment = async (
    walletClient: WalletClient,
    account: string,
    amountToPay: number, // Service Price Only
    recipient: string // Actual Service Provider
) => {
    // 1. Get Facilitator
    const { evmAddress: facilitatorAddress } = await fetchFacilitatorAddress();

    // 2. Calculate Total (Price + fee)
    // Fee is 0.02
    const fee = 0.02;
    const totalAmount = amountToPay + fee;

    // 3. Generate Signature
    const { signature, payload: authPayload } = await generateBaseSignature(
        walletClient,
        account,
        facilitatorAddress,
        totalAmount
    );

    // 4. Send to API
    // Ensure payload structure matches user requirement
    const body = {
        chain: "base",
        amount: totalAmount,
        recipient, // The service provider receives the money
        payload: {
            authorization: authPayload, // authPayload already has the correct structure from generateBaseSignature? No, need to check
            signature
        }
    };

    // Let's verify generateBaseSignature return. 
    // It returns payload with from, to, value, etc. 
    // The user example shows:
    // payload: {
    //    authorization: { ... },
    //    signature: ...
    // }

    console.log("Sending Gasless Payment:", body);

    const response = await fetch(`${API_BASE_URL}/api/pay/gasless`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Payment failed");
    }

    return response.json();
};
