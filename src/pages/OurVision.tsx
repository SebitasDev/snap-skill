import { Link } from "react-router-dom";
import { ArrowLeft, DollarSign, Star, Repeat, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";

const OurVision = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <Button variant="ghost" asChild className="mb-6">
            <Link to="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>

          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Our Vision</h1>
            <p className="text-xl text-muted-foreground">
              Empowering direct commerce through blockchain payments and continuous reputation building
            </p>
          </div>

          <div className="space-y-8">
            {/* Direct Payments Section */}
            <section className="bg-card rounded-2xl p-8 border border-border/50">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <DollarSign className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-3">Direct Payments with USDC & USDT</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    At FIVE.PAID, we believe in removing intermediaries and platform bloat. By using USDC and USDT 
                    for payments, buyers and freelancers can transact directly on the blockchain. This means:
                  </p>
                  <ul className="mt-4 space-y-2 text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>Zero platform fees after the initial $5 connection</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>Instant, borderless payments using stablecoins</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>Full transparency with blockchain-verified transactions</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>No chargebacks or payment disputes—blockchain ensures trust</span>
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Reputation System Section */}
            <section className="bg-card rounded-2xl p-8 border border-border/50">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Star className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-3">A Novel Reputation System</h2>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    Traditional platforms limit reviews to a single transaction. We've built something different—a 
                    reputation system that grows with every interaction.
                  </p>
                  <div className="bg-muted/50 rounded-xl p-6 mb-4">
                    <h3 className="font-semibold mb-2">How It Works:</h3>
                    <ol className="space-y-3 text-muted-foreground">
                      <li className="flex items-start gap-3">
                        <span className="font-bold text-primary flex-shrink-0 w-6">1.</span>
                        <span>
                          <strong className="text-foreground">First $5 Gig:</strong> Start your partnership with a 
                          freelancer through our platform. This initial connection establishes the relationship and 
                          allows you to leave your first review.
                        </span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="font-bold text-primary flex-shrink-0 w-6">2.</span>
                        <span>
                          <strong className="text-foreground">Direct Payments:</strong> After the first $5, you and 
                          the freelancer can transact directly using USDC or USDT. No platform fees, no middleman.
                        </span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="font-bold text-primary flex-shrink-0 w-6">3.</span>
                        <span>
                          <strong className="text-foreground">Continuous Reviews:</strong> Every time you pay the 
                          freelancer—whether it's $5, $50, or $500—you can create a new review. This creates a 
                          living, evolving reputation that reflects the ongoing relationship, not just a one-time 
                          transaction.
                        </span>
                      </li>
                    </ol>
                  </div>
                </div>
              </div>
            </section>

            {/* Benefits Section */}
            <section className="bg-card rounded-2xl p-8 border border-border/50">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Repeat className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-3">Why This Matters</h2>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-muted/30 rounded-lg p-4">
                      <h3 className="font-semibold mb-2">For Buyers</h3>
                      <p className="text-sm text-muted-foreground">
                        Build trust over time with freelancers through repeated transactions. Your review history 
                        shows the evolution of your working relationship, not just a single snapshot.
                      </p>
                    </div>
                    <div className="bg-muted/30 rounded-lg p-4">
                      <h3 className="font-semibold mb-2">For Freelancers</h3>
                      <p className="text-sm text-muted-foreground">
                        Earn reputation through every payment, not just the first one. Long-term clients can 
                        continuously validate your quality, building a more accurate and comprehensive profile.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Trust Section */}
            <section className="bg-card rounded-2xl p-8 border border-border/50">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-3">Blockchain-Powered Trust</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    By leveraging blockchain technology, every payment is verifiable and immutable. This creates a 
                    foundation of trust that traditional platforms can't match. Combined with our continuous 
                    review system, you get both the transparency of blockchain and the human insight of reviews 
                    that evolve with your relationships.
                  </p>
                </div>
              </div>
            </section>

            {/* CTA */}
            <div className="text-center py-8">
              <Button size="lg" asChild>
                <Link to="/browse">
                  Start Your First $5 Partnership
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OurVision;

