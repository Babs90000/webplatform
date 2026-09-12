/**
 * Sentry navigateur optionnel — no-op sans NEXT_PUBLIC_SENTRY_DSN.
 */

export const initClientSentry = async (): Promise<void> => {
  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN?.trim();
  if (!dsn || typeof window === "undefined") return;

  try {
    // Package optionnel — ignorer si non installé
    const Sentry = await import(
      /* webpackIgnore: true */ "@sentry/nextjs" as string
    ).catch(() => null);
    if (!Sentry || typeof Sentry.init !== "function") {
      console.info("[sentry] @sentry/nextjs non installé — skip");
      return;
    }
    Sentry.init({
      dsn,
      tracesSampleRate: 0.1,
    });
  } catch {
    // silencieux
  }
};
