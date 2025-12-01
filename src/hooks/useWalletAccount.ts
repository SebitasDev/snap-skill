import { useAccount, useWalletClient } from "wagmi";
import { createPublicClient, http } from "viem";
import {baseSepolia, celo, scrollSepolia} from "@reown/appkit/networks";

export const useWalletAccount = () => {
    const { isConnected, address } = useAccount();
    const { data: walletClient } = useWalletClient();

    const publicClient = createPublicClient({
        chain: baseSepolia,
        transport: http(),
    });

    console.log("USER:", address);
    console.log("WALLET CLIENT:", walletClient);


    return {
        isConnected,
        walletClient,
        publicClient,
        user: address,
    };
};
