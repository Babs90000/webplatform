import React from "react";
import type { FeaturesProps } from "@/types";

export const FeaturesBlock: React.FC<FeaturesProps> = ({
  title = "Why Choose Us",
  subtitle = "Discover the features that make our platform stand out.",
  items = [
    { title: "Lightning Fast", description: "Optimized for speed and performance right out of the box." },
    { title: "Secure by Design", description: "Enterprise-grade security features built into the core." },
    { title: "Infinitely Scalable", description: "Grows with your business without breaking a sweat." },
  ],
  layout = "grid-3",
  bg_color,
}) => {
  const getGridClasses = () => {
    switch (layout) {
      case "grid-2": return "grid-cols-1 md:grid-cols-2";
      case "grid-3": return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";
      case "grid-4": return "grid-cols-1 md:grid-cols-2 lg:grid-cols-4";
      case "list": return "grid-cols-1 max-w-3xl mx-auto";
      case "alternating": return "grid-cols-1 max-w-5xl mx-auto";
      default: return "grid-cols-1 md:grid-cols-3";
    }
  };

  const isAlternating = layout === "alternating";

  return (
    <section 
      className="w-full py-24 px-4 md:px-8"
      style={{ backgroundColor: bg_color || "var(--color-bg-secondary)" }}
    >
      <div className="container mx-auto">
        <div className="max-w-3xl mx-auto text-center mb-16">
          {title && (
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-foreground mb-4">
              {title}
            </h2>
          )}
          {subtitle && (
            <p className="text-lg md:text-xl text-muted-foreground">
              {subtitle}
            </p>
          )}
        </div>

        <div className={`grid gap-8 ${getGridClasses()}`}>
          {items.map((item, i) => {
            const isEven = i % 2 === 0;

            if (isAlternating) {
              return (
                <div key={i} className={`flex flex-col gap-8 md:gap-16 items-center ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                  <div className="w-full md:w-1/2 min-h-[300px] flex items-center justify-center bg-card/50 backdrop-blur-md rounded-3xl border border-border shadow-sm relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-transparent" />
                    <svg className="w-12 h-12 text-muted-foreground relative z-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                      <circle cx="8.5" cy="8.5" r="1.5"></circle>
                      <polyline points="21 15 16 10 5 21"></polyline>
                    </svg>
                  </div>
                  <div className="w-full md:w-1/2 space-y-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-xl">
                      {item.icon ? (
                        <span>{item.icon}</span>
                      ) : (
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
                          <polyline points="2 17 12 22 22 17"></polyline>
                          <polyline points="2 12 12 17 22 12"></polyline>
                        </svg>
                      )}
                    </div>
                    <h3 className="text-2xl font-semibold text-foreground tracking-tight">
                      {item.title}
                    </h3>
                    <p className="text-lg text-muted-foreground leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              );
            }

            return (
              <div 
                key={i}
                className="group flex flex-col p-8 bg-card border border-border rounded-2xl transition-all hover:shadow-lg hover:-translate-y-1 hover:border-primary/30"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-xl mb-6 transition-transform group-hover:scale-110">
                  {item.icon ? (
                    <span>{item.icon}</span>
                  ) : (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
                      <polyline points="2 17 12 22 22 17"></polyline>
                      <polyline points="2 12 12 17 22 12"></polyline>
                    </svg>
                  )}
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3 tracking-tight">
                  {item.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed flex-grow">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
