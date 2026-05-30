import React from "react";
import type { FooterProps } from "@/types";

export const FooterBlock: React.FC<FooterProps> = ({
  company_name = "WebPlatform",
  description = "Building the future of the web, one block at a time.",
  copyright = `© ${new Date().getFullYear()} WebPlatform. All rights reserved.`,
  social = [
    { platform: "Twitter", url: "#" },
    { platform: "GitHub", url: "#" },
  ],
  links = [],
  columns = [
    {
      title: "Product",
      links: [
        { label: "Features", url: "#" },
        { label: "Pricing", url: "#" }
      ]
    },
    {
      title: "Company",
      links: [
        { label: "About", url: "#" },
        { label: "Contact", url: "#" }
      ]
    }
  ],
  style = "columns",
}) => {
  const bgColor = "var(--color-bg-elevated)";

  return (
    <footer style={{ backgroundColor: bgColor, color: "var(--color-text-secondary)", padding: "var(--space-4xl) var(--space-xl) var(--space-xl)" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "var(--space-3xl)",
          marginBottom: "var(--space-4xl)"
        }}>
          {/* Brand Column */}
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "var(--space-sm)", marginBottom: "var(--space-md)" }}>
              <h3 style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--color-text-primary)", margin: 0 }}>
                {company_name}
              </h3>
            </div>
            {description && (
              <p style={{ lineHeight: 1.6, marginBottom: "var(--space-xl)" }}>
                {description}
              </p>
            )}
            
            {social && social.length > 0 && (
              <div style={{ display: "flex", gap: "var(--space-md)" }}>
                {social.map((socialLink, i) => (
                  <a
                    key={i}
                    href={socialLink.url}
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "50%",
                      background: "rgba(255,255,255,0.05)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "var(--color-text-primary)",
                      transition: "background var(--transition-fast)"
                    }}
                    onMouseOver={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
                    onMouseOut={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
                  >
                    {/* Placeholder Icon for Social */}
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="2" y1="12" x2="22" y2="12"></line>
                      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                    </svg>
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Links Columns */}
          {(style === "columns" ? columns : []).map((col, idx) => (
            <div key={idx} style={{ display: "flex", flexDirection: "column" }}>
              <h4 style={{ color: "var(--color-text-primary)", fontWeight: 600, marginBottom: "var(--space-lg)" }}>
                {col.title}
              </h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-sm)" }}>
                {col.links.map((link, i) => (
                  <a 
                    key={i} 
                    href={link.url}
                    style={{
                      color: "var(--color-text-secondary)",
                      textDecoration: "none",
                      transition: "color var(--transition-fast)",
                      width: "fit-content"
                    }}
                    onMouseOver={(e) => e.currentTarget.style.color = "var(--color-text-primary)"}
                    onMouseOut={(e) => e.currentTarget.style.color = "var(--color-text-secondary)"}
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div style={{ width: "100%", height: "1px", background: "var(--color-border-subtle)", marginBottom: "var(--space-xl)" }} />

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "var(--space-md)" }}>
          <p style={{ fontSize: "0.875rem", color: "var(--color-text-tertiary)" }}>
            {copyright}
          </p>
          {style === "simple" && links.length > 0 && (
            <div style={{ display: "flex", gap: "var(--space-md)", flexWrap: "wrap" }}>
              {links.map((link, i) => (
                <a key={i} href={link.url} style={{ color: "var(--color-text-secondary)", textDecoration: "none" }}>
                  {link.label}
                </a>
              ))}
            </div>
          )}
        </div>

      </div>
    </footer>
  );
};
