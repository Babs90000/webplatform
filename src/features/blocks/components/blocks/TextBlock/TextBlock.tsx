import React from "react";
import type { TextProps } from "@/types";

const MAX_WIDTHS: Record<NonNullable<TextProps["max_width"]>, string> = {
  narrow: "600px",
  normal: "800px",
  wide: "1040px",
};

export const TextBlock: React.FC<TextProps> = ({
  title,
  body = "Ce bloc de texte vous permet d'ajouter des paragraphes à votre page.",
  align = "left",
  max_width = "normal",
}) => {
  return (
    <div
      style={{
        padding: "var(--space-xl)",
        width: "100%",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          maxWidth: MAX_WIDTHS[max_width],
          width: "100%",
          color: "var(--color-text-primary)",
          textAlign: align,
          lineHeight: 1.7,
          whiteSpace: "pre-wrap",
        }}
      >
        {title && (
          <h2
            style={{
              fontSize: "1.75rem",
              fontWeight: 700,
              marginBottom: "var(--space-md)",
              letterSpacing: "-0.01em",
            }}
          >
            {title}
          </h2>
        )}
        {body}
      </div>
    </div>
  );
};
