/**
 * webplatform frontend types
 * ⚠️  SYNC WITH BACKEND: node-apps/webplatform/src/types/index.ts
 * Last synced: 2026-05-30
 */

export type BlockType =
  | "navbar"
  | "hero"
  | "features"
  | "testimonials"
  | "faq"
  | "footer"
  | "cta"
  | "text"
  | "pricing"
  | "about"
  | "team"
  | "gallery"
  | "form"
  | "blog_post"
  | "code"
  | "booking"
  | "ecommerce_product"
  | "ecommerce_cart"
  | "auth_login"
  | "auth_register"
  | "dashboard"
  | "table"
  | "chart";

export const PHASE_1_BLOCKS: BlockType[] = [
  "navbar",
  "hero",
  "features",
  "testimonials",
  "faq",
  "footer",
  "cta",
  "text",
  "pricing",
  "about",
  "team",
  "gallery",
  "form",
  "blog_post",
];

export const PHASE_2_BLOCKS: BlockType[] = [
  "code",
  "booking",
  "ecommerce_product",
  "ecommerce_cart",
  "auth_login",
  "auth_register",
  "dashboard",
  "table",
  "chart",
];

export const BLOCK_TYPES: BlockType[] = [...PHASE_1_BLOCKS, ...PHASE_2_BLOCKS];

export const isBlockType = (value: string): value is BlockType => {
  return BLOCK_TYPES.includes(value as BlockType);
};

export const isPhase1Block = (value: string): boolean => {
  return PHASE_1_BLOCKS.includes(value as BlockType);
};

export const isPhase2Block = (value: string): boolean => {
  return PHASE_2_BLOCKS.includes(value as BlockType);
};

export type SchemaOrgType =
  | "WebSite"
  | "LocalBusiness"
  | "Restaurant"
  | "LawFirm"
  | "MedicalBusiness"
  | "Store"
  | "SoftwareApplication"
  | "BlogPosting"
  | "Person";

export interface NavbarProps {
  logo_text: string;
  logo_image?: string;
  links: Array<{ label: string; url: string }>;
  cta_label?: string;
  cta_url?: string;
  style?: "simple" | "centered" | "transparent";
  bg_color?: string;
}

export interface HeroProps {
  headline: string;
  subheadline: string;
  cta_label: string;
  cta_url: string;
  secondary_cta_label?: string;
  secondary_cta_url?: string;
  background_image?: string;
  background_color?: string;
  style?: "centered" | "split" | "fullscreen";
  badge_text?: string;
}

export interface FeaturesProps {
  title: string;
  subtitle?: string;
  items: Array<{ icon?: string; title: string; description: string }>;
  layout?: "grid-2" | "grid-3" | "grid-4" | "list" | "alternating";
  bg_color?: string;
}

export interface TestimonialsProps {
  title?: string;
  subtitle?: string;
  items: Array<{
    quote: string;
    author: string;
    role?: string;
    company?: string;
    avatar?: string;
    rating?: number;
  }>;
  layout?: "grid" | "carousel" | "quote-large";
}

export interface FaqProps {
  title?: string;
  subtitle?: string;
  items: Array<{ question: string; answer: string }>;
  layout?: "accordion" | "two-cols" | "simple";
}

export interface FooterProps {
  company_name: string;
  description?: string;
  links: Array<{ label: string; url: string }>;
  columns?: Array<{
    title: string;
    links: Array<{ label: string; url: string }>;
  }>;
  social?: Array<{ platform: string; url: string }>;
  copyright?: string;
  style?: "simple" | "columns" | "minimal";
}

export interface CtaProps {
  headline: string;
  subtext?: string;
  button_label: string;
  button_url: string;
  secondary_button_label?: string;
  secondary_button_url?: string;
  variant?: "primary" | "secondary" | "outlined";
  bg_color?: string;
  style?: "banner" | "card" | "full-width";
}

export interface TextProps {
  title?: string;
  body: string;
  align?: "left" | "center" | "right";
  max_width?: "narrow" | "normal" | "wide";
}

export interface PricingProps {
  title?: string;
  subtitle?: string;
  billing_toggle?: boolean;
  plans: Array<{
    name: string;
    price_monthly: string;
    price_yearly?: string;
    period?: string;
    description?: string;
    features: string[];
    cta_label: string;
    cta_url: string;
    highlighted?: boolean;
    badge?: string;
  }>;
  layout?: "cards" | "table" | "minimal";
}

