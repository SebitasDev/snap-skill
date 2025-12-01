import { WalletConnection } from "@/lib/reown/WalletConnection";

const { wagmiAdapter } = WalletConnection();

export const wagmiConfig = wagmiAdapter.wagmiConfig;
