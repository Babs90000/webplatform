import React from "react";
import type { CtaProps } from "@/types";

export const CTABlock: React.FC<CtaProps> = ({
  headline = "Ready to get started?",
  subtext = "Join thousands of users building the future of the web.",
  button_label = "Start for free",
  button_url = "#",
  secondary_button_label,
  secondary_button_url,
  bg_color = "var(--color-bg-primary)",
  style = "card",
}) => {
  const isBanner = style === "banner";
  const isFullWidth = style === "full-width";

  return (
    <section
      style={{
        backgroundColor: bg_color,
        padding: isFullWidth ? "var(--space-4xl) 0" : "var(--space-4xl) var(--space-xl)",
        color: "var(--color-text-primary)",
      }}
    >
      <div
        style={{
          maxWidth: isFullWidth ? "100%" : "1000px",
          margin: "0 auto",
          padding: isBanner ? "var(--space-2xl)" : "var(--space-4xl) var(--space-2xl)",
          background: isBanner
            ? "var(--gradient-primary)"
            : "linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(168, 85, 247, 0.1))",
          borderRadius: isBanner ? 0 : "var(--radius-2xl)",
          border: isBanner ? "none" : "1px solid rgba(255,255,255,0.05)",
          textAlign: "center",
          boxShadow: isBanner ? "none" : "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "-50%",
            left: "50%",
            transform: "translateX(-50%)",
            width: "100%",
            height: "100%",
            background:
              "radial-gradient(ellipse at top, rgba(99, 102, 241, 0.2) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />

        <div style={{ position: "relative", zIndex: 1 }}>
          <h2
            style={{
              fontSize: "clamp(2rem, 4vw, 3rem)",
              fontWeight: 800,
              marginBottom: "var(--space-md)",
              letterSpacing: "-0.02em",
            }}
          >
            {headline}
          </h2>
          {subtext && (
            <p
              style={{
                fontSize: "1.25rem",
                color: "var(--color-text-secondary)",
                marginBottom: "var(--space-2xl)",
                maxWidth: "600px",
                marginInline: "auto",
              }}
            >
              {subtext}
            </p>
          )}

          <div
            style={{
              display: "flex",
              gap: "var(--space-md)",
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <a
              href={button_url}
              style={{
                display: "inline-block",
                padding: "18px 40px",
                backgroundColor: "var(--color-text-primary)",
                color: "var(--color-bg-primary)",
                borderRadius: "var(--radius-full)",
                fontWeight: 700,
                fontSize: "1.125rem",
                textDecoration: "none",
              }}
            >
              {button_label}
            </a>
            {secondary_button_label && secondary_button_url && (
              <a
                href={secondary_button_url}
                style={{
                  display: "inline-block",
                  padding: "18px 40px",
                  border: "1px solid var(--color-border-primary)",
                  borderRadius: "var(--radius-full)",
                  fontWeight: 600,
                  fontSize: "1.125rem",
                  textDecoration: "none",
                  color: "var(--color-text-primary)",
                }}
              >
                {secondary_button_label}
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
