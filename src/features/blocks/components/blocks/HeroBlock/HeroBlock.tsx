import React from "react";
import type { HeroProps } from "@/types";

export const HeroBlock: React.FC<HeroProps> = ({
  headline = "Build something amazing",
  subheadline = "The most powerful platform to launch your next big idea. Fast, secure, and infinitely scalable.",
  cta_label = "Get Started",
  cta_url = "#",
  secondary_cta_label,
  secondary_cta_url,
  background_image,
  background_color = "transparent",
  style = "centered",
  badge_text,
}) => {
  const isSplit = style === "split";
  const isFullscreen = style === "fullscreen";

  return (
    <section 
      style={{
        backgroundColor: background_color,
        backgroundImage: background_image ? `url(${background_image})` : undefined,
        backgroundSize: "cover",
        backgroundPosition: "center",
        color: "var(--color-text-primary)",
        padding: isFullscreen ? "0 var(--space-xl)" : "var(--space-4xl) var(--space-xl)",
        display: "flex",
        flexDirection: isSplit ? "row" : "column",
        alignItems: "center",
        textAlign: isSplit ? "left" : "center",
        minHeight: isFullscreen ? "100vh" : "60vh",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
        gap: isSplit ? "var(--space-3xl)" : "0",
      }}
    >
      {/* Background Overlay if image exists */}
      {background_image && (
        <div style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(135deg, rgba(10,14,26,0.9) 0%, rgba(10,14,26,0.4) 100%)",
          zIndex: 0
        }} />
      )}

      {/* Premium Glow Effect for non-image backgrounds */}
      {!background_image && !isSplit && (
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
      )}

      <div style={{ 
        position: "relative", 
        zIndex: 1, 
        maxWidth: isSplit ? "50%" : "800px", 
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: isSplit ? "flex-start" : "center"
      }}>
        {badge_text && (
          <span style={{
            display: "inline-block",
            padding: "var(--space-xs) var(--space-md)",
            background: "rgba(99, 102, 241, 0.1)",
            color: "var(--color-accent-primary)",
            borderRadius: "var(--radius-full)",
            fontSize: "0.875rem",
            fontWeight: 600,
            marginBottom: "var(--space-md)",
            border: "1px solid rgba(99, 102, 241, 0.2)"
          }}>
            {badge_text}
          </span>
        )}

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
          {headline}
        </h1>
        
        <p 
          style={{ 
            fontSize: "clamp(1.125rem, 2vw, 1.5rem)", 
            color: "var(--color-text-secondary)",
            lineHeight: 1.5,
            marginBottom: "var(--space-2xl)",
            maxWidth: "600px",
          }}
        >
          {subheadline}
        </p>
        
        <div 
          style={{ 
            display: "flex", 
            gap: "var(--space-md)", 
            justifyContent: isSplit ? "flex-start" : "center",
            flexWrap: "wrap"
          }}
        >
          {cta_label && (
            <a 
              href={cta_url}
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
              {cta_label}
            </a>
          )}
          
          {secondary_cta_label && (
            <a 
              href={secondary_cta_url || "#"}
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
              {secondary_cta_label}
            </a>
          )}
        </div>
      </div>

      {/* Split layout placeholder image */}
      {isSplit && (
        <div style={{
          flex: 1,
          width: "100%",
          height: "400px",
          background: "var(--glass-bg)",
          backdropFilter: "blur(var(--glass-blur))",
          borderRadius: "var(--radius-xl)",
          border: "1px solid var(--glass-border)",
          position: "relative",
          zIndex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--color-text-tertiary)"
        }}>
          {/* Placeholder illustration */}
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <circle cx="8.5" cy="8.5" r="1.5"></circle>
            <polyline points="21 15 16 10 5 21"></polyline>
          </svg>
        </div>
      )}
    </section>
  );
};