export interface AboutProps {
  title: string;
  body: string;
  image?: string;
  image_position?: "left" | "right";
  stats?: Array<{ label: string; value: string }>;
  style?: "split" | "centered" | "story";
}

export interface TeamProps {
  title?: string;
  subtitle?: string;
  members: Array<{
    name: string;
    role: string;
    bio?: string;
    avatar?: string;
    social?: Array<{ platform: string; url: string }>;
  }>;
  layout?: "cards" | "list" | "minimal";
}

export interface GalleryProps {
  title?: string;
  subtitle?: string;
  images: Array<{ url: string; alt: string; caption?: string }>;
  layout?: "grid" | "masonry" | "carousel";
  columns?: 2 | 3 | 4;
}

export interface FormProps {
  title?: string;
  subtitle?: string;
  fields: Array<{
    name: string;
    label: string;
    type: "text" | "email" | "tel" | "textarea" | "select" | "checkbox" | "radio";
    placeholder?: string;
    required?: boolean;
    options?: string[];
  }>;
  submit_label: string;
  success_message: string;
  action_url?: string;
  style?: "simple" | "multi-step" | "inline";
}

export interface BlogPostProps {
  title: string;
  excerpt: string;
  content: string;
  author?: string;
  author_avatar?: string;
  date?: string;
  cover_image?: string;
  tags?: string[];
  reading_time?: number;
  style?: "article" | "minimal" | "magazine";
}

export interface CodeProps {
  language: string;
  code: string;
  filename?: string;
  theme?: "dark" | "light";
  show_line_numbers?: boolean;
}

export interface BookingProps {
  title?: string;
  description?: string;
  calendar_url: string;
  button_label: string;
}

export interface EcommerceProductProps {
  [key: string]: unknown;
}

export interface EcommerceCartProps {
  [key: string]: unknown;
}

export interface AuthLoginProps {
  [key: string]: unknown;
}

export interface AuthRegisterProps {
  [key: string]: unknown;
}

export interface DashboardProps {
  [key: string]: unknown;
}

export interface TableProps {
  [key: string]: unknown;
}

export interface ChartProps {
  [key: string]: unknown;
}

export type BlockProps =
  | NavbarProps
  | HeroProps
  | FeaturesProps
  | TestimonialsProps
  | FaqProps
  | FooterProps
  | CtaProps
  | TextProps
  | PricingProps
  | AboutProps
  | TeamProps
  | GalleryProps
  | FormProps
  | BlogPostProps
  | CodeProps
  | BookingProps
  | EcommerceProductProps
  | EcommerceCartProps
  | AuthLoginProps
  | AuthRegisterProps
  | DashboardProps
  | TableProps
  | ChartProps;

export interface SeoMeta {
  title?: string;
  description?: string;
  keywords?: string[];
  og_title?: string;
  og_description?: string;
  og_image?: string;
  sitemap_generated_at?: string;
  schema_org?: {
    type: SchemaOrgType;
    jsonld: object;
    generated_at: string;
  };
  llm_visibility?: {
    llms_txt?: string;
    ai_summary?: string;
    faq_pairs?: Array<{ q: string; a: string }>;
    generated_at: string;
  };
}

export interface BlockTemplate {
  id: string;
  type: BlockType;
  variant: string;
  name: string;
  description: string;
  props_schema: object;
  preview_url?: string;
  phase: 1 | 2;
  is_custom: boolean;
  tenant_id?: string;
}

/** Row shape for webplatform.tenants */
export interface Tenant {
  id: string;
  user_id: string;
  name: string;
  slug: string;
  plan: "starter" | "pro" | "agency";
  sites_limit: number;
  storage_limit: number;
  created_at: string;
  updated_at: string;
}

export interface ProjectBrief {
  text?: string;
  base_answers?: Record<string, unknown>;
  dynamic_answers?: Record<string, unknown>;
  generated_at?: string;
  [key: string]: unknown;
}

