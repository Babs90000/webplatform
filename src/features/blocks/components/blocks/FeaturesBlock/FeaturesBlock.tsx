import React from "react";

export interface FeatureItem {
  icon?: string;
  title: string;
  description: string;
}

export interface FeaturesBlockProps {
  title?: string;
  subtitle?: string;
  features?: FeatureItem[];
  backgroundColor?: string;
  textColor?: string;
}

export const FeaturesBlock: React.FC<FeaturesBlockProps> = ({
  title = "Why Choose Us",
  subtitle = "Discover the features that make our platform stand out.",
  features = [
    { title: "Lightning Fast", description: "Optimized for speed and performance right out of the box." },
    { title: "Secure by Design", description: "Enterprise-grade security features built into the core." },
    { title: "Infinitely Scalable", description: "Grows with your business without breaking a sweat." },
  ],
  backgroundColor = "var(--color-bg-secondary)",
  textColor = "var(--color-text-primary)",
}) => {
  return (
    <section 
      style={{
        backgroundColor,
        color: textColor,
        padding: "var(--space-4xl) var(--space-xl)",
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto", textAlign: "center", marginBottom: "var(--space-3xl)" }}>
        {title && (
          <h2 style={{ 
            fontSize: "clamp(2rem, 4vw, 3rem)", 
            fontWeight: 700, 
            marginBottom: "var(--space-md)",
            letterSpacing: "-0.02em"
          }}>
            {title}
          </h2>
        )}
        {subtitle && (
          <p style={{ 
            fontSize: "1.125rem", 
            color: "var(--color-text-secondary)",
            maxWidth: "600px",
            margin: "0 auto"
          }}>
            {subtitle}
          </p>
        )}
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
        gap: "var(--space-xl)",
        maxWidth: "1200px",
        margin: "0 auto"
      }}>
        {features.map((feature, i) => (
          <div 
            key={i}
            style={{
              padding: "var(--space-2xl)",
              background: "var(--glass-bg)",
              backdropFilter: "blur(var(--glass-blur))",
              border: "1px solid var(--glass-border)",
              borderRadius: "var(--radius-xl)",
              transition: "transform var(--transition-normal), box-shadow var(--transition-normal)",
              cursor: "default"
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = "translateY(-4px)";
              e.currentTarget.style.boxShadow = "var(--shadow-xl)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            <div style={{
              width: "48px",
              height: "48px",
              borderRadius: "12px",
              background: "rgba(99, 102, 241, 0.1)",
              color: "var(--color-accent-primary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "var(--space-lg)",
              fontSize: "1.5rem"
            }}>
              {/* Fallback Icon */}
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
                <polyline points="2 17 12 22 22 17"></polyline>
                <polyline points="2 12 12 17 22 12"></polyline>
              </svg>
            </div>
            <h3 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "var(--space-sm)" }}>
              {feature.title}
            </h3>
            <p style={{ color: "var(--color-text-secondary)", lineHeight: 1.6 }}>
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};
