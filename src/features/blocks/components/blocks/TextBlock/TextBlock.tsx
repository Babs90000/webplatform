import React from "react";

export interface TextBlockProps {
  content?: string;
  alignment?: "left" | "center" | "right" | "justify";
  size?: "small" | "medium" | "large";
  backgroundColor?: string;
  textColor?: string;
}

export const TextBlock: React.FC<TextBlockProps> = ({
  content = "This is a simple text block. You can use it to add paragraphs of text to your page.",
  alignment = "left",
  size = "medium",
  backgroundColor = "transparent",
  textColor = "var(--color-text-primary)",
}) => {
  const getFontSize = () => {
    switch (size) {
      case "small": return "0.875rem";
      case "large": return "1.25rem";
      default: return "1rem";
    }
  };

  const getLineHeight = () => {
    switch (size) {
      case "small": return 1.5;
      case "large": return 1.8;
      default: return 1.6;
    }
  };

  return (
    <div 
      style={{
        backgroundColor,
        padding: "var(--space-xl)",
        width: "100%",
        display: "flex",
        justifyContent: "center"
      }}
    >
      <div style={{
        maxWidth: "800px",
        width: "100%",
        color: textColor,
        textAlign: alignment,
        fontSize: getFontSize(),
        lineHeight: getLineHeight(),
        whiteSpace: "pre-wrap"
      }}>
        {content}
      </div>
    </div>
  );
};
