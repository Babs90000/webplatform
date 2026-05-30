import React from "react";

export interface HeroBlockProps {
  title?: string;
  subtitle?: string;
  primaryCtaText?: string;
  primaryCtaLink?: string;
  secondaryCtaText?: string;
  secondaryCtaLink?: string;
  alignment?: "left" | "center" | "right";
  backgroundColor?: string;
  textColor?: string;
}

export const HeroBlock: React.FC<HeroBlockProps> = ({
  title = "Build something amazing",
  subtitle = "The most powerful platform to launch your next big idea. Fast, secure, and infinitely scalable.",
  primaryCtaText = "Get Started",
  primaryCtaLink = "#",
  secondaryCtaText = "Learn More",
  secondaryCtaLink = "#",
  alignment = "center",
  backgroundColor = "var(--color-bg-primary)",
  textColor = "var(--color-text-primary)",
}) => {
  const getAlignment = () => {
    switch (alignment) {
      case "left": return "flex-start";
      case "right": return "flex-end";
      default: return "center";
    }
  };

  const getTextAlign = () => {
    switch (alignment) {
      case "left": return "left";
      case "right": return "right";
      default: return "center";
    }
  };

  return (
    <section 
      style={{
        backgroundColor,
        color: textColor,
        padding: "var(--space-4xl) var(--space-xl)",
        display: "flex",
        flexDirection: "column",
        alignItems: getAlignment(),
        textAlign: getTextAlign(),
        minHeight: "60vh",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden"
      }}
    >
      {/* Premium Glow Effect */}
      <div 
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "80%",
          height: "80%",
          background: "radial-gradient(circle, rgba(99,102,241,0.15) 0%, rgba(0,0,0,0) 70%)",
          zIndex: 0,
          pointerEvents: "none"
        }} 
      />

      <div style={{ position: "relative", zIndex: 1, maxWidth: "800px", width: "100%" }}>
        <h1 
          style={{ 
            fontSize: "clamp(2.5rem, 5vw, 4.5rem)", 
            fontWeight: 800, 
            letterSpacing: "-0.03em",
            lineHeight: 1.1,
            marginBottom: "var(--space-lg)",
            background: "linear-gradient(to right, var(--color-text-primary), var(--color-text-secondary))",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent"
          }}
        >
          {title}
        </h1>
        
        <p 
          style={{ 
            fontSize: "clamp(1.125rem, 2vw, 1.5rem)", 
            color: "var(--color-text-secondary)",
            lineHeight: 1.5,
            marginBottom: "var(--space-2xl)",
            maxWidth: "600px",
            marginInline: alignment === "center" ? "auto" : "0"
          }}
        >
          {subtitle}
        </p>
        
        <div 
          style={{ 
            display: "flex", 
            gap: "var(--space-md)", 
            justifyContent: getAlignment(),
            flexWrap: "wrap"
          }}
        >
          {primaryCtaText && (
            <a 
              href={primaryCtaLink}
              style={{
                padding: "16px 32px",
                backgroundColor: "var(--color-accent-primary)",
                color: "#ffffff",
                borderRadius: "var(--radius-full)",
                fontWeight: 600,
                textDecoration: "none",
                transition: "all var(--transition-normal)",
                boxShadow: "0 10px 25px -5px rgba(99, 102, 241, 0.4)"
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.backgroundColor = "var(--color-accent-primary-hover)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.backgroundColor = "var(--color-accent-primary)";
              }}
            >
              {primaryCtaText}
            </a>
          )}
          
          {secondaryCtaText && (
            <a 
              href={secondaryCtaLink}
              style={{
                padding: "16px 32px",
                backgroundColor: "rgba(255, 255, 255, 0.05)",
                color: "var(--color-text-primary)",
                border: "1px solid var(--color-border-primary)",
                borderRadius: "var(--radius-full)",
                fontWeight: 600,
                textDecoration: "none",
                transition: "all var(--transition-normal)"
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.1)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.05)";
              }}
            >
              {secondaryCtaText}
            </a>
          )}
        </div>
      </div>
    </section>
  );
};
