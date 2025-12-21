import { Link } from "react-router-dom";
import { Star, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ServiceCardProps {
  _id: string;
  title: string;
  price: number;
  rating: number;
  reviews: number;
  imageUrl: string;
  category: string;
  sellerLevel: string;
  walletAddress: string;
  profile?: {
    name: string;
    imageUrl: string;
  };
}

const ServiceCard = ({
  _id,
  title,
  price,
  rating,
  reviews,
  imageUrl,
  category,
  sellerLevel,
  walletAddress,
  profile,
}: ServiceCardProps) => {
  return (
    <Link to={`/service/${_id}`} className="group">
      <div className="overflow-hidden rounded-lg border bg-card transition-all hover:shadow-lg">
        <div className="relative aspect-video overflow-hidden">
          <img
            src={imageUrl}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <Button
            size="icon"
            variant="secondary"
            className="absolute right-2 top-2 h-8 w-8 rounded-full opacity-0 transition-opacity group-hover:opacity-100"
          >
            <Heart className="h-4 w-4" />
          </Button>
          <Badge className="absolute left-2 top-2 bg-background/80 text-foreground backdrop-blur-sm">
            {category}
          </Badge>
        </div>

        <div className="p-4">
          <div className="mb-2 flex items-center space-x-2">
            <div className="h-8 w-8 overflow-hidden rounded-full bg-muted">
              {profile?.imageUrl ? (
                <img src={profile.imageUrl} alt={profile.name} className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full bg-gray-300" />
              )}
            </div>
            <div>
              <p className="text-sm font-medium">
                {profile?.name || (walletAddress ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : "Unknown")}
              </p>
              <p className="text-xs text-muted-foreground">{sellerLevel}</p>
            </div>
          </div>

          <h3 className="mb-2 line-clamp-2 text-base font-semibold transition-colors group-hover:text-primary">
            {title}
          </h3>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1">
              <Star className="h-4 w-4 fill-primary text-primary" />
              <span className="font-medium">{rating}</span>
              <span className="text-muted-foreground">({reviews})</span>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Starting at</p>
              <p className="text-lg font-bold text-primary">${(Number(price) + 0.02).toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ServiceCard;
