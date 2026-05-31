/** Traduit les erreurs API auth en messages utilisateur (français). */
export const mapAuthError = (message: string, context: "login" | "register"): string => {
  const normalized = message.toLowerCase();

  if (
    normalized.includes("invalid") ||
    normalized.includes("credentials") ||
    normalized.includes("401")
  ) {
    return "Email ou mot de passe incorrect.";
  }

  if (
    context === "register" &&
    (normalized.includes("exists") ||
      normalized.includes("already") ||
      normalized.includes("409"))
  ) {
    return "Un compte existe déjà avec cet email.";
  }

  if (normalized.includes("network") || normalized.includes("fetch")) {
    return "Impossible de joindre le serveur. Vérifiez que l'API est démarrée.";
  }

  if (normalized.includes("tenant")) {
    return "Compte introuvable. Contactez le support.";
  }

  return message || "Une erreur est survenue. Réessayez.";
};
