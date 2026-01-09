import { useSmartAccount } from "../hooks/useSmartAccount";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Loader2, ShieldCheck, Wallet, CheckCircle2 } from "lucide-react";
import { SmartAccountHelp } from "@/components/SmartAccountHelp";
import { useState } from "react";
import { useToast } from "../hooks/use-toast";

export const SmartAccountCard = () => {
    const { smartAccountAddress, isDeployed, deploy, approveUsdc, loading, ownerAddress, usdcAllowance, eoaBalance } = useSmartAccount();
    const { toast } = useToast();
    const [actionLoading, setActionLoading] = useState(false);

    const isApproved = usdcAllowance > BigInt(0);

    const handleDeploy = async () => {
        try {
            setActionLoading(true);
            await deploy();
            toast({
                title: "Success",
                description: "Smart Account activated successfully!",
            });
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to deploy Smart Account. " + (error as Error).message,
            });
        } finally {
            setActionLoading(false);
        }
    };

    const handleApprove = async () => {
        try {
            setActionLoading(true);
            const hash = await approveUsdc();
            toast({
                title: "Transaction Sent",
                description: "USDC Approval transaction sent. Hash: " + hash,
            });
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to approve USDC. " + (error as Error).message,
            });
        } finally {
            setActionLoading(false);
        }
    };

    const isLoading = loading || actionLoading;

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <CardTitle className="flex items-center gap-2">
                        <Wallet className="w-5 h-5" />
                        Your Wallet
                    </CardTitle>
                    <SmartAccountHelp />
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex flex-col gap-1">
                    <span className="text-sm font-medium">Status</span>
                    <div className="flex items-center gap-2">
                        {isDeployed ? (
                            <span className="text-green-600 flex items-center gap-1 text-sm bg-green-50 px-2 py-1 rounded-full border border-green-200">
                                <ShieldCheck className="h-4 w-4" /> Active on Base
                            </span>
                        ) : (
                            <span className="text-yellow-600 text-sm bg-yellow-50 px-2 py-1 rounded-full border border-yellow-200">
                                Not Activated
                            </span>
                        )}
                    </div>
                </div>

                {/* EOA Address Display */}
                {ownerAddress && (
                    <div className="flex flex-col gap-1">
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">EOA (MetaMask) Address</span>
                            {/* Display EOA Balance */}
                            {/* Need to format it properly. Assuming 6 decimals for USDC based on previous context */}
                            <span className="text-xs text-muted-foreground font-mono">
                                {eoaBalance !== undefined ? (Number(eoaBalance) / 1000000).toFixed(2) : "0.00"} USDC
                            </span>
                        </div>
                        <code className="bg-muted p-2 rounded text-xs break-all font-mono">
                            {ownerAddress}
                        </code>
                    </div>
                )}

                {smartAccountAddress && (
                    <div className="flex flex-col gap-1">
                        <span className="text-sm font-medium">Wallet Address</span>
                        <code className="bg-muted p-2 rounded text-xs break-all font-mono">
                            {smartAccountAddress}
                        </code>
                    </div>
                )}

                <div className="flex flex-col sm:flex-row gap-2 pt-2">
                    {!isDeployed && (
                        <Button onClick={handleDeploy} disabled={isLoading} className="w-full sm:w-auto">
                            {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                            Activate Smart Account
                        </Button>
                    )}

                    {isApproved ? (
                        <Button variant="outline" className="w-full sm:w-auto border-green-200 bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800 cursor-default">
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            USDC Approved
                        </Button>
                    ) : (
                        <Button onClick={handleApprove} disabled={isLoading || !smartAccountAddress || !isDeployed} variant="outline" className="w-full sm:w-auto">
                            {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
                            Approve USDC
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};
