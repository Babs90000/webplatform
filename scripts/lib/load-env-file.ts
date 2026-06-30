import fs from "node:fs";
import path from "node:path";

const parseLine = (line: string): { key: string; value: string } | null => {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) return null;

  const eq = trimmed.indexOf("=");
  if (eq <= 0) return null;

  const key = trimmed.slice(0, eq).trim();
  let value = trimmed.slice(eq + 1).trim();

  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    value = value.slice(1, -1);
  }

  return { key, value };
};

/** Charge un fichier .env dans process.env (sans écraser les vars déjà définies). */
export const loadEnvFile = (filePath: string): boolean => {
  const absolute = path.isAbsolute(filePath)
    ? filePath
    : path.join(process.cwd(), filePath);

  if (!fs.existsSync(absolute)) return false;

  const content = fs.readFileSync(absolute, "utf8");
  for (const line of content.split(/\r?\n/)) {
    const parsed = parseLine(line);
    if (!parsed) continue;
    if (process.env[parsed.key] === undefined) {
      process.env[parsed.key] = parsed.value;
    }
  }

  return true;
};

export const loadE2EEnv = (): string[] => {
  const loaded: string[] = [];
  for (const file of [".env.local", ".env.e2e.local", ".env"]) {
    if (loadEnvFile(file)) loaded.push(file);
  }
  return loaded;
};
