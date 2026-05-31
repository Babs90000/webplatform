import React from "react";
import styles from "./Button.module.css";
import clsx from "clsx";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
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
      {isLoading && (
        <svg
          className={styles.spinner}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <circle
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            opacity="0.25"
          />
          <path
            d="M12 2a10 10 0 0 1 10 10"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>
      )}
      <span>{children}</span>
    </button>
  );
};
