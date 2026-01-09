import { useConnect, useAccount, useDisconnect } from "wagmi";
import { Button } from "./ui/button";
import { Loader2 } from "lucide-react";
import React, { useMemo } from "react";

export const ConnectWalletButton: React.FC = () => {
  const { connectors, connect, isPending } = useConnect();
  const { isConnected, address } = useAccount();
  const { disconnect } = useDisconnect();

  const metaMaskConnector = useMemo(() => {
    return connectors.find((c) => c.name === "MetaMask" || c.name === "Injected");
  }, [connectors]);

  const handleConnect = () => {
    if (metaMaskConnector) {
      connect({ connector: metaMaskConnector });
    }
  };

  if (isConnected && address) {
    return (
      <Button variant="outline" onClick={() => disconnect()} className="gap-2">
        <span className="w-2 h-2 bg-green-500 rounded-full" />
        {address.slice(0, 6)}...{address.slice(-4)}
      </Button>
    );
  }

  return (
    <Button
      onClick={handleConnect}
      disabled={isPending || !metaMaskConnector}
      className="bg-[#F6851B] hover:bg-[#E2761B] text-white"
    >
      {isPending ? (
        <Loader2 className="w-4 h-4 animate-spin mr-2" />
      ) : (
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg"
          alt="MetaMask"
          className="w-5 h-5 mr-2"
        />
      )}
      Connect with MetaMask
    </Button>
  );
};
