import { Link } from "react-router-dom";
import { Star, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ServiceCardProps {
  id: string;
  title: string;
  seller: string;
  sellerLevel: string;
  rating: number;
  reviews: number;
  price: number;
  image: string;
  category: string;
}

const ServiceCard = ({
  id,
  title,
  seller,
  sellerLevel,
  rating,
  reviews,
  price,
  image,
  category,
}: ServiceCardProps) => {
  return (
    <Link to={`/service/${id}`} className="group">
      <div className="overflow-hidden rounded-lg border bg-card transition-all hover:shadow-lg">
        <div className="relative aspect-video overflow-hidden">
          <img
            src={image}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <Button
            size="icon"
            variant="ghost"
            className="absolute right-2 top-2 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            <Heart className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-4">
          <div className="mb-2 flex items-center space-x-2">
            <div className="h-8 w-8 rounded-full bg-muted" />
            <div className="flex-1 text-sm">
              <p className="font-medium">{seller}</p>
              <p className="text-muted-foreground">{sellerLevel}</p>
            </div>
          </div>

          <h3 className="mb-2 line-clamp-2 font-medium text-card-foreground group-hover:text-primary transition-colors">
            {title}
          </h3>

          <div className="mb-3">
            <Badge variant="secondary" className="text-xs">
              {category}
            </Badge>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1 text-sm">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="font-semibold">{rating}</span>
              <span className="text-muted-foreground">({reviews})</span>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Starting at</p>
              <p className="text-lg font-bold text-card-foreground">${price}</p>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ServiceCard;
