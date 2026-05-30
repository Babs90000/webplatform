import React from "react";
import type { TestimonialsProps } from "@/types";

export const TestimonialsBlock: React.FC<TestimonialsProps> = ({
  title = "Loved by builders",
  subtitle = "Don't just take our word for it.",
  items = [
    {
      quote: "This platform has completely transformed how our team ships products. It's incredibly intuitive and blazingly fast.",
      author: "Sarah Jenkins",
      role: "CTO @ TechCorp",
      avatar: "https://i.pravatar.cc/150?img=1",
      rating: 5
    },
    {
      quote: "The design tools are top-notch. I can build premium layouts in minutes instead of days. Highly recommended.",
      author: "Marcus Chen",
      role: "Lead Designer",
      avatar: "https://i.pravatar.cc/150?img=11",
      rating: 5
    },
    {
      quote: "We've seen a 40% increase in conversion rates since switching. The performance gains are real.",
      author: "Emma Watson",
      role: "Marketing Director",
      avatar: "https://i.pravatar.cc/150?img=5",
      rating: 4
    }
  ],
  layout = "grid",
}) => {
  const isLarge = layout === "quote-large";
  
  return (
    <section style={{ backgroundColor: "var(--color-bg-primary)", color: "var(--color-text-primary)", padding: "var(--space-4xl) var(--space-xl)" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "var(--space-3xl)" }}>
          {title && <h2 style={{ fontSize: "2.5rem", fontWeight: 700, marginBottom: "var(--space-sm)" }}>{title}</h2>}
          {subtitle && <p style={{ fontSize: "1.125rem", color: "var(--color-text-secondary)" }}>{subtitle}</p>}
        </div>

        <div style={{
          display: isLarge ? "flex" : "grid",
          flexDirection: "column",
          alignItems: "center",
          gridTemplateColumns: isLarge ? "1fr" : "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "var(--space-xl)",
        }}>
          {items.map((t, i) => (
            <div 
              key={i}
              style={{
                padding: isLarge ? "var(--space-3xl)" : "var(--space-2xl)",
                maxWidth: isLarge ? "800px" : "100%",
                background: "var(--glass-bg)",
                backdropFilter: "blur(var(--glass-blur))",
                border: "1px solid var(--glass-border)",
                borderRadius: "var(--radius-xl)",
                display: "flex",
                flexDirection: "column",
                alignItems: isLarge ? "center" : "flex-start",
                textAlign: isLarge ? "center" : "left",
                position: "relative",
                transition: "transform var(--transition-normal)",
                boxShadow: "var(--shadow-md)"
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              {/* Quote mark icon */}
              <svg 
                style={{ position: "absolute", top: "24px", right: "24px", opacity: 0.1, color: "var(--color-accent-primary)" }}
                width={isLarge ? "60" : "40"} height={isLarge ? "60" : "40"} viewBox="0 0 24 24" fill="currentColor"
              >
                <path d="M14.017 21L16.41 14.42C16.634 13.827 16.758 13.256 16.782 12.707C16.818 12.012 16.671 11.455 16.342 11.036C16.012 10.617 15.485 10.408 14.761 10.408H14.017V4H20.017C20.675 4 21.213 4.214 21.629 4.643C22.057 5.071 22.271 5.756 22.271 6.697C22.271 7.221 22.181 7.822 22.001 8.501L19.244 21H14.017ZM3.017 21L5.41 14.42C5.634 13.827 5.758 13.256 5.782 12.707C5.818 12.012 5.671 11.455 5.342 11.036C5.012 10.617 4.485 10.408 3.761 10.408H3.017V4H9.017C9.675 4 10.213 4.214 10.629 4.643C11.057 5.071 11.271 5.756 11.271 6.697C11.271 7.221 11.181 7.822 11.001 8.501L8.244 21H3.017Z" />
              </svg>
              
              <p style={{ 
                fontSize: isLarge ? "1.5rem" : "1.125rem", 
                lineHeight: 1.6, 
                marginBottom: "var(--space-xl)", 
                flexGrow: 1, 
                zIndex: 1,
                color: "var(--color-text-primary)"
              }}>
                &ldquo;{t.quote}&rdquo;
              </p>
              
              <div style={{ 
                display: "flex", 
                alignItems: "center", 
                gap: "var(--space-md)", 
                zIndex: 1,
                flexDirection: isLarge ? "column" : "row"
              }}>
                {t.avatar ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={t.avatar} alt={t.author} style={{ width: "48px", height: "48px", borderRadius: "50%", objectFit: "cover" }} />
                ) : (
                  <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "var(--color-bg-tertiary)" }} />
                )}
                <div>
                  <div style={{ fontWeight: 600, fontSize: "1rem" }}>{t.author}</div>
                  {(t.role || t.company) && (
                    <div style={{ fontSize: "0.875rem", color: "var(--color-text-tertiary)" }}>
                      {t.role}{t.role && t.company ? ` @ ${t.company}` : t.company}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
