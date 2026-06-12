import React from "react";
import type { PricingProps } from "@/types";

const CheckIcon = () => (
  <svg className="w-4 h-4 shrink-0 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 6L9 17L4 12" />
  </svg>
);

const DEFAULT_PLANS: PricingProps["plans"] = [
  {
    name: "Starter",
    price_monthly: "0€",
    period: "/mois",
    description: "Parfait pour démarrer un projet personnel.",
    features: ["Jusqu'à 3 projets", "Composants essentiels", "Support communautaire", "1 Go de stockage"],
    cta_label: "Commencer gratuitement",
    cta_url: "#",
  },
  {
    name: "Pro",
    price_monthly: "29€",
    period: "/mois",
    description: "Pour les créateurs et les indépendants.",
    features: ["Projets illimités", "Composants premium", "Support prioritaire 24h", "10 Go de stockage", "Domaines personnalisés", "Analyses avancées"],
    cta_label: "Démarrer l'essai gratuit",
    cta_url: "#",
    highlighted: true,
    badge: "Le plus populaire",
  },
  {
    name: "Entreprise",
    price_monthly: "99€",
    period: "/mois",
    description: "Pour les équipes et les grandes organisations.",
    features: ["Tout le plan Pro", "Intégrations sur mesure", "Account manager dédié", "Stockage illimité", "SSO / SAML", "SLA garanti"],
    cta_label: "Contacter l'équipe commerciale",
    cta_url: "#",
  },
];

export const PricingBlock: React.FC<PricingProps> = ({
  title = "Une tarification simple et transparente",
  subtitle = "Commencez gratuitement, évoluez selon vos besoins. Aucune carte bancaire requise.",
  plans = DEFAULT_PLANS,
}) => {
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

        {/* Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {plans.map((plan, i) => (
            <div
              key={i}
              className={`relative flex flex-col rounded-2xl p-8 transition-all ${
                plan.highlighted
                  ? "bg-primary text-primary-foreground ring-2 ring-primary shadow-2xl scale-[1.02]"
                  : "bg-card border border-border hover:border-primary/30 hover:shadow-lg"
              }`}
            >
              {/* Badge */}
              {(plan.badge || plan.highlighted) && (
                <div className={`absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                  plan.highlighted
                    ? "bg-white text-primary"
                    : "bg-primary text-primary-foreground"
                }`}>
                  {plan.badge ?? "Le plus populaire"}
                </div>
              )}

              {/* Plan name */}
              <h3 className={`text-lg font-semibold mb-1 ${plan.highlighted ? "text-primary-foreground" : "text-foreground"}`}>
                {plan.name}
              </h3>
              {plan.description && (
                <p className={`text-sm mb-6 ${plan.highlighted ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                  {plan.description}
                </p>
              )}

              {/* Price */}
              <div className="flex items-baseline gap-1 mb-8">
                <span className={`text-5xl font-extrabold ${plan.highlighted ? "text-primary-foreground" : "text-foreground"}`}>
                  {plan.price_monthly}
                </span>
                {plan.period && (
                  <span className={`text-sm ${plan.highlighted ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                    {plan.period}
                  </span>
                )}
              </div>

              {/* Features */}
              <ul className="flex flex-col gap-3 mb-10 flex-grow">
                {plan.features.map((feature, j) => (
                  <li key={j} className="flex items-center gap-3 text-sm">
                    {plan.highlighted ? (
                      <svg className="w-4 h-4 shrink-0 text-primary-foreground/80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 6L9 17L4 12" />
                      </svg>
                    ) : (
                      <CheckIcon />
                    )}
                    <span className={plan.highlighted ? "text-primary-foreground/90" : "text-muted-foreground"}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <a
                href={plan.cta_url}
                className={`block text-center py-3 px-6 rounded-xl font-semibold transition-all no-underline ${
                  plan.highlighted
                    ? "bg-white text-primary hover:bg-white/90"
                    : "bg-primary text-primary-foreground hover:bg-primary/90"
                }`}
              >
                {plan.cta_label}
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
