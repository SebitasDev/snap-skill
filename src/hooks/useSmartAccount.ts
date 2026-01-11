import { useState, useEffect, useCallback } from 'react';
import { AccountAbstraction, BASE_MAINNET } from '@1llet.xyz/erc4337-gasless-sdk';
import { decodeEntryPointError } from '@/utils/errorDecoder';
import { useWalletClient } from 'wagmi';
import { erc20Abi, encodeFunctionData } from 'viem';
import { base } from 'viem/chains';

// Base USDC Address
const USDC_ADDRESS = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';

export const useSmartAccount = () => {
    const [aa, setAa] = useState<AccountAbstraction | null>(null);
    const [smartAccountAddress, setSmartAccountAddress] = useState<string | null>(null);
    const [ownerAddress, setOwnerAddress] = useState<string | null>(null);
    const [isDeployed, setIsDeployed] = useState(false);
    const [loading, setLoading] = useState(false);

    const [usdcAllowance, setUsdcAllowance] = useState<bigint>(BigInt(0));
    const [eoaBalance, setEoaBalance] = useState<bigint>(BigInt(0));

    const { data: walletClient } = useWalletClient();

    const checkApproval = useCallback(async (sdk: AccountAbstraction) => {
        try {
            // Check allowance for USDC
            const allowance = await sdk.getAllowance("USDC");
            console.log("USDC Allowance:", allowance);
            setUsdcAllowance(allowance);
        } catch (error) {
            console.error("Failed to check allowance:", error);
        }
    }, []);

    const checkBalance = useCallback(async (sdk: AccountAbstraction) => {
        try {
            // Check EOA Balance for USDC using SDK
            // The SDK has getAccountState which returns everything, or specific methods.
            // Based on previous file read, we saw: getEoaBalance(token)
            const balance = await sdk.getEoaBalance("USDC");
            console.log("EOA USDC Balance:", balance);
            setEoaBalance(balance);
        } catch (error) {
            console.error("Failed to check EOA balance:", error);
        }
    }, []);

    const initialize = useCallback(async () => {
        if (!walletClient) return;

        try {
            console.log("Initializing SDK with config:", BASE_MAINNET);
            const sdk = new AccountAbstraction(BASE_MAINNET as any);

            // Connect using Wagmi walletClient (supports all connectors: MetaMask, Coinbase, WC, etc.)
            const { owner, smartAccount } = await sdk.connect(walletClient as any);

            setAa(sdk);
            setOwnerAddress(owner);
            setSmartAccountAddress(smartAccount);

            const deployed = await sdk.isAccountDeployed();
            setIsDeployed(deployed);

            // Check allowance and balance
            await checkApproval(sdk);
            await checkBalance(sdk);

        } catch (error) {
            console.error("Failed to initialize Smart Account:", error);
        }
    }, [walletClient, checkApproval, checkBalance]);

    useEffect(() => {
        initialize();
    }, [initialize]);

    const deploy = async () => {
        if (!aa) return;
        try {
            setLoading(true);
            await aa.deployAccount();
            setIsDeployed(true);
        } catch (error) {
            console.error("Deploy failed:", error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const approveUsdc = async (amount: string = "100000000000") => { // Default large approval (100k USDC)
        if (!smartAccountAddress || !walletClient || !ownerAddress || !aa) {
            throw new Error("Smart Account not initialized");
        }

        try {
            setLoading(true);

            // Request native token for gas (sponsorship/funding)
            try {
                console.log("Requesting approval support (gas)...");
                await aa.requestApprovalSupport(USDC_ADDRESS, smartAccountAddress as `0x${string}`, BigInt(amount));
                console.log("Approval support requested successfully.");
            } catch (supportError) {
                console.warn("Failed to request approval support (proceeding anyway):", supportError);
            }

            // EOA approves SA to spend USDC
            const hash = await walletClient.writeContract({
                address: USDC_ADDRESS,
                abi: erc20Abi,
                functionName: 'approve',
                args: [smartAccountAddress as `0x${string}`, BigInt(amount)],
                chain: base,
                account: ownerAddress as `0x${string}`
            });
            return hash;
        } catch (error) {
            console.error("Approve failed:", error);
            throw error;
        } finally {
            setLoading(false);
            // We should ideally wait for receipt here or let component handle it, 
            // but refreshing allowance immediately might still show old value.
            // Let's assume the user will wait or we can add a primitive wait or re-check button.
            // For now, let's try to update allowance after a short delay or rely on UI to trigger update.
            setTimeout(() => checkApproval(aa), 5000);
        }
    };

    const transfer = async (recipient: string, amount: string) => {
        if (!aa) throw new Error("Smart Account not initialized");
        try {
            setLoading(true);

            // Gasless Payment Flow:
            // 1. Funds are in EOA (Owner).
            // 2. EOA has approved Smart Account to spend USDC (via approveUsdc).
            // 3. Smart Account executes `USDC.transferFrom(owner, recipient, amount)`.
            // This allows the SA to relay the tx (paying gas/sponsor) while moving funds from EOA.

            const amountBigInt = BigInt(amount);

            // Encode transferFrom call
            const data = encodeFunctionData({
                abi: erc20Abi,
                functionName: 'transferFrom',
                args: [ownerAddress as `0x${string}`, recipient as `0x${string}`, amountBigInt]
            });

            console.log("Executing Gasless Payment (transferFrom)...");
            console.log("From (Owner):", ownerAddress);
            console.log("To (Recipient):", recipient);
            console.log("Amount:", amount);

            const receipt = await aa.sendTransaction({
                target: USDC_ADDRESS,
                data: data,
                value: 0n
            });

            return receipt;
        } catch (error) {
            console.error("Transfer failed:", error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const batchTransfer = async (transactions: { recipient: string; amount: string }[]) => {
        if (!aa) throw new Error("Smart Account not initialized");
        try {
            setLoading(true);
            console.log("Executing Gasless Batch Payment...");

            const txs = transactions.map(tx => {
                const amountBigInt = BigInt(tx.amount);
                const data = encodeFunctionData({
                    abi: erc20Abi,
                    functionName: 'transferFrom',
                    args: [ownerAddress as `0x${string}`, tx.recipient as `0x${string}`, amountBigInt]
                });
                return {
                    target: USDC_ADDRESS as `0x${string}`,
                    data: data,
                    value: 0n
                };
            });

            const receipt = await aa.sendBatchTransaction(txs);

            return receipt;
        } catch (error: any) {
            console.error("Batch Transfer failed:", error);
            const decoded = decodeEntryPointError(error);
            if (decoded) {
                console.error("DECODED ERROR:", decoded);
                throw new Error(decoded);
            }
            throw error;
        } finally {
            setLoading(false);
        }
    };

    return {
        smartAccountAddress,
        ownerAddress,
        isDeployed,
        deploy,
        approveUsdc,
        transfer,
        batchTransfer,
        loading,
        aa,
        usdcAllowance,
        eoaBalance,
        checkApproval,
        checkBalance
    };
};


