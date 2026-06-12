import React from "react";
import type { FooterProps } from "@/types";

const SOCIAL_ICONS: Record<string, React.ReactNode> = {
  Twitter: (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  ),
  Instagram: (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2}>
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  ),
  LinkedIn: (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  ),
  GitHub: (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
  ),
  Facebook: (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  ),
};

export const FooterBlock: React.FC<FooterProps> = ({
  company_name = "WebPlatform",
  description = "Créez des sites web magnifiques en quelques minutes grâce à notre IA.",
  copyright,
  social = [
    { platform: "Twitter", url: "#" },
    { platform: "GitHub", url: "#" },
    { platform: "LinkedIn", url: "#" },
  ],
  links = [],
  columns = [
    {
      title: "Produit",
      links: [
        { label: "Fonctionnalités", url: "#" },
        { label: "Tarifs", url: "#" },
        { label: "Changelog", url: "#" },
      ],
    },
    {
      title: "Entreprise",
      links: [
        { label: "À propos", url: "#" },
        { label: "Blog", url: "#" },
        { label: "Contact", url: "#" },
      ],
    },
  ],
  style = "columns",
}) => {
  const year = new Date().getFullYear();
  const copyrightText = copyright ?? `© ${year} ${company_name}. Tous droits réservés.`;

  return (
    <footer className="w-full bg-card border-t border-border text-muted-foreground">
      <div className="container mx-auto px-4 md:px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand column */}
          <div className="lg:col-span-1">
            <h3 className="text-foreground font-bold text-xl mb-3">{company_name}</h3>
            {description && (
              <p className="text-sm leading-relaxed mb-6 max-w-xs">{description}</p>
            )}
            {social && social.length > 0 && (
              <div className="flex gap-3">
                {social.map((s, i) => (
                  <a
                    key={i}
                    href={s.url}
                    className="w-9 h-9 rounded-lg bg-background border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all no-underline"
                    aria-label={s.platform}
                  >
                    {SOCIAL_ICONS[s.platform] ?? (
                      <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2}>
                        <circle cx="12" cy="12" r="10" />
                        <line x1="2" y1="12" x2="22" y2="12" />
                        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                      </svg>
                    )}
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Link columns */}
          {(style === "columns" ? columns ?? [] : []).map((col, idx) => (
            <div key={idx}>
              <h4 className="text-foreground font-semibold text-sm uppercase tracking-wider mb-5">
                {col.title}
              </h4>
              <div className="flex flex-col gap-3">
                {col.links.map((link, i) => (
                  <a
                    key={i}
                    href={link.url}
                    className="text-sm hover:text-foreground transition-colors no-underline"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-border pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs">{copyrightText}</p>
          {style === "simple" && links.length > 0 && (
            <div className="flex gap-6 flex-wrap">
              {links.map((link, i) => (
                <a
                  key={i}
                  href={link.url}
                  className="text-xs hover:text-foreground transition-colors no-underline"
                >
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
