import React from "react";
import { Block, BlockType } from "@/types";
import { PlaceholderBlock } from "../blocks/PlaceholderBlock";
import { HeroBlock } from "../blocks/HeroBlock";
import { NavbarBlock } from "../blocks/NavbarBlock";
import { FeaturesBlock } from "../blocks/FeaturesBlock";
import { TextBlock } from "../blocks/TextBlock";
import { GalleryBlock } from "../blocks/GalleryBlock";
import { TestimonialsBlock } from "../blocks/TestimonialsBlock";
import { PricingBlock } from "../blocks/PricingBlock";
import { CTABlock } from "../blocks/CTABlock";
import { FooterBlock } from "../blocks/FooterBlock";
import { AboutBlock } from "../blocks/AboutBlock";

// The registry mapping BlockType to React Components
const BlockRegistry: Record<BlockType, React.FC<Record<string, unknown>>> = {
  navbar: NavbarBlock as unknown as React.FC<Record<string, unknown>>,
  hero: HeroBlock as unknown as React.FC<Record<string, unknown>>,
  features: FeaturesBlock as unknown as React.FC<Record<string, unknown>>,
  text: TextBlock as unknown as React.FC<Record<string, unknown>>,
  gallery: GalleryBlock as unknown as React.FC<Record<string, unknown>>,
  testimonials: TestimonialsBlock as unknown as React.FC<Record<string, unknown>>,
  pricing: PricingBlock as unknown as React.FC<Record<string, unknown>>,
  cta: CTABlock as unknown as React.FC<Record<string, unknown>>,
  footer: FooterBlock as unknown as React.FC<Record<string, unknown>>,
  about: AboutBlock as unknown as React.FC<Record<string, unknown>>,
  
  // Phase 1 (Pending implementation)
  faq: PlaceholderBlock as unknown as React.FC<Record<string, unknown>>,
  team: PlaceholderBlock as unknown as React.FC<Record<string, unknown>>,
  form: PlaceholderBlock as unknown as React.FC<Record<string, unknown>>,
  blog_post: PlaceholderBlock as unknown as React.FC<Record<string, unknown>>,

  // Phase 2
  code: PlaceholderBlock as unknown as React.FC<Record<string, unknown>>,
  booking: PlaceholderBlock as unknown as React.FC<Record<string, unknown>>,
  ecommerce_product: PlaceholderBlock as unknown as React.FC<Record<string, unknown>>,
  ecommerce_cart: PlaceholderBlock as unknown as React.FC<Record<string, unknown>>,
  auth_login: PlaceholderBlock as unknown as React.FC<Record<string, unknown>>,
  auth_register: PlaceholderBlock as unknown as React.FC<Record<string, unknown>>,
  dashboard: PlaceholderBlock as unknown as React.FC<Record<string, unknown>>,
  table: PlaceholderBlock as unknown as React.FC<Record<string, unknown>>,
  chart: PlaceholderBlock as unknown as React.FC<Record<string, unknown>>,
};

interface BlockRendererProps {
  block: Block;
}

export const BlockRenderer: React.FC<BlockRendererProps> = ({ block }) => {
  const Component = BlockRegistry[block.type];

  if (!Component) {
    return <PlaceholderBlock type={block.type} />;
  }

  // Inject type for PlaceholderBlock specifically
  if ((Component as unknown) === PlaceholderBlock) {
    return <PlaceholderBlock type={block.type} />;
  }

  // Normal rendering passing block props directly
  return <Component {...block.props} />;
};
