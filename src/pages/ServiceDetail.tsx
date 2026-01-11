import { useParams, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Star,
  Heart,
  Share2,
  Clock,
  RefreshCw,
  CheckCircle2,
  ArrowLeft,
} from "lucide-react";
import { useWalletAccount } from "@/hooks/useWalletAccount.ts";
import { executeDirectUSDCPayment } from "@/utils/directPayment";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { ReviewModal } from "@/components/ReviewModal";
import { Loader2 } from "lucide-react";
import { useSmartAccount } from "@/hooks/useSmartAccount";
import { parseUnits } from "viem";

const ServiceDetail = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const [service, setService] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { user, walletClient, publicClient } = useWalletAccount();

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

  const [reviews, setReviews] = useState([]);
  const [hasReviewed, setHasReviewed] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);

  const { transfer, batchTransfer, isDeployed, usdcAllowance, eoaBalance } = useSmartAccount();

  const fetchReviews = async () => {
    if (!id) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/reviews/${id}`);
      const data = await res.json();
      if (data.reviews) {
        setReviews(data.reviews);
        // Check if current user has reviewed
        if (user) {
          const userReview = data.reviews.find((r: any) => r.reviewerWallet.toLowerCase() === user.toLowerCase());
          setHasReviewed(!!userReview);
        }
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
    }
  };

  useEffect(() => {
    // ... code truncated ...
  });

  // ... (render) ...



  useEffect(() => {
    const fetchService = async () => {
      try {
        const query = user ? `?buyer=${user}` : "";
        const res = await fetch(`${API_BASE_URL}/api/services/${id}${query}`);
        const data = await res.json();
        if (data.service) {
          // If contactInfo is present, merge it or handle it
          const serviceData = { ...data.service, contactInfo: data.contactInfo };
          setService(serviceData);
        }
      } catch (error) {
        console.error("Error fetching service details:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchService();
      fetchReviews();
    }
  }, [id, user, API_BASE_URL]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8 flex justify-center">
          <div>Loading...</div>
        </div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold">Service not found</h1>
          <Button asChild className="mt-4">
            <Link to="/browse">Back to Browse</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" asChild className="mb-4">
          <Link to="/browse">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Browse
          </Link>
        </Button>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="mb-6">
              <Badge variant="secondary" className="mb-3">
                {service.category}
              </Badge>
              <h1 className="mb-4 text-3xl font-bold">{service.title}</h1>

              <div className="flex items-center gap-6">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 overflow-hidden rounded-full bg-muted">
                    {service.profile?.imageUrl ? (
                      <img src={service.profile.imageUrl} alt={service.profile.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full bg-gray-300" />
                    )}
                  </div>
                  <div>
                    <p className="font-bold text-lg">
                      {service.profile?.name || `${service.walletAddress.slice(0, 6)}...${service.walletAddress.slice(-4)}`}
                    </p>
                    <p className="text-base text-muted-foreground">
                      Seller
                    </p>
                  </div>
                </div>
                <div className="h-12 w-px bg-border" />
                <div className="flex items-center gap-2">
                  <Star className="h-8 w-8 fill-yellow-400 text-yellow-400" />
                  <span className="text-3xl font-bold">{service.averageRating ? service.averageRating.toFixed(1) : "0.0"}</span>
                  <span className="text-xl text-muted-foreground">
                    ({service.totalReviews || 0} reviews)
                  </span>
                </div>
              </div>
            </div>

            <div className="mb-6 overflow-hidden rounded-lg">
              <img
                src={service.imageUrl}
                alt={service.title}
                className="aspect-video w-full object-cover"
              />
            </div>

            <div className="mb-8">
              <h2 className="mb-4 text-2xl font-bold">About This Service</h2>
              <div className="space-y-4 text-muted-foreground whitespace-pre-wrap">
                <p>{service.description}</p>
              </div>
            </div>

            <div className="mb-8">
              <h3 className="mb-4 text-xl font-bold">What's Included</h3>
              <div className="space-y-3">
                {service.includes && service.includes.map((item: string) => (
                  <div key={item} className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">Reviews</h3>
                {/* Show Add Review Button if Purchased AND Not Reviewed */}
                {service.contactInfo && !hasReviewed && user && (
                  <div className="w-48">
                    <ReviewModal
                      serviceId={service._id}
                      reviewerWallet={user}
                      onReviewSubmitted={() => {
                        setHasReviewed(true);
                        fetchReviews(); // Refresh list
                        // Optionally refresh service to get new avg rating
                        const fetchService = async () => {
                          try {
                            const query = user ? `?buyer=${user.toLowerCase()}` : "";
                            const res = await fetch(`${API_BASE_URL}/api/services/${id}${query}`);
                            const data = await res.json();
                            if (data.service) {
                              // Preserve contact info if we had it
                              const serviceData = { ...data.service, contactInfo: service.contactInfo };
                              setService(serviceData);
                            }
                          } catch (e) { console.error(e) }
                        };
                        fetchService();
                      }}
                    />
                  </div>
                )}
              </div>

              <div className="space-y-4">
                {reviews.length === 0 ? (
                  <p className="text-muted-foreground italic">No reviews yet.</p>
                ) : (
                  reviews.map((review: any) => (
                    <div key={review._id} className="rounded-lg border p-4">
                      <div className="mb-2 flex items-center gap-2">
                        <div className="h-8 w-8 overflow-hidden rounded-full bg-muted">
                          {review.reviewerProfile?.imageUrl ? (
                            <img
                              src={review.reviewerProfile.imageUrl}
                              alt={review.reviewerProfile.name || "Reviewer"}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-xs">
                              {review.reviewerWallet.substring(0, 2)}
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-sm">
                            {review.reviewerProfile?.name || `${review.reviewerWallet.slice(0, 6)}...${review.reviewerWallet.slice(-4)}`}
                          </p>
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, j) => (
                              <Star
                                key={j}
                                className={`h-3 w-3 ${j < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                              />
                            ))}
                          </div>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-muted-foreground text-sm">
                        {review.comment}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-20 rounded-lg border bg-card p-6">
              <div className="mb-6">
                <div className="mb-2 text-sm text-muted-foreground">
                  Starting at
                </div>
                <div className="text-3xl font-bold">${(Number(service.price) + 0.02).toFixed(2)}</div>
              </div>

              <div className="mb-6 space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>Delivery Time</span>
                  </div>
                  <span className="font-medium">{service.deliveryTime}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <RefreshCw className="h-4 w-4" />
                    <span>Revisions</span>
                  </div>
                  <span className="font-medium">{service.revisions}</span>
                </div>
              </div>

              {/* Payment Button */}

              <Button
                className="mb-3 w-full"
                size="lg"
                disabled={!!service.contactInfo || paymentLoading}
                onClick={async () => {
                  if (!user || !walletClient) {
                    toast({ title: "Please connect your wallet", variant: "destructive" });
                    return;
                  }

                  if (service.contactInfo) {
                    toast({ title: "Already Purchased", description: "You already have access to this service." });
                    return;
                  }

                  // === Validations ===

                  // 1. Check if Smart Account is Deployed
                  if (!isDeployed) {
                    toast({
                      title: "Smart Account Not Active",
                      description: "Please go to your Profile -> Wallet to activate your Smart Account first.",
                      variant: "destructive",
                      action: <Link to="/profile" className="font-semibold underline">Go to Profile</Link>
                    });
                    return;
                  }

                  // 2. Check Balance
                  const priceBigInt = parseUnits(service.price.toString(), 6);
                  if (eoaBalance !== undefined && eoaBalance < priceBigInt) {
                    toast({
                      title: "Insufficient Balance",
                      description: `You need at least $${service.price} USDC in your EOA (MetaMask).`,
                      variant: "destructive",
                    });
                    return;
                  }

                  // 3. Check Allowance
                  if (usdcAllowance !== undefined && usdcAllowance < priceBigInt) {
                    toast({
                      title: "Approval Required",
                      description: "You need to approve USDC spending. Go to Profile -> Wallet to approve.",
                      variant: "destructive",
                      action: <Link to="/profile" className="font-semibold underline">Go to Profile</Link>
                    });
                    return;
                  }

                  // === Proceed with Payment ===

                  setPaymentLoading(true);
                  try {
                    // Use Smart Account transfer
                    // Code updated to use SDK transfer method

                    const priceAmount = parseUnits(service.price.toString(), 6); // USDC has 6 decimals
                    const feeAmount = parseUnits("0.02", 6); // 0.02 USDC fee
                    const feeAddress = "0xe025be883d3f183fc4eab05AB57bA4d07AA53531";

                    console.log("Initiating batch transfer via Smart Account...");
                    console.log("Recipient (Seller):", service.walletAddress, "Amount:", priceAmount.toString());
                    console.log("Recipient (Fee):", feeAddress, "Amount:", feeAmount.toString());

                    // We generate a random API key just in case it's needed internally or we want to log it
                    // User requested: "creo que te pedira una apikey genera una random"
                    const apiKey = Math.random().toString(36).substring(7);
                    console.log("Generated random API Key:", apiKey);

                    const receipt = await batchTransfer([
                      { recipient: service.walletAddress, amount: priceAmount.toString() },
                      { recipient: feeAddress, amount: feeAmount.toString() }
                    ]);

                    console.log("Batch Transfer successful", receipt);

                    const txHash = (receipt as any)?.receipt?.transactionHash || (receipt as any)?.transactionHash || "0x0000000000000000000000000000000000000000";
                    const blockNumberHex = (receipt as any)?.receipt?.blockNumber || (receipt as any)?.blockNumber;
                    const blockNumber = blockNumberHex ? parseInt(blockNumberHex, 16) : 0;

                    toast({
                      title: "Payment Successful!",
                      description: `TX: ${txHash.slice(0, 10)}...`,
                    });

                    // Record purchase
                    console.log("Recording purchase in DB...");
                    const purchaseRes = await fetch(`${API_BASE_URL}/api/purchases`, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        serviceId: service._id,
                        buyerWallet: user.toLowerCase(),
                        sellerWallet: service.walletAddress.toLowerCase(),
                        txHash: txHash,
                        blockNumber: blockNumber,
                      }),
                    });

                    if (!purchaseRes.ok) {
                      const errorData = await purchaseRes.json().catch(() => ({}));
                      console.error("Failed to record purchase:", purchaseRes.status, errorData);
                      throw new Error(errorData.message || "Failed to record purchase in database");
                    }
                    console.log("Purchase recorded successfully");

                    // Small delay to allow DB propagation
                    await new Promise(resolve => setTimeout(resolve, 1000));

                    // Refresh service to show contact info
                    const query = user ? `?buyer=${user.toLowerCase()}` : "";
                    const res = await fetch(`${API_BASE_URL}/api/services/${id}${query}`);
                    const data = await res.json();
                    if (data.service) {
                      setService({ ...data.service, contactInfo: data.contactInfo });
                    }
                  } catch (e: any) {
                    console.error("Payment error:", e);
                    toast({
                      title: "Payment Failed",
                      description: e.message || "An error occurred",
                      variant: "destructive",
                    });
                  } finally {
                    setPaymentLoading(false);
                  }
                }}
              >
                {paymentLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : service.contactInfo ? (
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                ) : null}
                {service.contactInfo ? "Service Purchased" : `Pay $${Number(service.price).toFixed(2)} USDC`}
              </Button>

              <div className="flex gap-2">
                <Button variant="outline" size="icon" className="flex-1">
                  <Heart className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="flex-1"
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    toast({
                      title: "Link copied",
                      description: "Service link copied to clipboard",
                    });
                  }}
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>

              <Separator className="my-6" />

              <div>
                <h4 className="mb-3 font-semibold">Contact Seller</h4>
                {service.contactInfo ? (
                  <div className="space-y-3">
                    {service.contactInfo.whatsapp && (
                      <Button
                        variant="outline"
                        className="w-full justify-start gap-2 border-green-500/20 bg-green-500/10 text-green-600 hover:bg-green-500/20 hover:text-green-700 dark:text-green-400"
                        onClick={() => window.open(`https://wa.me/${service.contactInfo.whatsapp.replace(/\D/g, '')}`, '_blank')}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                          <path d="M13.601 2.326A7.854 7.854 0 0 0 8.575 0C4.346 0 .91 3.424.91 7.645c0 1.36.353 2.67 1.028 3.82L1 14.3l3.023-.792a7.844 7.844 0 0 0 3.552.854h.003c4.229 0 7.665-3.424 7.665-8.045 0-2.148-.839-4.168-2.642-5.991zM8.58 12.984h-.002a6.685 6.685 0 0 1-3.415-.93l-.245-.146-2.532.664.678-2.464-.15-.24a6.666 6.666 0 0 1-1.018-3.535c0-3.693 3.016-6.699 6.709-6.699 1.792 0 3.479.7 4.747 1.964 1.268 1.264 1.968 2.942 1.968 4.735 0 3.695-3.013 6.696-6.69 6.696zm3.67-4.992c-.2-.1-.186-.1-.58-.285-.393-.186-.928-.567-1.128-.767-.2-.2-.2-.3-.086-.486.114-.185.393-.685.58-.885.185-.2.285-.3.485-.2.2-.1.928-.567 1.413-.852.486-.285.857-.386 1.142-.286.285.1 1.285 1.085 1.285 2.185 0 1.1-1.085 2.185-1.57 2.185-.486 0-1.885-.567-2.742-.985z" />
                        </svg>
                        WhatsApp: {service.contactInfo.whatsapp}
                      </Button>
                    )}
                    {service.contactInfo.telegram && (
                      <Button
                        variant="outline"
                        className="w-full justify-start gap-2 border-blue-400/20 bg-blue-400/10 text-blue-500 hover:bg-blue-400/20 hover:text-blue-600 dark:text-blue-400"
                        onClick={() => window.open(`https://t.me/${service.contactInfo.telegram.replace('@', '')}`, '_blank')}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                          <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM8.287 5.906c-.778.324-2.334.994-4.666 2.01-.378.15-.577.298-.595.442-.03.243.275.339.69.47l.175.055c.408.133.958.288 1.243.294.26.006.549-.1.868-.32 2.179-1.471 3.304-2.214 3.374-2.23.05-.012.12-.026.166.016.047.041.042.12.037.141-.03.129-1.227 1.241-1.846 1.817-.193.18-.33.307-.358.336a8.154 8.154 0 0 1-.188.186c-.38.366-.664.64.015 1.088.327.216.589.393.825.561.288.206.605.43.91.622.56.354.914.58.941.61.32.332.231.758-.04.991-.04.03-.09.07-.15.115-.99.552-4.04 2.21-4.04 2.21-.302.16-.54.3-.715.365z" />
                        </svg>
                        Telegram: {service.contactInfo.telegram}
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="relative overflow-hidden rounded-md border p-4">
                    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-background/60 backdrop-blur-[2px]">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted shadow-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" className="text-muted-foreground">
                          <path d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2zm3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2zM5 8h6a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z" />
                        </svg>
                      </div>
                      <span className="mt-2 text-xs font-medium text-muted-foreground">Purchase to unlock</span>
                    </div>
                    <div className="space-y-3 opacity-40 blur-[1px]">
                      <Button variant="outline" className="w-full justify-start gap-2" disabled>
                        WhatsApp: +1 (555) 000-0000
                      </Button>
                      <Button variant="outline" className="w-full justify-start gap-2" disabled>
                        Telegram: @unknown_user
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div >
          </div >
        </div >
      </div >
    </div >
  );
};

export default ServiceDetail;
