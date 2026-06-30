import type { Frame } from "@playwright/test";
import type { ReviewExpertId, ReviewExpertScores } from "../../src/features/codegen/lib/creativeCommittee";
import { CREATIVE_COMMITTEE_EXPERTS } from "../../src/features/codegen/lib/creativeCommittee";

export type CommitteeQualityIssue = {
  expertId: ReviewExpertId;
  severity: "info" | "warn" | "error";
  message: string;
};

export type CommitteeQualityReport = {
  scoredAt: string;
  score: number;
  grade: "A" | "B" | "C" | "D" | "F";
  expertScores: ReviewExpertScores;
  issues: CommitteeQualityIssue[];
  pass: boolean;
};

type FrameContext = {
  frame: Frame;
  html: string;
  bodyText: string;
};

const clampScore = (value: number): number =>
  Math.max(0, Math.min(100, Math.round(value)));

const gradeFromScore = (score: number): CommitteeQualityReport["grade"] => {
  if (score >= 90) return "A";
  if (score >= 75) return "B";
  if (score >= 60) return "C";
  if (score >= 45) return "D";
  return "F";
};

const scoreDirecteurArtistique = (ctx: FrameContext): number => {
  let score = 40;
  if (/<style[\s>]/i.test(ctx.html) || /\.css/i.test(ctx.html)) score += 25;
  if (/font-family|color:|background/i.test(ctx.html)) score += 20;
  if (ctx.bodyText.length >= 40) score += 15;
  return clampScore(score);
};

const scoreDesignerUx = async (ctx: FrameContext): Promise<number> => {
  let score = 30;
  if (/<meta[^>]+name=["']viewport["']/i.test(ctx.html)) score += 25;
  const links = await ctx.frame.locator("a[href]").count();
  if (links >= 2) score += 20;
  const overflow = await ctx.frame.evaluate(() => {
    const doc = document.documentElement;
    return doc.scrollWidth > doc.clientWidth + 2;
  });
  if (!overflow) score += 25;
  return clampScore(score);
};

const scoreRedacteur = async (ctx: FrameContext): Promise<number> => {
  let score = 20;
  if ((await ctx.frame.locator("h1").count()) > 0) score += 30;
  if (ctx.bodyText.length >= 80) score += 30;
  if (ctx.bodyText.length >= 200) score += 20;
  return clampScore(score);
};

const scoreSeo = async (ctx: FrameContext): Promise<number> => {
  let score = 20;
  if (/<html[^>]+lang=["'][a-z]{2}/i.test(ctx.html)) score += 20;
  if (/<title[^>]*>[^<]+<\/title>/i.test(ctx.html)) score += 20;
  if ((await ctx.frame.locator("h1").count()) > 0) score += 20;
  if (/<meta[^>]+name=["']description["']/i.test(ctx.html)) score += 20;
  return clampScore(score);
};

const scoreCro = async (ctx: FrameContext): Promise<number> => {
  const buttons = await ctx.frame.getByRole("button").count();
  const links = await ctx.frame.getByRole("link").count();
  let score = 25;
  if (buttons + links >= 2) score += 35;
  if (buttons + links >= 4) score += 20;
  if (/contact|devis|appel|réserver|commander|commencer/i.test(ctx.bodyText)) {
    score += 20;
  }
  return clampScore(score);
};

const scoreAccessibilite = async (ctx: FrameContext): Promise<number> => {
  let score = 40;
  const images = await ctx.frame.locator("img").count();
  if (images === 0) {
    score += 30;
  } else {
    const missingAlt = await ctx.frame.locator("img:not([alt])").count();
    if (missingAlt === 0) score += 30;
  }
  if (/<main[\s>]/i.test(ctx.html)) score += 15;
  if ((await ctx.frame.locator("[aria-label], [aria-labelledby]").count()) > 0) {
    score += 15;
  }
  return clampScore(score);
};

const buildIssues = (
  expertScores: ReviewExpertScores,
  minExpert: number,
): CommitteeQualityIssue[] => {
  const issues: CommitteeQualityIssue[] = [];
  for (const expert of CREATIVE_COMMITTEE_EXPERTS) {
    const value = expertScores[expert.id];
    if (value < minExpert) {
      issues.push({
        expertId: expert.id,
        severity: value < minExpert - 15 ? "error" : "warn",
        message: `${expert.title} : ${value}/100 (min ${minExpert}) — ${expert.detail}`,
      });
    }
  }
  return issues;
};

/**
 * Garde-fous E2E sur les mêmes 6 axes que le comité créatif (review_done API).
 * La revue IA réelle tourne à la génération/audit — pas de second LLM ici.
 */
export const collectCommitteeQuality = async (
  frame: Frame,
): Promise<CommitteeQualityReport> => {
  const html = await frame.locator("html").innerHTML();
  const bodyText = (await frame.locator("body").innerText())
    .replace(/\s+/g, " ")
    .trim();
  const ctx: FrameContext = { frame, html, bodyText };

  const expertScores: ReviewExpertScores = {
    directeur_artistique: scoreDirecteurArtistique(ctx),
    designer_ux: await scoreDesignerUx(ctx),
    redacteur: await scoreRedacteur(ctx),
    seo: await scoreSeo(ctx),
    cro: await scoreCro(ctx),
    accessibilite: await scoreAccessibilite(ctx),
  };

  const values = Object.values(expertScores);
  const score = clampScore(
    values.reduce((sum, value) => sum + value, 0) / values.length,
  );

  const minExpert = Number(process.env.E2E_MIN_EXPERT_SCORE ?? "50");
  const minGlobal = Number(process.env.E2E_MIN_COMMITTEE_SCORE ?? "60");
  const pass =
    score >= minGlobal && values.every((value) => value >= minExpert);

  return {
    scoredAt: new Date().toISOString(),
    score,
    grade: gradeFromScore(score),
    expertScores,
    issues: buildIssues(expertScores, minExpert),
    pass,
  };
};

export const assertCommitteeQuality = (report: CommitteeQualityReport): void => {
  if (report.pass) return;

  const summary = report.issues
    .map((issue) => `${issue.expertId}=${report.expertScores[issue.expertId]}`)
    .join(", ");

  throw new Error(
    `Comité créatif E2E : ${report.score}/100 (${report.grade}) — ${summary}`,
  );
};
