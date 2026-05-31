import React from "react";
import type { FeaturesProps } from "@/types";

export const FeaturesBlock: React.FC<FeaturesProps> = ({
  title = "Why Choose Us",
  subtitle = "Discover the features that make our platform stand out.",
  items = [
    { title: "Lightning Fast", description: "Optimized for speed and performance right out of the box." },
    { title: "Secure by Design", description: "Enterprise-grade security features built into the core." },
    { title: "Infinitely Scalable", description: "Grows with your business without breaking a sweat." },
  ],
  layout = "grid-3",
  bg_color = "var(--color-bg-secondary)",
}) => {
  const getGridTemplate = () => {
    switch (layout) {
      case "grid-2": return "repeat(auto-fit, minmax(400px, 1fr))";
      case "grid-3": return "repeat(auto-fit, minmax(300px, 1fr))";
      case "grid-4": return "repeat(auto-fit, minmax(250px, 1fr))";
      case "list": return "1fr";
      case "alternating": return "1fr";
      default: return "repeat(auto-fit, minmax(300px, 1fr))";
    }
  };

  return (
    <section 
      style={{
        backgroundColor: bg_color,
        color: "var(--color-text-primary)",
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
        gridTemplateColumns: getGridTemplate(),
        gap: layout === "alternating" ? "var(--space-3xl)" : "var(--space-xl)",
        maxWidth: "1200px",
        margin: "0 auto"
      }}>
        {items.map((item, i) => {
          const isAlternating = layout === "alternating";
          const isEven = i % 2 === 0;

          return (
            <div 
              key={i}
              style={{
                padding: isAlternating ? "0" : "var(--space-2xl)",
                background: isAlternating ? "transparent" : "var(--glass-bg)",
                backdropFilter: isAlternating ? "none" : "blur(var(--glass-blur))",
                border: isAlternating ? "none" : "1px solid var(--glass-border)",
                borderRadius: "var(--radius-xl)",
                transition: "transform var(--transition-normal), box-shadow var(--transition-normal)",
                cursor: "default",
                display: "flex",
                flexDirection: isAlternating ? (isEven ? "row" : "row-reverse") : "column",
                alignItems: isAlternating ? "center" : "flex-start",
                gap: isAlternating ? "var(--space-2xl)" : "0"
              }}
              onMouseOver={(e) => {
                if (!isAlternating) {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow = "var(--shadow-xl)";
                }
              }}
              onMouseOut={(e) => {
                if (!isAlternating) {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }
              }}
            >
              {/* If alternating, show a placeholder image on one side */}
              {isAlternating && (
                <div style={{
                  flex: 1,
                  height: "300px",
                  background: "rgba(99, 102, 241, 0.05)",
                  borderRadius: "var(--radius-xl)",
                  border: "1px solid rgba(99, 102, 241, 0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--color-accent-primary)"
                }}>
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <circle cx="8.5" cy="8.5" r="1.5"></circle>
                    <polyline points="21 15 16 10 5 21"></polyline>
                  </svg>
                </div>
              )}

              <div style={{ flex: 1 }}>
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
                  {item.icon ? (
                    <span>{item.icon}</span>
                  ) : (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
                      <polyline points="2 17 12 22 22 17"></polyline>
                      <polyline points="2 12 12 17 22 12"></polyline>
                    </svg>
                  )}
                </div>
                <h3 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "var(--space-sm)" }}>
                  {item.title}
                </h3>
                <p style={{ color: "var(--color-text-secondary)", lineHeight: 1.6 }}>
                  {item.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
