export interface ProductDetails {
  material?: string;
  color?: string;
  dimensions?: string;
  weight?: string;
  madeIn?: string;
}

export interface Product {
  id: number;
  name: string;
  nameVi?: string;
  nameEn?: string;
  price: number;
  oldPrice?: number;
  discount?: string;
  category: string;
  categoryName?: string;
  categoryEn?: string;
  desc: string;
  badge?: string | null;
  badgeType?: string | null;
  inStock?: boolean;
  rating?: number;
  reviewsCount?: number;
  image: string;
  gallery?: string[];
  details?: ProductDetails;
  status?: string;
  showOnHome?: boolean;
}
