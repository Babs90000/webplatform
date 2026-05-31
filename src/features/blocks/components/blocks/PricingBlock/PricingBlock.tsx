import React from "react";
import type { PricingProps } from "@/types";

const DEFAULT_PLANS: PricingProps["plans"] = [
  {
    name: "Starter",
    price_monthly: "0€",
    period: "/mois",
    description: "Parfait pour les projets personnels.",
    features: ["Jusqu'à 3 projets", "Composants de base", "Support communautaire", "1 Go de stockage"],
    cta_label: "Commencer",
    cta_url: "#",
  },
  {
    name: "Pro",
    price_monthly: "29€",
    period: "/mois",
    description: "Pour les créateurs professionnels.",
    features: ["Projets illimités", "Composants premium", "Support prioritaire", "10 Go de stockage", "Domaines personnalisés"],
    cta_label: "Passer au Pro",
    cta_url: "#",
    highlighted: true,
    badge: "Le plus populaire",
  },
  {
    name: "Entreprise",
    price_monthly: "99€",
    period: "/mois",
    description: "Pour les grandes équipes.",
    features: ["Tout le plan Pro", "Intégrations sur mesure", "Account manager dédié", "Stockage illimité", "SSO"],
    cta_label: "Contacter l'équipe",
    cta_url: "#",
  },
];

export const PricingBlock: React.FC<PricingProps> = ({
  title = "Une tarification simple et transparente",
  subtitle = "Choisissez l'offre qui vous convient.",
  plans = DEFAULT_PLANS,
}) => {
  return (
    <section style={{ backgroundColor: "var(--color-bg-primary)", padding: "var(--space-4xl) var(--space-xl)" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "var(--space-3xl)" }}>
          {title && <h2 style={{ fontSize: "2.5rem", fontWeight: 700, marginBottom: "var(--space-sm)", color: "var(--color-text-primary)" }}>{title}</h2>}
          {subtitle && <p style={{ fontSize: "1.125rem", color: "var(--color-text-secondary)" }}>{subtitle}</p>}
        </div>

        <div style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: "var(--space-xl)",
          alignItems: "center",
        }}>
          {plans.map((plan, i) => (
            <div
              key={i}
              style={{
                flex: "1 1 300px",
                maxWidth: "380px",
                padding: plan.highlighted ? "var(--space-3xl) var(--space-2xl)" : "var(--space-2xl)",
                background: plan.highlighted ? "var(--color-bg-primary)" : "var(--color-bg-elevated)",
                border: plan.highlighted ? "2px solid var(--color-accent-primary)" : "1px solid var(--color-border-subtle)",
                borderRadius: "var(--radius-xl)",
                position: "relative",
                boxShadow: plan.highlighted ? "var(--shadow-xl)" : "none",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {(plan.badge || plan.highlighted) && (
                <div style={{
                  position: "absolute",
                  top: 0,
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  background: "var(--color-accent-primary)",
                  color: "white",
                  padding: "4px 12px",
                  borderRadius: "var(--radius-full)",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}>
                  {plan.badge ?? "Le plus populaire"}
                </div>
              )}

              <h3 style={{ fontSize: "1.25rem", fontWeight: 600, color: "var(--color-text-primary)", marginBottom: "var(--space-xs)" }}>
                {plan.name}
              </h3>
              {plan.description && (
                <p style={{ color: "var(--color-text-tertiary)", fontSize: "0.875rem", marginBottom: "var(--space-lg)" }}>
                  {plan.description}
                </p>
              )}

              <div style={{ display: "flex", alignItems: "baseline", gap: "4px", marginBottom: "var(--space-2xl)" }}>
                <span style={{ fontSize: "3rem", fontWeight: 800, color: "var(--color-text-primary)", lineHeight: 1 }}>
                  {plan.price_monthly}
                </span>
                {plan.period && <span style={{ color: "var(--color-text-secondary)" }}>{plan.period}</span>}
              </div>

              <ul style={{ listStyle: "none", padding: 0, margin: "0 0 var(--space-2xl) 0", flexGrow: 1, display: "flex", flexDirection: "column", gap: "var(--space-md)" }}>
                {plan.features.map((feature, j) => (
                  <li key={j} style={{ display: "flex", alignItems: "flex-start", gap: "12px", color: "var(--color-text-secondary)" }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ color: "var(--color-accent-primary)", flexShrink: 0 }}>
                      <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <a
                href={plan.cta_url}
                style={{
                  display: "block",
                  textAlign: "center",
                  padding: "14px 24px",
                  background: plan.highlighted ? "var(--color-accent-primary)" : "var(--color-bg-tertiary)",
                  color: plan.highlighted ? "white" : "var(--color-text-primary)",
                  borderRadius: "var(--radius-md)",
                  fontWeight: 600,
                  textDecoration: "none",
                  transition: "background var(--transition-fast)",
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = plan.highlighted ? "var(--color-accent-primary-hover)" : "var(--color-border-subtle)";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = plan.highlighted ? "var(--color-accent-primary)" : "var(--color-bg-tertiary)";
                }}
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
