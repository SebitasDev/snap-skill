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
import { services } from "@/data/mockData";
import {sendSupplierPayment} from "@/utils/feeTx.ts";
import {useWalletAccount} from "@/hooks/useWalletAccount.ts";
import {sendUsdcPayment} from "@/utils/sentUSDC.ts";

const ServiceDetail = () => {
    const { id } = useParams();
    const service = services.find((s) => s.id === Number(id)) || services[0];
    const { user, walletClient, publicClient } = useWalletAccount();

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
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="rounded-lg border p-4">
                                        <div className="mb-2 flex items-center gap-2">
                                            <div className="h-8 w-8 rounded-full bg-muted" />
                                            <div className="flex-1">
                                                <p className="font-semibold">Client {i}</p>
                                                <div className="flex items-center gap-1">
                                                    {[...Array(5)].map((_, j) => (
                                                        <Star
                                                            key={j}
                                                            className="h-3 w-3 fill-yellow-400 text-yellow-400"
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                            <span className="text-sm text-muted-foreground">
                        2 days ago
                      </span>
                                        </div>
                                        <p className="text-muted-foreground">
                                            Excellent work! Very professional and delivered exactly
                                            what I needed. Will definitely work with them again.
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

                            <Button className="mb-3 w-full" size="lg"
                                onClick={async () => {
                                    await sendSupplierPayment(user)

                                    await sendUsdcPayment(user, walletClient, publicClient, "0x01e048f8450e6ff1bf0e356ec78a4618d9219770", "0.0001") //Change for a rel user and real amount
                                }}
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
                                <Button variant="outline" className="w-full">
                                    Send Message
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ServiceDetail;