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
  background_color,
  style = "centered",
  badge_text,
}) => {
  const isSplit = style === "split";
  const isFullscreen = style === "fullscreen";

  return (
    <section 
      className={`relative w-full flex items-center overflow-hidden ${
        isFullscreen ? "min-h-screen px-4 md:px-8" : "min-h-[60vh] py-24 px-4 md:px-8"
      }`}
      style={{
        backgroundColor: background_color || "var(--color-bg-primary)",
        backgroundImage: background_image ? `url(${background_image})` : undefined,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Background Overlay if image exists */}
      {background_image && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-0" />
      )}

      {/* Premium Glow Effect for non-image backgrounds */}
      {!background_image && !isSplit && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-[radial-gradient(circle,rgba(99,102,241,0.15)_0%,transparent_70%)] z-0 pointer-events-none" />
      )}

      <div className={`relative z-10 container mx-auto flex flex-col ${isSplit ? "lg:flex-row items-center gap-12" : "items-center text-center"}`}>
        
        <div className={`flex flex-col ${isSplit ? "items-start text-left lg:w-1/2" : "items-center max-w-4xl"}`}>
          {badge_text && (
            <span className="inline-block px-4 py-1.5 mb-6 text-sm font-semibold text-primary bg-primary/10 border border-primary/20 rounded-full">
              {badge_text}
            </span>
          )}

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-foreground leading-[1.1] mb-6">
            {headline}
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-10 max-w-2xl">
            {subheadline}
          </p>
          
          <div className={`flex flex-wrap gap-4 ${isSplit ? "justify-start" : "justify-center"}`}>
            {cta_label && (
              <a 
                href={cta_url}
                className="inline-flex items-center justify-center h-12 px-8 font-medium text-primary-foreground bg-primary rounded-full transition-all hover:bg-primary/90 shadow-sm hover:shadow-md hover:-translate-y-0.5"
              >
                {cta_label}
              </a>
            )}
            
            {secondary_cta_label && (
              <a 
                href={secondary_cta_url || "#"}
                className="inline-flex items-center justify-center h-12 px-8 font-medium text-foreground bg-background border border-border rounded-full transition-all hover:bg-accent hover:text-accent-foreground"
              >
                {secondary_cta_label}
              </a>
            )}
          </div>
        </div>

        {/* Split layout placeholder image */}
        {isSplit && (
          <div className="w-full lg:w-1/2 min-h-[400px] flex items-center justify-center bg-card/50 backdrop-blur-md rounded-3xl border border-border shadow-2xl relative overflow-hidden">
             <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-transparent" />
             <svg className="w-16 h-16 text-muted-foreground relative z-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <circle cx="8.5" cy="8.5" r="1.5"></circle>
              <polyline points="21 15 16 10 5 21"></polyline>
            </svg>
          </div>
        )}
      </div>
    </section>
  );
};
