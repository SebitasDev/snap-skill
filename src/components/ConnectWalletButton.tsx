import { useAppKit, useAppKitAccount } from "@reown/appkit/react";
import { Button } from "./ui/button";
import { Wallet, LogOut, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const ConnectWalletButton = () => {
  const { open } = useAppKit();
  const { address, isConnected } = useAppKitAccount();

  if (isConnected && address) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="group relative overflow-hidden bg-background/50 hover:bg-background/80 border-primary/20 hover:border-primary/50 transition-all duration-300"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="flex items-center gap-2 relative z-10">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              <span className="font-mono text-sm">
                {address.slice(0, 6)}...{address.slice(-4)}
              </span>
              <ChevronDown className="h-3 w-3 opacity-50" />
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 backdrop-blur-xl bg-background/80 border-primary/20">
          <DropdownMenuItem onClick={() => open()} className="cursor-pointer gap-2">
            <Wallet className="h-4 w-4" />
            <span>Wallet Details</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => open({ view: 'Account' })} className="cursor-pointer gap-2 text-destructive focus:text-destructive">
            <LogOut className="h-4 w-4" />
            <span>Disconnect</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <Button
      onClick={() => open()}
      className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-primary/25 transition-all duration-300"
    >
      <Wallet className="mr-2 h-4 w-4" />
      Connect Wallet
    </Button>
  );
};
