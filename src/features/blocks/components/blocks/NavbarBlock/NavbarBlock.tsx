import React from "react";
import type { NavbarProps } from "@/types";

export const NavbarBlock: React.FC<NavbarProps> = ({
  logo_text = "WebPlatform",
  logo_image = "",
  links = [
    { label: "Home", url: "#" },
    { label: "Features", url: "#" },
    { label: "Pricing", url: "#" },
    { label: "Contact", url: "#" },
  ],
  cta_label = "Get Started",
  cta_url = "#",
  style = "transparent",
  bg_color = "var(--color-bg-primary)",
}) => {
  const isCentered = style === "centered";
  const isTransparent = style === "transparent";

  return (
    <nav
      style={{
        backgroundColor: isTransparent ? "transparent" : bg_color,
        color: "var(--color-text-primary)",
        padding: "var(--space-md) var(--space-xl)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottom: isTransparent ? "1px solid rgba(255,255,255,0.05)" : "1px solid var(--color-border-subtle)",
        width: "100%",
        position: "relative",
        zIndex: 10,
        flexDirection: isCentered ? "column" : "row",
        gap: isCentered ? "var(--space-md)" : "0"
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-sm)", fontWeight: 700, fontSize: "1.25rem" }}>
        {logo_image ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={logo_image} alt={logo_text} style={{ height: "32px" }} />
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
            {logo_text.charAt(0)}
          </div>
        )}
        <span>{logo_text}</span>
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

      {cta_label && (
        <a
          href={cta_url}
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
          {cta_label}
        </a>
      )}
    </nav>
  );
};
