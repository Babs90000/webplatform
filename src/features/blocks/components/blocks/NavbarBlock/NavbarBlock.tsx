import React from "react";

export interface NavbarBlockProps {
  logoText?: string;
  logoImageUrl?: string;
  links?: Array<{ label: string; url: string }>;
  ctaText?: string;
  ctaLink?: string;
  backgroundColor?: string;
  textColor?: string;
}

export const NavbarBlock: React.FC<NavbarBlockProps> = ({
  logoText = "WebPlatform",
  logoImageUrl = "",
  links = [
    { label: "Home", url: "#" },
    { label: "Features", url: "#" },
    { label: "Pricing", url: "#" },
    { label: "Contact", url: "#" },
  ],
  ctaText = "Get Started",
  ctaLink = "#",
  backgroundColor = "transparent",
  textColor = "var(--color-text-primary)",
}) => {
  return (
    <nav
      style={{
        backgroundColor,
        color: textColor,
        padding: "var(--space-md) var(--space-xl)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottom: backgroundColor === "transparent" ? "1px solid rgba(255,255,255,0.05)" : "none",
        width: "100%",
        position: "relative",
        zIndex: 10
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-sm)", fontWeight: 700, fontSize: "1.25rem" }}>
        {logoImageUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={logoImageUrl} alt={logoText} style={{ height: "32px" }} />
        ) : (
          <div style={{
            width: "32px",
            height: "32px",
            background: "linear-gradient(135deg, var(--color-accent-primary), #a855f7)",
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontSize: "1rem"
          }}>
            {logoText.charAt(0)}
          </div>
        )}
        <span>{logoText}</span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-xl)" }}>
        {links.map((link, i) => (
          <a
            key={i}
            href={link.url}
            style={{
              textDecoration: "none",
              color: "var(--color-text-secondary)",
              fontWeight: 500,
              fontSize: "0.9375rem",
              transition: "color var(--transition-fast)"
            }}
            onMouseOver={(e) => e.currentTarget.style.color = "var(--color-text-primary)"}
            onMouseOut={(e) => e.currentTarget.style.color = "var(--color-text-secondary)"}
          >
            {link.label}
          </a>
        ))}
      </div>

      {ctaText && (
        <a
          href={ctaLink}
          style={{
            padding: "10px 20px",
            backgroundColor: "var(--color-text-primary)",
            color: "var(--color-bg-primary)",
            borderRadius: "var(--radius-full)",
            fontWeight: 600,
            fontSize: "0.875rem",
            textDecoration: "none",
            transition: "transform var(--transition-fast)"
          }}
          onMouseOver={(e) => e.currentTarget.style.transform = "scale(1.05)"}
          onMouseOut={(e) => e.currentTarget.style.transform = "scale(1)"}
        >
          {ctaText}
        </a>
      )}
    </nav>
  );
};
