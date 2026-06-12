import React, { useEffect, useState } from "react";
import type { NavbarProps } from "@/types";

export const NavbarBlock: React.FC<NavbarProps> = ({
  logo_text = "WebPlatform",
  logo_image = "",
  links = [
    { label: "Accueil", url: "#" },
    { label: "Fonctionnalités", url: "#" },
    { label: "Tarifs", url: "#" },
    { label: "Contact", url: "#" },
  ],
  cta_label = "Commencer",
  cta_url = "#",
  style = "transparent",
  bg_color,
}) => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isTransparent = style === "transparent";

  return (
    <nav
      className={`w-full z-50 transition-all duration-300 ${
        scrolled || !isTransparent
          ? "sticky top-0 bg-background/80 backdrop-blur-md border-b border-border shadow-sm"
          : "relative bg-transparent"
      }`}
      style={!isTransparent && bg_color ? { backgroundColor: bg_color } : undefined}
    >
      <div className="container mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <a href="#" className="flex items-center gap-2.5 font-bold text-lg text-foreground no-underline shrink-0">
          {logo_image ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={logo_image} alt={logo_text} className="h-8 w-auto" />
          ) : (
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center text-white text-sm font-bold shrink-0">
              {logo_text.charAt(0).toUpperCase()}
            </div>
          )}
          <span>{logo_text}</span>
        </a>

        {/* Nav links — desktop */}
        <div className="hidden md:flex items-center gap-6">
          {links.map((link, i) => (
            <a
              key={i}
              href={link.url}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors no-underline"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* CTA */}
        {cta_label && (
          <a
            href={cta_url}
            className="hidden md:inline-flex items-center h-9 px-5 text-sm font-semibold text-primary-foreground bg-primary rounded-full hover:bg-primary/90 transition-all hover:-translate-y-0.5 shadow-sm no-underline"
          >
            {cta_label}
          </a>
        )}

        {/* Mobile menu icon */}
        <button className="md:hidden flex flex-col gap-1.5 p-2 rounded-md hover:bg-accent">
          <span className="w-5 h-0.5 bg-foreground rounded" />
          <span className="w-5 h-0.5 bg-foreground rounded" />
          <span className="w-4 h-0.5 bg-foreground rounded" />
        </button>
      </div>
    </nav>
  );
};
