import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  Star,
  Heart,
  Share2,
  Clock,
  RefreshCw,
  CheckCircle2,
  ArrowLeft,
  Wallet,
  AlertCircle,
} from "lucide-react";
import { services, reviews } from "@/data/mockData";
import { usePortoWallet } from "@/hooks/usePortoWallet";
import { toast } from "sonner";

const ServiceDetail = () => {
  const { id } = useParams();
  const service = services.find((s) => s.id === Number(id)) || services[0];
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const { wallet, isInitialized } = usePortoWallet();

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

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="h-10 w-10 rounded-full bg-muted" />
                  <div>
                    <p className="font-semibold">{service.seller}</p>
                    <p className="text-sm text-muted-foreground">
                      {service.sellerLevel}
                    </p>
                  </div>
                </div>
                <Separator orientation="vertical" className="h-10" />
                <div className="flex items-center gap-1">
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold">{service.rating}</span>
                  <span className="text-muted-foreground">
                    ({service.reviews} reviews)
                  </span>
                </div>
              </div>
            </div>

            <div className="mb-6 overflow-hidden rounded-lg">
              <img
                src={service.image}
                alt={service.title}
                className="aspect-video w-full object-cover"
              />
            </div>

            <div className="mb-8">
              <h2 className="mb-4 text-2xl font-bold">About This Service</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  This professional service offers top-quality work delivered
                  with attention to detail and excellence. With years of
                  experience and hundreds of satisfied clients, you can trust
                  that your project is in good hands.
                </p>
                <p>
                  Whether you're a startup or an established business, this
                  service will help you achieve your goals with expert
                  execution and timely delivery.
                </p>
              </div>
            </div>

            <div className="mb-8">
              <h3 className="mb-4 text-xl font-bold">What's Included</h3>
              <div className="space-y-3">
                {[
                  "High-quality deliverables",
                  "Fast turnaround time",
                  "Professional communication",
                  "Unlimited revisions",
                  "100% satisfaction guarantee",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="mb-4 text-xl font-bold">Reviews</h3>
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review.id} className="rounded-lg border p-4">
                    <div className="mb-2 flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-muted" />
                      <div className="flex-1">
                        <p className="font-semibold">{review.clientName}</p>
                        <div className="flex items-center gap-1">
                          {[...Array(review.rating)].map((_, j) => (
                            <Star
                              key={j}
                              className="h-3 w-3 fill-yellow-400 text-yellow-400"
                            />
                          ))}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-sm text-muted-foreground">
                          {review.date}
                        </span>
                        <p className="text-sm font-semibold text-primary">
                          Amount paid: ${review.amountPaid}
                        </p>
                      </div>
                    </div>
                    <p className="text-muted-foreground">
                      {review.comment}
                    </p>
                  </div>
                ))}
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
                <div className="text-3xl font-bold">${service.price}</div>
              </div>

              <div className="mb-6 space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>Delivery Time</span>
                  </div>
                  <span className="font-medium">3 days</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <RefreshCw className="h-4 w-4" />
                    <span>Revisions</span>
                  </div>
                  <span className="font-medium">Unlimited</span>
                </div>
              </div>

              <Button 
                className="mb-3 w-full" 
                size="lg"
                onClick={() => {
                  if (!wallet) {
                    toast.error("Please connect your wallet first");
                    return;
                  }
                  setShowPaymentModal(true);
                }}
                disabled={!isInitialized}
              >
                Continue (${service.price})
              </Button>

              <div className="flex gap-2">
                <Button variant="outline" size="icon" className="flex-1">
                  <Heart className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" className="flex-1">
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>

              <Separator className="my-6" />

              <div>
                <h4 className="mb-3 font-semibold">Contact Seller</h4>
                <div className="space-y-2">
                  <Button 
                    variant="outline" 
                    className="w-full bg-green-50 hover:bg-green-100 dark:bg-green-950 dark:hover:bg-green-900 border-green-200 dark:border-green-800"
                    onClick={() => {
                      // WhatsApp link - replace with actual seller WhatsApp number
                      window.open(`https://wa.me/${service.seller.replace(/\s+/g, '')}`, '_blank');
                    }}
                  >
                    <svg 
                      className="w-4 h-4 mr-2" 
                      fill="currentColor" 
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                    </svg>
                    WhatsApp
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full bg-blue-50 hover:bg-blue-100 dark:bg-blue-950 dark:hover:bg-blue-900 border-blue-200 dark:border-blue-800"
                    onClick={() => {
                      // Telegram link - replace with actual seller Telegram username
                      window.open(`https://t.me/${service.seller.replace(/\s+/g, '').toLowerCase()}`, '_blank');
                    }}
                  >
                    <svg 
                      className="w-4 h-4 mr-2" 
                      fill="currentColor" 
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                    </svg>
                    Telegram
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Confirmation Modal */}
      <Sheet open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <SheetContent side="bottom" className="rounded-t-3xl">
          <SheetHeader className="mb-6">
            <SheetTitle className="text-2xl font-bold text-center">
              Confirm Payment
            </SheetTitle>
          </SheetHeader>
          
          <div className="space-y-6 px-4 pb-6">
            {/* Warning/Info Box */}
            <div className="bg-muted/50 rounded-xl p-4 border border-border">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-semibold mb-2">Direct Wallet-to-Wallet Payment</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    By clicking confirm, you acknowledge that <strong className="text-foreground">${service.price} will be sent directly from your wallet to {service.seller}'s wallet</strong>. 
                    <strong className="text-foreground block mt-2">FIVE.PAID is not in the middle here!</strong>
                    <span className="block mt-3">At any time after paying (not just this $5 but any future payment also) you can contribute a review of the freelancer from your profile page. This helps keep our community safe and supports the best talent here.</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Payment Details */}
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-card rounded-lg border">
                <span className="text-sm text-muted-foreground">Service</span>
                <span className="text-sm font-medium text-right max-w-[60%]">{service.title}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-card rounded-lg border">
                <span className="text-sm text-muted-foreground">Freelancer</span>
                <span className="text-sm font-medium">{service.seller}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-card rounded-lg border">
                <span className="text-sm text-muted-foreground">Amount</span>
                <span className="text-lg font-bold text-primary">${service.price}</span>
              </div>
            </div>

            {/* Wallet Info */}
            {wallet && (
              <div className="bg-muted/30 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Wallet className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">From your wallet</span>
                </div>
                <p className="text-xs font-mono text-foreground break-all">
                  {String(wallet.address).slice(0, 6)}...{String(wallet.address).slice(-4)}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3 pt-2">
              <Button
                size="lg"
                className="w-full rounded-full h-14 text-lg font-semibold"
                onClick={() => {
                  // TODO: Implement actual wallet payment here
                  // This would use the Porto wallet to send USDC/USDT to freelancer's wallet
                  toast.success(`Payment of $${service.price} will be processed from your wallet`);
                  setShowPaymentModal(false);
                  // In production, this would trigger the actual blockchain transaction
                }}
              >
                Confirm Payment
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="w-full rounded-full h-12"
                onClick={() => setShowPaymentModal(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default ServiceDetail;
