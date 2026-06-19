import React from "react";
import { LoadingDots } from "../LoadingDots";

interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  color?: string;
  label?: string;
}

/** @deprecated Préférez LoadingDots ou LoadingScreen — conservé pour compatibilité. */
export const Spinner: React.FC<SpinnerProps> = ({
  size = "md",
  label = "Chargement",
}) => {
  return <LoadingDots size={size} label={label} />;
};
