import { useState, useEffect } from "react";
import { Wallet, Copy, Check, LogOut, Shield, Mail, Phone, User, Star, MessageSquare, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { usePortoWallet } from "@/hooks/usePortoWallet";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import { myPayments, myFavourites } from "@/data/mockData";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

const Profile = () => {
  const [showWallet, setShowWallet] = useState(false);
  const [copied, setCopied] = useState(false);
  const [ethBalance, setEthBalance] = useState<string>("0");
  const [balanceLoading, setBalanceLoading] = useState(false);
  const { wallet, loading, error, isInitialized, connect, disconnect, getBalance } = usePortoWallet();

  // Fetch ETH balance when wallet is connected
  useEffect(() => {
    const fetchBalance = async () => {
      if (wallet?.address) {
        setBalanceLoading(true);
        try {
          // Extract address string properly
          let addressStr = wallet.address;
          if (typeof addressStr !== 'string') {
            addressStr = (addressStr as any)?.address || String(addressStr);
          }
          
          console.log('Profile: Wallet object:', wallet);
          console.log('Profile: Address type:', typeof wallet.address);
          console.log('Profile: Fetching balance for wallet:', addressStr);
          
          const balance = await getBalance(addressStr);
          console.log('Profile: Received balance:', balance);
          setEthBalance(balance);
        } catch (err) {
          console.error('Profile: Failed to fetch balance:', err);
          setEthBalance("0");
        } finally {
          setBalanceLoading(false);
        }
      } else {
        console.log('Profile: No wallet address, setting balance to 0');
        setEthBalance("0");
      }
    };

    fetchBalance();
    // Refresh balance every 30 seconds
    const interval = setInterval(fetchBalance, 30000);
    return () => clearInterval(interval);
  }, [wallet?.address, getBalance]);

  const handleConnect = async () => {
    try {
      const address = await connect();
      // If connect returns an address, we successfully connected
      if (address) {
        toast.success("Wallet connected successfully!");
      }
    } catch (err) {
      // Only show error toast for actual errors, not user rejections
      // User rejections are handled gracefully in the hook and don't throw
      const errorMessage = err instanceof Error ? err.message : String(err);
      if (!errorMessage.toLowerCase().includes('reject') && !errorMessage.toLowerCase().includes('cancelled')) {
        toast.error("Failed to connect wallet");
      }
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnect();
      toast.success("Wallet disconnected");
    } catch (err) {
      toast.error("Failed to disconnect wallet");
    }
  };

  const copyAddress = () => {
    if (wallet?.address) {
      navigator.clipboard.writeText(String(wallet.address));
      setCopied(true);
      toast.success("Address copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatAddress = (address: string | undefined | null) => {
    if (!address || typeof address !== 'string') {
      return 'Invalid address';
    }
    if (address.length < 10) {
      return address; // Too short to format
    }
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-foreground mb-6">Profile</h1>
          
          {/* Wallet Connection Card */}
          <div className="bg-card rounded-3xl shadow-soft border border-border/50 p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold text-foreground mb-1">Wallet</h2>
                <p className="text-sm text-muted-foreground">
                  {wallet ? "Connected" : "Not connected"}
                </p>
              </div>
              <Button
                variant={wallet ? "outline" : "default"}
                onClick={() => setShowWallet(true)}
              >
                <Wallet className="w-4 h-4 mr-2" />
                {wallet ? "Manage" : "Connect"}
              </Button>
            </div>
            {wallet && (
              <div className="mt-4 pt-4 border-t border-border space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Wallet Address</p>
                  <div className="flex items-center gap-2">
                    <p className="font-mono text-sm flex-1">{formatAddress(String(wallet.address))}</p>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={copyAddress}
                      title="Copy address"
                    >
                      {copied ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Sepolia ETH Balance</p>
                  <p className="font-mono text-sm font-semibold">
                    {balanceLoading ? (
                      <span className="text-muted-foreground">Loading...</span>
                    ) : (
                      `${ethBalance} ETH`
                    )}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* My Reviews Section */}
          <div className="bg-card rounded-3xl shadow-soft border border-border/50 p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold text-foreground mb-1">My Reviews</h2>
                <p className="text-sm text-muted-foreground">
                  Payments made to freelancers
                </p>
              </div>
            </div>
            
            <div className="space-y-4">
              {myPayments.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No payments yet. Start by purchasing a service!
                </p>
              ) : (
                myPayments.map((payment) => (
                  <div
                    key={payment.id}
                    className="rounded-xl border border-border/50 p-4 hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground mb-1 line-clamp-2">
                          {payment.serviceTitle}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          {payment.freelancerName}
                        </p>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-muted-foreground">
                            Paid: <span className="font-semibold text-foreground">${payment.amountPaid}</span>
                          </span>
                          <span className="text-muted-foreground">
                            {payment.paymentDate}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        {payment.hasReview ? (
                          <div className="flex items-center gap-1 bg-green-500/10 text-green-600 dark:text-green-400 px-3 py-1.5 rounded-full">
                            <Check className="w-4 h-4" />
                            <span className="text-xs font-semibold">Review complete</span>
                          </div>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            asChild
                            className="text-xs"
                          >
                            <Link to={`/service/${payment.id}/review`}>
                              <MessageSquare className="w-3 h-3 mr-1" />
                              Add Review
                            </Link>
                          </Button>
                        )}
                        {payment.hasReview && payment.reviewRating && (
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3 h-3 ${
                                  i < payment.reviewRating!
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-muted-foreground"
                                }`}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* My Favourites Section */}
          <div className="bg-card rounded-3xl shadow-soft border border-border/50 p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold text-foreground mb-1">My Favourites</h2>
                <p className="text-sm text-muted-foreground">
                  Freelancers you've hearted
                </p>
              </div>
            </div>
            
            <div className="space-y-4">
              {myFavourites.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No favourites yet. Start by hearting freelancers you like!
                </p>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {myFavourites.map((favourite) => (
                    <Link
                      key={favourite.id}
                      to={`/service/${favourite.id}`}
                      className="group"
                    >
                      <div className="overflow-hidden rounded-xl border border-border/50 bg-card transition-all hover:shadow-lg hover:border-primary/50">
                        <div className="relative aspect-video overflow-hidden">
                          <img
                            src={favourite.image}
                            alt={favourite.title}
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                          <div className="absolute right-2 top-2">
                            <div className="h-8 w-8 rounded-full bg-background/90 backdrop-blur-sm flex items-center justify-center">
                              <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                            </div>
                          </div>
                        </div>
                        
                        <div className="p-4">
                          <div className="mb-2 flex items-center space-x-2">
                            <div className="h-8 w-8 rounded-full bg-muted" />
                            <div className="flex-1 text-sm min-w-0">
                              <p className="font-medium truncate">{favourite.seller}</p>
                              <p className="text-muted-foreground text-xs truncate">{favourite.sellerLevel}</p>
                            </div>
                          </div>
                          
                          <h3 className="mb-2 line-clamp-2 font-medium text-sm text-card-foreground group-hover:text-primary transition-colors">
                            {favourite.title}
                          </h3>
                          
                          <div className="mb-3">
                            <Badge variant="secondary" className="text-xs">
                              {favourite.category}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-1 text-xs">
                              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                              <span className="font-semibold">{favourite.rating}</span>
                              <span className="text-muted-foreground">({favourite.reviews})</span>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-muted-foreground">Starting at</p>
                              <p className="text-sm font-bold text-card-foreground">${favourite.price}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Wallet Modal */}
      <Sheet open={showWallet} onOpenChange={setShowWallet}>
        <SheetContent side="bottom" className="rounded-t-3xl h-[90vh]">
          <SheetHeader className="mb-4 mt-2">
            <SheetTitle className="text-3xl font-bold text-center leading-tight">
              {wallet ? "Your Wallet" : "Set Up Your Wallet"}
            </SheetTitle>
          </SheetHeader>
          
          <div className="flex flex-col space-y-6 mt-6 px-4 pb-24">
            {/* Wallet Connection Section */}
            {wallet ? (
              <div className="space-y-6">
                {/* Connected Wallet Info */}
                <div className="bg-card rounded-3xl shadow-soft border border-border/50 p-6 space-y-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-soft">
                      <Wallet className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground mb-1">Wallet Address</p>
                      <div className="flex items-center gap-2">
                        <p className="font-mono text-sm font-semibold">
                          {wallet.address ? formatAddress(String(wallet.address)) : 'No address'}
                        </p>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={copyAddress}
                          title="Copy address"
                        >
                          {copied ? (
                            <Check className="w-4 h-4 text-green-500" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* ETH Balance */}
                  <div className="bg-muted/50 rounded-xl p-4">
                    <p className="text-xs text-muted-foreground mb-1">Sepolia ETH Balance</p>
                    <p className="font-mono text-lg font-semibold">
                      {balanceLoading ? (
                        <span className="text-muted-foreground">Loading...</span>
                      ) : (
                        `${ethBalance} ETH`
                      )}
                    </p>
                  </div>

                  {/* Full Address Display */}
                  <div className="bg-muted/50 rounded-xl p-3">
                    <p className="text-xs text-muted-foreground mb-1">Full Address</p>
                    <p className="font-mono text-xs break-all">{wallet.address ? String(wallet.address) : 'No address'}</p>
                  </div>
                </div>

                {/* Disconnect Button */}
                <Button
                  variant="destructive"
                  size="lg"
                  className="w-full rounded-full h-14 text-lg font-semibold shadow-soft"
                  onClick={handleDisconnect}
                  disabled={loading}
                >
                  <LogOut className="w-5 h-5 mr-2" />
                  {loading ? "Disconnecting..." : "Disconnect Wallet"}
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Security Icons */}
                <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 px-4">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-secondary/20 flex items-center justify-center">
                    <User className="w-8 h-8 sm:w-10 sm:h-10 text-primary" />
                  </div>
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-secondary/20 flex items-center justify-center">
                    <Mail className="w-8 h-8 sm:w-10 sm:h-10 text-primary" />
                  </div>
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-secondary/20 flex items-center justify-center">
                    <Phone className="w-8 h-8 sm:w-10 sm:h-10 text-primary" />
                  </div>
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-soft">
                    <Shield className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
                  </div>
                </div>

                {/* Description */}
                <div className="text-center space-y-2">
                  <p className="text-muted-foreground text-base px-6">
                    Create or connect your Porto wallet to start sending and receiving dollars securely.
                  </p>
                  <p className="text-sm text-muted-foreground px-6">
                    If you don't have a wallet yet, we'll create one for you. No gas fees, no ETH required. Powered by passkeys and WebAuthn.
                  </p>
                </div>

                {/* Error Message */}
                {error && (
                  <div className={`rounded-xl p-4 ${
                    error.toLowerCase().includes('cancelled') || error.toLowerCase().includes('try again')
                      ? 'bg-muted/50 border border-border'
                      : 'bg-destructive/10 border border-destructive/20'
                  }`}>
                    <p className={`text-sm ${
                      error.toLowerCase().includes('cancelled') || error.toLowerCase().includes('try again')
                        ? 'text-muted-foreground'
                        : 'text-destructive'
                    }`}>
                      {error}
                    </p>
                  </div>
                )}

                {/* Connect Button */}
                <div className="space-y-3">
                  <Button
                    size="lg"
                    className="w-full rounded-full h-14 text-lg font-semibold shadow-soft"
                    onClick={handleConnect}
                    disabled={loading || !isInitialized}
                  >
                    <Wallet className="w-5 h-5 mr-2" />
                    {loading ? "Setting up..." : !isInitialized ? "Initializing..." : "Create or Connect Wallet"}
                  </Button>

                  {!isInitialized && (
                    <p className="text-xs text-center text-muted-foreground">
                      Initializing wallet connection...
                    </p>
                  )}
                </div>

                {/* Info Link */}
                <a href="https://porto.sh" target="_blank" rel="noopener noreferrer" className="text-primary font-semibold text-sm text-center block">
                  Learn more about Porto wallets
                </a>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default Profile;
