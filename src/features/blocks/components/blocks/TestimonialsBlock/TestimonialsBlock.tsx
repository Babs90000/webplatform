import React from "react";
import type { TestimonialsProps } from "@/types";

const StarRating: React.FC<{ rating?: number }> = ({ rating = 5 }) => (
  <div className="flex gap-0.5 mb-4">
    {Array.from({ length: 5 }, (_, i) => (
      <svg
        key={i}
        className={`w-4 h-4 ${i < rating ? "text-yellow-400" : "text-muted"}`}
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ))}
  </div>
);

export const TestimonialsBlock: React.FC<TestimonialsProps> = ({
  title = "Ce que disent nos clients",
  subtitle = "Des résultats concrets, des clients satisfaits.",
  items = [
    {
      quote: "Cette plateforme a complètement transformé notre façon de travailler. Résultats bluffants dès la première semaine.",
      author: "Sophie Martin",
      role: "Directrice Marketing",
      company: "BrandCo",
      avatar: "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150",
      rating: 5,
    },
    {
      quote: "Un outil indispensable. En quelques clics, j'ai un site professionnel que mes clients adorent.",
      author: "Thomas Dubois",
      role: "Fondateur",
      company: "Agence Pixel",
      avatar: "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150",
      rating: 5,
    },
    {
      quote: "Le design généré est impressionnant. On a gagné des semaines de développement et nos conversions ont bondi de 35%.",
      author: "Léa Rousseau",
      role: "CEO",
      company: "GrowthLab",
      avatar: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150",
      rating: 5,
    },
  ],
  layout = "grid",
}) => {
  const isLarge = layout === "quote-large";

  return (
    <section className="w-full py-24 px-4 md:px-6 bg-background">
      <div className="container mx-auto">
        {/* Header */}
        <div className="max-w-2xl mx-auto text-center mb-16">
          {title && (
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-foreground mb-4">
              {title}
            </h2>
          )}
          {subtitle && (
            <p className="text-lg text-muted-foreground">{subtitle}</p>
          )}
        </div>

        {/* Cards */}
        <div className={`grid gap-6 ${
          isLarge
            ? "grid-cols-1 max-w-3xl mx-auto"
            : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
        }`}>
          {items.map((t, i) => (
            <div
              key={i}
              className="group flex flex-col p-8 bg-card border border-border rounded-2xl transition-all hover:shadow-lg hover:-translate-y-1 hover:border-primary/20"
            >
              {/* Stars */}
              <StarRating rating={t.rating} />

              {/* Quote */}
              <p className={`text-foreground leading-relaxed flex-grow mb-8 ${isLarge ? "text-xl" : "text-base"}`}>
                &ldquo;{t.quote}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center gap-4">
                {t.avatar ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={t.avatar}
                    alt={t.author}
                    className="w-12 h-12 rounded-full object-cover ring-2 ring-border"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-lg">
                    {t.author.charAt(0)}
                  </div>
                )}
                <div>
                  <div className="font-semibold text-foreground">{t.author}</div>
                  {(t.role || t.company) && (
                    <div className="text-sm text-muted-foreground">
                      {t.role}
                      {t.role && t.company ? ` · ${t.company}` : t.company}
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
