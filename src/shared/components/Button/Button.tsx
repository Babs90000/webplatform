import React from "react";
import styles from "./Button.module.css";
import clsx from "clsx";
import { LoadingDots } from "../LoadingDots";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "cta";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  fullWidth?: boolean;
  ariaLabel?: string;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "md",
  isLoading = false,
  fullWidth = false,
  ariaLabel,
  children,
  disabled,
  className,
  type = "button",
  ...rest
}) => {
  const classNames = clsx(
    styles.button,
    styles[variant],
    styles[size],
    fullWidth && styles.fullWidth,
    className
  );

  return (
    <button
      type={type}
      className={classNames}
      disabled={disabled || isLoading}
      aria-label={ariaLabel}
      aria-busy={isLoading}
      {...rest}
    >
      {isLoading && <LoadingDots size="sm" label="Action en cours" />}
      <span>{children}</span>
    </button>
  );
};
