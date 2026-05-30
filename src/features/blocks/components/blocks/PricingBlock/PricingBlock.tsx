import React from "react";

export interface PricingPlan {
  name: string;
  price: string;
  period?: string;
  description?: string;
  features: string[];
  ctaText: string;
  ctaLink: string;
  isPopular?: boolean;
}

export interface PricingBlockProps {
  title?: string;
  subtitle?: string;
  plans?: PricingPlan[];
  backgroundColor?: string;
}

export const PricingBlock: React.FC<PricingBlockProps> = ({
  title = "Simple, transparent pricing",
  subtitle = "Choose the plan that's right for you.",
  plans = [
    {
      name: "Starter",
      price: "$0",
      period: "/month",
      description: "Perfect for personal projects.",
      features: ["Up to 3 projects", "Basic components", "Community support", "1GB Storage"],
      ctaText: "Get Started",
      ctaLink: "#",
    },
    {
      name: "Pro",
      price: "$29",
      period: "/month",
      description: "For professional creators.",
      features: ["Unlimited projects", "Premium components", "Priority support", "10GB Storage", "Custom domains"],
      ctaText: "Upgrade to Pro",
      ctaLink: "#",
      isPopular: true,
    },
    {
      name: "Enterprise",
      price: "$99",
      period: "/month",
      description: "For large teams.",
      features: ["Everything in Pro", "Custom integrations", "Dedicated success manager", "Unlimited Storage", "SSO"],
      ctaText: "Contact Sales",
      ctaLink: "#",
    }
  ],
  backgroundColor = "var(--color-bg-primary)",
}) => {
  return (
    <section style={{ backgroundColor, padding: "var(--space-4xl) var(--space-xl)" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "var(--space-3xl)" }}>
          {title && <h2 style={{ fontSize: "2.5rem", fontWeight: 700, marginBottom: "var(--space-sm)", color: "var(--color-text-primary)" }}>{title}</h2>}
          {subtitle && <p style={{ fontSize: "1.125rem", color: "var(--color-text-secondary)" }}>{subtitle}</p>}
        </div>

        <div style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: "var(--space-xl)",
          alignItems: "center" // So non-popular plans are slightly shorter
        }}>
          {plans.map((plan, i) => (
            <div 
              key={i}
              style={{
                flex: "1 1 300px",
                maxWidth: "380px",
                padding: plan.isPopular ? "var(--space-3xl) var(--space-2xl)" : "var(--space-2xl)",
                background: plan.isPopular ? "var(--color-bg-primary)" : "var(--color-bg-elevated)",
                border: plan.isPopular ? "2px solid var(--color-accent-primary)" : "1px solid var(--color-border-subtle)",
                borderRadius: "var(--radius-xl)",
                position: "relative",
                boxShadow: plan.isPopular ? "var(--shadow-xl)" : "none",
                display: "flex",
                flexDirection: "column"
              }}
            >
              {plan.isPopular && (
                <div style={{
                  position: "absolute",
                  top: 0,
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  background: "var(--color-accent-primary)",
                  color: "white",
                  padding: "4px 12px",
                  borderRadius: "var(--radius-full)",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em"
                }}>
                  Most Popular
                </div>
              )}
              
              <h3 style={{ fontSize: "1.25rem", fontWeight: 600, color: "var(--color-text-primary)", marginBottom: "var(--space-xs)" }}>
                {plan.name}
              </h3>
              {plan.description && (
                <p style={{ color: "var(--color-text-tertiary)", fontSize: "0.875rem", marginBottom: "var(--space-lg)" }}>
                  {plan.description}
                </p>
              )}
              
              <div style={{ display: "flex", alignItems: "baseline", gap: "4px", marginBottom: "var(--space-2xl)" }}>
                <span style={{ fontSize: "3rem", fontWeight: 800, color: "var(--color-text-primary)", lineHeight: 1 }}>
                  {plan.price}
                </span>
                {plan.period && <span style={{ color: "var(--color-text-secondary)" }}>{plan.period}</span>}
              </div>

              <ul style={{ listStyle: "none", padding: 0, margin: "0 0 var(--space-2xl) 0", flexGrow: 1, display: "flex", flexDirection: "column", gap: "var(--space-md)" }}>
                {plan.features.map((feature, j) => (
                  <li key={j} style={{ display: "flex", alignItems: "flex-start", gap: "12px", color: "var(--color-text-secondary)" }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ color: "var(--color-accent-primary)", flexShrink: 0 }}>
                      <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <a 
                href={plan.ctaLink}
                style={{
                  display: "block",
                  textAlign: "center",
                  padding: "14px 24px",
                  background: plan.isPopular ? "var(--color-accent-primary)" : "var(--color-bg-tertiary)",
                  color: plan.isPopular ? "white" : "var(--color-text-primary)",
                  borderRadius: "var(--radius-md)",
                  fontWeight: 600,
                  textDecoration: "none",
                  transition: "background var(--transition-fast)"
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = plan.isPopular ? "var(--color-accent-primary-hover)" : "var(--color-border-subtle)";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = plan.isPopular ? "var(--color-accent-primary)" : "var(--color-bg-tertiary)";
                }}
              >
                {plan.ctaText}
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
