import React from "react";

export interface CTABlockProps {
  title?: string;
  subtitle?: string;
  buttonText?: string;
  buttonLink?: string;
  backgroundColor?: string;
  textColor?: string;
}

export const CTABlock: React.FC<CTABlockProps> = ({
  title = "Ready to get started?",
  subtitle = "Join thousands of users building the future of the web.",
  buttonText = "Start for free",
  buttonLink = "#",
  backgroundColor = "var(--color-bg-primary)",
  textColor = "var(--color-text-primary)",
}) => {
  return (
    <section style={{ backgroundColor, padding: "var(--space-4xl) var(--space-xl)", color: textColor }}>
      <div style={{
        maxWidth: "1000px",
        margin: "0 auto",
        padding: "var(--space-4xl) var(--space-2xl)",
        background: "linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(168, 85, 247, 0.1))",
        borderRadius: "var(--radius-2xl)",
        border: "1px solid rgba(255,255,255,0.05)",
        textAlign: "center",
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
        position: "relative",
        overflow: "hidden"
      }}>
        {/* Glow effect */}
        <div style={{
          position: "absolute",
          top: "-50%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "100%",
          height: "100%",
          background: "radial-gradient(ellipse at top, rgba(99, 102, 241, 0.2) 0%, transparent 70%)",
          pointerEvents: "none"
        }} />

        <div style={{ position: "relative", zIndex: 1 }}>
          <h2 style={{ fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 800, marginBottom: "var(--space-md)", letterSpacing: "-0.02em" }}>
            {title}
          </h2>
          <p style={{ fontSize: "1.25rem", color: "var(--color-text-secondary)", marginBottom: "var(--space-2xl)", maxWidth: "600px", marginInline: "auto" }}>
            {subtitle}
          </p>
          
          <a
            href={buttonLink}
            style={{
              display: "inline-block",
              padding: "18px 40px",
              backgroundColor: "var(--color-text-primary)",
              color: "var(--color-bg-primary)",
              borderRadius: "var(--radius-full)",
              fontWeight: 700,
              fontSize: "1.125rem",
              textDecoration: "none",
              transition: "transform var(--transition-fast), box-shadow var(--transition-fast)",
              boxShadow: "0 10px 25px -5px rgba(255, 255, 255, 0.2)"
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 20px 25px -5px rgba(255, 255, 255, 0.3)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 10px 25px -5px rgba(255, 255, 255, 0.2)";
            }}
          >
            {buttonText}
          </a>
        </div>
      </div>
    </section>
  );
};