/** Row shape for webplatform.projects */
export interface Project {
  id: string;
  tenant_id: string;
  name: string;
  slug: string;
  subdomain?: string | null;
  custom_domain?: string | null;
  status: "draft" | "published" | "archived";
  brief?: ProjectBrief | null;
  meta?: SeoMeta | null;
  created_at: string;
  updated_at: string;
}

/** Row shape for webplatform.pages — no updated_at column */
export interface Page {
  id: string;
  project_id: string;
  tenant_id: string;
  title: string;
  slug: string;
  order_index: number;
  meta?: SeoMeta | null;
  created_at: string;
}

/** Row shape for webplatform.blocks — props, not content */
export interface Block {
  id: string;
  page_id: string;
  tenant_id: string;
  type: BlockType;
  order_index: number;
  props: BlockProps;
  template_id?: string | null;
  ab_variant?: string | null;
  created_at: string;
  updated_at: string;
}

/** Row shape for webplatform.assets — no updated_at column */
export interface Asset {
  id: string;
  tenant_id: string;
  project_id?: string | null;
  filename: string;
  storage_path: string;
  public_url: string;
  size_bytes?: number | null;
  mime_type?: string | null;
  created_at: string;
}

/** Row shape for webplatform.exports — price_eur in centimes, no updated_at */
export interface Export {
  id: string;
  tenant_id: string;
  project_id: string;
  status: "pending" | "processing" | "ready" | "expired" | "error";
  complexity?: ExportComplexity | null;
  price_eur: number;
  stripe_pi?: string | null;
  storage_path?: string | null;
  public_url?: string | null;
  expires_at?: string | null;
  created_at: string;
}

export interface Subscription {
  id: string;
  tenant_id: string;
  stripe_customer?: string;
  stripe_sub_id?: string;
  plan: string;
  status: "active" | "canceled" | "past_due";
  current_period_end?: string;
  created_at: string;
  updated_at: string;
}

export interface JwtUser {
  id: string;
  email: string;
  tenant_id: string;
}

export interface RegisterBody {
  email: string;
  password: string;
  name: string;
}

export interface LoginBody {
  email: string;
  password: string;
}

export interface CreateProjectBody {
  name: string;
  slug?: string;
  subdomain?: string;
  custom_domain?: string;
  brief?: ProjectBrief;
  meta?: SeoMeta;
}

export interface UpdateProjectBody {
  name?: string;
  slug?: string;
  subdomain?: string;
  custom_domain?: string;
  status?: Project["status"];
  brief?: ProjectBrief;
  meta?: SeoMeta;
}

export interface CreatePageBody {
  slug: string;
  title: string;
  order_index?: number;
  meta?: SeoMeta;
}

export interface UpdatePageBody {
  slug?: string;
  title?: string;
  order_index?: number;
  meta?: SeoMeta;
}

export interface ReorderPagesBody {
  pages: { id: string; order_index: number }[];
}

export interface CreateBlockBody {
  type: BlockType;
  props: BlockProps;
  order_index?: number;
  template_id?: string | null;
  ab_variant?: string;
}

export interface UpdateBlockBody {
  props?: BlockProps;
  order_index?: number;
  ab_variant?: string | null;
}

export interface ReorderBlocksBody {
  blocks: { id: string; order_index: number }[];
}

export type ExportComplexity = "simple" | "standard" | "complex";

export const PHASE_1_BLOCK_LIST: string = PHASE_1_BLOCKS.join(", ");

export const mergeSeoMeta = (
  existing: SeoMeta | null | undefined,
  patch: SeoMeta,
): SeoMeta => {
  return { ...(existing ?? undefined), ...patch };
};

/** Human-readable labels for block types */
export const BLOCK_TYPE_LABELS: Record<BlockType, string> = {
  navbar: "Navigation Bar",
  hero: "Hero Section",
  features: "Features",
  testimonials: "Testimonials",
  faq: "FAQ",
  footer: "Footer",
  cta: "Call to Action",
  text: "Text",
  pricing: "Pricing",
  about: "About",
  team: "Team",
  gallery: "Gallery",
  form: "Form",
  blog_post: "Blog Post",
  code: "Code",
  booking: "Booking",
  ecommerce_product: "Product",
  ecommerce_cart: "Cart",
  auth_login: "Login",
  auth_register: "Register",
  dashboard: "Dashboard",
  table: "Table",
  chart: "Chart",
};
