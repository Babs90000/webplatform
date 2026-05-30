import { BlockType } from "@/types";

export type FieldType = "text" | "textarea" | "color" | "select" | "number" | "boolean" | "array";

export interface FieldOption {
  label: string;
  value: string;
}

export interface FieldDefinition {
  name: string; // The property key in block.props
  label: string; // User-facing label
  type: FieldType;
  options?: FieldOption[]; // For 'select' type
  arraySchema?: FieldDefinition[]; // For 'array' type (e.g. lists of links/features)
  defaultValue?: unknown;
}

// Maps each BlockType to its editable fields
export const BLOCK_FIELD_SCHEMAS: Record<BlockType, FieldDefinition[]> = {
  navbar: [
    { name: "logoText", label: "Logo Text", type: "text", defaultValue: "WebPlatform" },
    { name: "logoImageUrl", label: "Logo Image URL", type: "text" },
    { name: "ctaText", label: "CTA Button Text", type: "text", defaultValue: "Get Started" },
    { name: "ctaLink", label: "CTA Button Link", type: "text", defaultValue: "#" },
    { name: "backgroundColor", label: "Background Color", type: "color", defaultValue: "transparent" },
    { name: "textColor", label: "Text Color", type: "color", defaultValue: "var(--color-text-primary)" },
  ],
  hero: [
    { name: "title", label: "Title", type: "text", defaultValue: "Build something amazing" },
    { name: "subtitle", label: "Subtitle", type: "textarea", defaultValue: "The most powerful platform to launch your next big idea." },
    { name: "primaryCtaText", label: "Primary CTA Text", type: "text" },
    { name: "primaryCtaLink", label: "Primary CTA Link", type: "text" },
    { name: "secondaryCtaText", label: "Secondary CTA Text", type: "text" },
    { name: "secondaryCtaLink", label: "Secondary CTA Link", type: "text" },
    { 
      name: "alignment", label: "Alignment", type: "select", defaultValue: "center",
      options: [{ label: "Left", value: "left" }, { label: "Center", value: "center" }, { label: "Right", value: "right" }]
    },
    { name: "backgroundColor", label: "Background Color", type: "color", defaultValue: "var(--color-bg-primary)" },
  ],
  features: [
    { name: "title", label: "Title", type: "text", defaultValue: "Why Choose Us" },
    { name: "subtitle", label: "Subtitle", type: "textarea" },
    { name: "backgroundColor", label: "Background Color", type: "color", defaultValue: "var(--color-bg-secondary)" },
  ],
  text: [
    { name: "body", label: "Content", type: "textarea", defaultValue: "Enter text here..." },
    { 
      name: "align", label: "Alignment", type: "select", defaultValue: "left",
      options: [{ label: "Left", value: "left" }, { label: "Center", value: "center" }, { label: "Right", value: "right" }]
    },
  ],
  gallery: [
    { name: "title", label: "Title", type: "text", defaultValue: "Gallery" },
    { name: "subtitle", label: "Subtitle", type: "textarea" },
    { 
      name: "columns", label: "Columns", type: "select", defaultValue: "3",
      options: [{ label: "2", value: "2" }, { label: "3", value: "3" }, { label: "4", value: "4" }]
    },
  ],
  testimonials: [
    { name: "title", label: "Title", type: "text", defaultValue: "Loved by builders" },
    { name: "subtitle", label: "Subtitle", type: "textarea" },
  ],
  pricing: [
    { name: "title", label: "Title", type: "text", defaultValue: "Simple, transparent pricing" },
    { name: "subtitle", label: "Subtitle", type: "textarea" },
  ],
  cta: [
    { name: "headline", label: "Headline", type: "text", defaultValue: "Ready to get started?" },
    { name: "subtext", label: "Subtext", type: "textarea" },
    { name: "button_label", label: "Button Label", type: "text", defaultValue: "Start for free" },
    { name: "button_url", label: "Button URL", type: "text" },
  ],
  footer: [
    { name: "company_name", label: "Company Name", type: "text", defaultValue: "WebPlatform" },
    { name: "description", label: "Description", type: "textarea" },
    { name: "copyright", label: "Copyright", type: "text" },
  ],
  // Empty definitions for remaining blocks
  faq: [],
  about: [],
  team: [],
  form: [],
  blog_post: [],
  code: [],
  booking: [],
  ecommerce_product: [],
  ecommerce_cart: [],
  auth_login: [],
  auth_register: [],
  dashboard: [],
  table: [],
  chart: [],
};
