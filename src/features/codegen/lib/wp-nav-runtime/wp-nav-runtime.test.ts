import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it, expect } from "vitest";
import { WP_NAV_RUNTIME_MARKER } from "./index";

const libDir = dirname(fileURLToPath(import.meta.url));
const publicDir = join(libDir, "../../../../../public/wp-nav-runtime");

const read = (path: string): string => readFileSync(path, "utf-8");

describe("wp-nav-runtime assets", () => {
  it("exposes marker constant", () => {
    expect(WP_NAV_RUNTIME_MARKER).toBe("wp-nav-runtime");
  });

  it("keeps lib and public css in sync", () => {
    const lib = read(join(libDir, "wp-nav-runtime.css"));
    const pub = read(join(publicDir, "wp-nav-runtime.css"));
    expect(pub).toBe(lib);
  });

  it("keeps lib and public js in sync", () => {
    const lib = read(join(libDir, "wp-nav-runtime.js"));
    const pub = read(join(publicDir, "wp-nav-runtime.js"));
    expect(pub).toBe(lib);
  });

  it("css targets wp-nav-open and max-width 1023px", () => {
    const css = read(join(libDir, "wp-nav-runtime.css"));
    expect(css).toContain("wp-nav-open");
    expect(css).toContain("max-width: 1023px");
    expect(css).toContain("#nav-menu");
  });

  it("js installs single runtime guard", () => {
    const js = read(join(libDir, "wp-nav-runtime.js"));
    expect(js).toContain("__wpNavRuntime");
    expect(js).not.toContain("MutationObserver");
  });
});
