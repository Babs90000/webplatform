import fs from "node:fs";
import path from "node:path";
import { test, expect, isLiveMode } from "./fixtures";
import { getPreviewFrame, gotoStudio } from "./helpers/api-mocks";
import { CREATIVE_COMMITTEE_EXPERTS, formatExpertScoresCompact } from "../src/features/codegen/lib/creativeCommittee";
import {
  assertCommitteeQuality,
  collectCommitteeQuality,
  type CommitteeQualityReport,
} from "./helpers/committee-quality";

const REPORT_DIR = path.join(process.cwd(), "test-results", "committee-quality");

const writeCommitteeReport = (report: CommitteeQualityReport): void => {
  fs.mkdirSync(REPORT_DIR, { recursive: true });
  const file = path.join(REPORT_DIR, `committee-${Date.now()}.json`);
  fs.writeFileSync(file, `${JSON.stringify(report, null, 2)}\n`, "utf8");

  console.log(`\n🎨 Comité créatif (E2E) : ${file}`);
  console.log(`   Score global : ${report.score}/100 (${report.grade})`);
  console.log(`   Experts : ${formatExpertScoresCompact(report.expertScores)}`);

  if (report.issues.length > 0) {
    console.log("   Points faibles :");
    for (const issue of report.issues) {
      console.log(`     - ${issue.message}`);
    }
  }
};

test.describe("Comité créatif — garde-fous E2E", () => {
  test.beforeEach(() => {
    test.skip(
      !isLiveMode(),
      "Nécessite E2E_MODE=live et un projet prod (E2E_LIVE_PROJECT_ID)",
    );
  });

  test("preview alignée sur les 6 experts du comité", async ({ authedPage: page }) => {
    await gotoStudio(page);

    const frame = getPreviewFrame(page);
    if (!frame) throw new Error("Iframe studio introuvable");

    await expect(frame.locator("h1").first()).toBeVisible({ timeout: 30_000 });

    const report = await collectCommitteeQuality(frame);
    writeCommitteeReport(report);

    assertCommitteeQuality(report);

    for (const expert of CREATIVE_COMMITTEE_EXPERTS) {
      expect(report.expertScores[expert.id]).toBeGreaterThanOrEqual(0);
      expect(report.expertScores[expert.id]).toBeLessThanOrEqual(100);
    }
  });
});
