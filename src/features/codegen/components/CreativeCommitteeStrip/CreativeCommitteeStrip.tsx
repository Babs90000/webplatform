"use client";

import React from "react";
import { Info } from "lucide-react";
import { Icon } from "@/shared/components/Icon";
import {
  CREATIVE_COMMITTEE_EXPERTS,
  type ReviewExpertId,
} from "../../lib/creativeCommittee";
import styles from "./CreativeCommitteeStrip.module.css";

interface CreativeCommitteeStripProps {
  scores?: Partial<Record<ReviewExpertId, number>> | null;
  active?: boolean;
  showLabel?: boolean;
  align?: "start" | "center";
}

export const CreativeCommitteeStrip: React.FC<CreativeCommitteeStripProps> = ({
  scores = null,
  active = false,
  showLabel = true,
  align = "center",
}) => (
  <div className={`${styles.wrap} ${align === "start" ? styles.wrapStart : ""}`}>
    {showLabel && <span className={styles.label}>Comité</span>}
    <ul className={styles.strip} aria-label="Comité créatif — 6 experts">
      {CREATIVE_COMMITTEE_EXPERTS.map((expert) => {
        const score = scores?.[expert.id];
        const tooltip = `${expert.title} — ${expert.detail}`;
        return (
          <li
            key={expert.id}
            className={`${styles.chip} ${active && score === undefined ? styles.chipActive : ""}`}
          >
            <span className={styles.short}>{expert.short}</span>
            {typeof score === "number" && (
              <span className={styles.score}>{score}</span>
            )}
            <button
              type="button"
              className={styles.infoBtn}
              title={tooltip}
              aria-label={tooltip}
            >
              <Icon icon={Info} size="xs" />
            </button>
          </li>
        );
      })}
    </ul>
  </div>
);
