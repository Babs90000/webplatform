import React from "react";

export interface GalleryBlockProps {
  title?: string;
  subtitle?: string;
  images?: Array<{ url: string; alt: string }>;
  columns?: 2 | 3 | 4;
  gap?: "small" | "medium" | "large";
  backgroundColor?: string;
}

export const GalleryBlock: React.FC<GalleryBlockProps> = ({
  title = "Our Work",
  subtitle = "A collection of our recent projects.",
  images = [
    { url: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=600", alt: "Project 1" },
    { url: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&q=80&w=600", alt: "Project 2" },
    { url: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=600", alt: "Project 3" },
    { url: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=600", alt: "Project 4" },
    { url: "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?auto=format&fit=crop&q=80&w=600", alt: "Project 5" },
    { url: "https://images.unsplash.com/photo-1526948128573-703ee1aeb6fa?auto=format&fit=crop&q=80&w=600", alt: "Project 6" },
  ],
  columns = 3,
  gap = "medium",
  backgroundColor = "transparent",
}) => {
  const getGap = () => {
    switch (gap) {
      case "small": return "var(--space-sm)";
      case "large": return "var(--space-xl)";
      default: return "var(--space-md)";
    }
  };

  return (
    <section style={{ backgroundColor, padding: "var(--space-4xl) var(--space-xl)" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {(title || subtitle) && (
          <div style={{ textAlign: "center", marginBottom: "var(--space-3xl)" }}>
            {title && (
              <h2 style={{ fontSize: "2.5rem", fontWeight: 700, marginBottom: "var(--space-sm)", color: "var(--color-text-primary)" }}>
                {title}
              </h2>
            )}
            {subtitle && (
              <p style={{ fontSize: "1.125rem", color: "var(--color-text-secondary)" }}>
                {subtitle}
              </p>
            )}
          </div>
        )}

        <div style={{
          display: "grid",
          gridTemplateColumns: `repeat(auto-fit, minmax(min(100%, ${100 / columns - 5}%), 1fr))`,
          gap: getGap(),
        }}>
          {images.map((img, i) => (
            <div 
              key={i}
              style={{
                borderRadius: "var(--radius-lg)",
                overflow: "hidden",
                position: "relative",
                aspectRatio: "1/1",
                cursor: "pointer"
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={img.url} 
                alt={img.alt} 
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  transition: "transform 0.5s ease"
                }}
                onMouseOver={(e) => e.currentTarget.style.transform = "scale(1.05)"}
                onMouseOut={(e) => e.currentTarget.style.transform = "scale(1)"}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
