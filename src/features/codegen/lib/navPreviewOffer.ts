/** Détecte une navigation mobile dans les fichiers HTML du projet. */
export const hasSiteNavigation = (
  files: Array<{ path: string; content: string }>,
): boolean => {
  const navPattern =
    /nav-toggle|nav-menu|#nav-menu|#nav-toggle|aria-controls|hamburger|mobile-menu|navbar-toggle/i;
  return files.some(
    (file) =>
      file.path.toLowerCase().endsWith(".html") && navPattern.test(file.content),
  );
};

export const usesAlpineInProject = (
  files: Array<{ path: string; content: string }>,
): boolean => {
  const alpinePattern =
    /\b(x-data|x-show|x-if|x-for|x-bind|x-on:|@click|x-model|x-transition)\b/i;
  return files.some((file) => {
    const lower = file.path.toLowerCase();
    return (
      (lower.endsWith(".html") || lower.endsWith(".js")) &&
      alpinePattern.test(file.content)
    );
  });
};
