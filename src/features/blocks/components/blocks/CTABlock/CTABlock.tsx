import React from "react";
import type { CtaProps } from "@/types";

export const CTABlock: React.FC<CtaProps> = ({
  headline = "Prêt à passer à la vitesse supérieure ?",
  subtext = "Rejoignez des milliers d'utilisateurs qui construisent leur avenir en ligne.",
  button_label = "Commencer gratuitement",
  button_url = "#",
  secondary_button_label,
  secondary_button_url,
  variant = "gradient",
}) => {
  const isGradient = variant === "gradient" || !variant;

  return (
    <section className="w-full py-16 px-4 md:px-6 bg-background">
      <div className="container mx-auto">
        <div
          className={`relative overflow-hidden rounded-3xl px-8 py-20 md:px-16 text-center ${
            isGradient
              ? "bg-gradient-to-br from-primary via-primary/90 to-purple-600"
              : "bg-card border border-border"
          }`}
        >
          {/* Background orb */}
          {isGradient && (
            <>
              <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-purple-400/20 rounded-full blur-3xl pointer-events-none" />
            </>
          )}

          <div className="relative z-10">
            <h2
              className={`text-3xl md:text-5xl font-extrabold tracking-tight mb-6 ${
                isGradient ? "text-white" : "text-foreground"
              }`}
            >
              {headline}
            </h2>

            {subtext && (
              <p
                className={`text-lg md:text-xl mb-10 max-w-xl mx-auto leading-relaxed ${
                  isGradient ? "text-white/80" : "text-muted-foreground"
                }`}
              >
                {subtext}
              </p>
            )}

            <div className="flex flex-wrap items-center justify-center gap-4">
              <a
                href={button_url}
                className={`inline-flex items-center h-12 px-8 font-semibold rounded-full transition-all hover:-translate-y-0.5 no-underline ${
                  isGradient
                    ? "bg-white text-primary hover:bg-white/90 shadow-lg"
                    : "bg-primary text-primary-foreground hover:bg-primary/90"
                }`}
              >
                {button_label}
              </a>

              {secondary_button_label && secondary_button_url && (
                <a
                  href={secondary_button_url}
                  className={`inline-flex items-center h-12 px-8 font-semibold rounded-full border transition-all hover:-translate-y-0.5 no-underline ${
                    isGradient
                      ? "border-white/30 text-white hover:bg-white/10"
                      : "border-border text-foreground hover:bg-accent"
                  }`}
                >
                  {secondary_button_label}
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
