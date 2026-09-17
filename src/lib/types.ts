export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  photo_url: string | null;
  created_at: string;
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

export interface OrderItem {
  product_id: string;
  name: string;
  price: number;
  quantity: number;
}

export interface ShippingAddress {
  line1: string | null;
  line2: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  country: string | null;
}

export interface Order {
  id: string;
  customer_email: string;
  customer_name: string | null;
  phone: string | null;
  shipping: ShippingAddress | null;
  stripe_payment_id: string | null;
  items: OrderItem[];
  total: number;
  status: "pending" | "fulfilled" | "cancelled";
  created_at: string;
}

export interface AnalyticsSession {
  id: string;
  session_id: string;
  visitor_id: string | null;
  visit_number: number;
  is_new_visitor: boolean;
  first_seen_at: string | null;
  started_at: string;
  ended_at: string;
  duration_ms: number;
  pages: import("./analytics").PageVisit[];
  page_count: number;
  landing_page: string | null;
  exit_page: string | null;
  max_scroll_pct: number;
  referrer: string | null;
  referrer_host: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_term: string | null;
  utm_content: string | null;
  events: import("./analytics").AnalyticsEvent[];
  event_count: number;
  reached_checkout: boolean;
  purchased: boolean;
  device_type: string | null;
  browser: string | null;
  os: string | null;
  screen: string | null;
  viewport: string | null;
  language: string | null;
  timezone: string | null;
  connection: string | null;
  touch: boolean;
  country: string | null;
  region: string | null;
  city: string | null;
  user_agent: string | null;
  created_at: string;
  updated_at: string;
}

export interface Database {
  public: {
    Tables: {
      products: { Row: Product; Insert: Omit<Product, "id" | "created_at">; Update: Partial<Product> };
      email_subscribers: { Row: EmailSubscriber; Insert: Omit<EmailSubscriber, "id" | "created_at">; Update: Partial<EmailSubscriber> };
      orders: { Row: Order; Insert: Omit<Order, "id" | "created_at">; Update: Partial<Order> };
    };
  };
}
