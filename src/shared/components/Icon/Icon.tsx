import React from "react";
import type { LucideIcon } from "lucide-react";
import styles from "./Icon.module.css";

export type IconSize = "xs" | "sm" | "md" | "lg";

interface IconProps {
  icon: LucideIcon;
  size?: IconSize;
  label?: string;
  className?: string;
}

export const Icon: React.FC<IconProps> = ({
  icon: LucideComponent,
  size = "md",
  label,
  className,
}) => (
  <LucideComponent
    className={`${styles.icon} ${styles[size]} ${className ?? ""}`}
    aria-hidden={!label}
    aria-label={label}
  />
);
