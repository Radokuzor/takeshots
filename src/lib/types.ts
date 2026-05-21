export type OccasionTag =
  | "bachelorette"
  | "wedding"
  | "birthday"
  | "anniversary"
  | "game_night"
  | "holiday";

export type ArticleCategory = "near_me" | "blog";

export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  photo_url: string | null;
  occasion_tag: OccasionTag | null;
  amazon_asin: string | null;
  pros: string[] | null;
  cons: string[] | null;
  key_points: string[] | null;
  featured: boolean;
  created_at: string;
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  category: ArticleCategory;
  city: string | null;
  body: string | null;
  author: string;
  last_updated: string;
  tags: string[] | null;
  related_slugs: string[] | null;
}

export interface EmailSubscriber {
  id: string;
  email: string;
  discount_claimed: boolean;
  source: "hero" | "popup" | "footer" | "play_page";
  created_at: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Database {
  public: {
    Tables: {
      products: { Row: Product; Insert: Omit<Product, "id" | "created_at">; Update: Partial<Product> };
      articles: { Row: Article; Insert: Omit<Article, "id">; Update: Partial<Article> };
      email_subscribers: { Row: EmailSubscriber; Insert: Omit<EmailSubscriber, "id" | "created_at">; Update: Partial<EmailSubscriber> };
    };
  };
}
