interface ServiceFormData {
  title: string;
  category: string;
  price: number;
  deliveryTime: string;
  revisions: string;
  description: string;
  includes: string[];
  imageFile: File | null;
}

export interface IServiceCard {
  _id: string;
  title: string;
  category: string;
  price: number;
  deliveryTime: string;
  revisions: string;
  description: string;
  walletAddress: string;
  includes: string[];
  imageUrl: string;
  imagePublicId: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
  averageRating?: number;
  totalReviews?: number;
  profile?: {
    name: string;
    imageUrl: string;
  };
}

interface Category {
  name: string;
  icon: string;
}
