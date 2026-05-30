import React from "react";

export interface FooterBlockProps {
  logoText?: string;
  description?: string;
  copyright?: string;
  links?: Array<{ label: string; url: string }>;
  backgroundColor?: string;
  textColor?: string;
}

export const FooterBlock: React.FC<FooterBlockProps> = ({
  logoText = "WebPlatform",
  description = "Building the future of the web, one block at a time.",
  copyright = `© ${new Date().getFullYear()} WebPlatform. All rights reserved.`,
  links = [
    { label: "Privacy Policy", url: "#" },
    { label: "Terms of Service", url: "#" },
    { label: "Twitter", url: "#" },
    { label: "GitHub", url: "#" },
  ],
  backgroundColor = "var(--color-bg-elevated)",
  textColor = "var(--color-text-secondary)",
}) => {
  return (
    <footer style={{ backgroundColor, color: textColor, padding: "var(--space-4xl) var(--space-xl) var(--space-xl)" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
        
        <h3 style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--color-text-primary)", marginBottom: "var(--space-md)" }}>
          {logoText}
        </h3>
        
        {description && (
          <p style={{ maxWidth: "400px", marginBottom: "var(--space-3xl)" }}>
            {description}
          </p>
        )}

        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "var(--space-xl)", marginBottom: "var(--space-3xl)" }}>
          {links.map((link, i) => (
            <a 
              key={i} 
              href={link.url}
              style={{
                color: "var(--color-text-secondary)",
                textDecoration: "none",
                fontWeight: 500,
                transition: "color var(--transition-fast)"
              }}
              onMouseOver={(e) => e.currentTarget.style.color = "var(--color-text-primary)"}
              onMouseOut={(e) => e.currentTarget.style.color = "var(--color-text-secondary)"}
            >
              {link.label}
            </a>
          ))}
        </div>

        <div style={{ width: "100%", height: "1px", background: "var(--color-border-subtle)", marginBottom: "var(--space-xl)" }} />

        <p style={{ fontSize: "0.875rem", color: "var(--color-text-tertiary)" }}>
          {copyright}
        </p>

      </div>
    </footer>
  );
};
