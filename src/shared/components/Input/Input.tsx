import React from "react";
import styles from "./Input.module.css";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  as?: "input" | "textarea";
}

export const Input = React.forwardRef<
  HTMLInputElement | HTMLTextAreaElement,
  InputProps
>(({ label, error, icon, as = "input", id, className, ...rest }, ref) => {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");
  const inputClasses = [
    styles.input,
    icon ? styles.hasIcon : "",
    error ? styles.error : "",
    as === "textarea" ? styles.textarea : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={styles.wrapper}>
      {label && (
        <label htmlFor={inputId} className={styles.label}>
          {label}
        </label>
      )}
      <div className={styles.inputWrapper} suppressHydrationWarning>
        {icon && <span className={styles.icon}>{icon}</span>}
        {as === "textarea" ? (
          <textarea
            id={inputId}
            ref={ref as React.Ref<HTMLTextAreaElement>}
            className={inputClasses}
            suppressHydrationWarning
            {...(rest as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
          />
        ) : (
          <input
            id={inputId}
            ref={ref as React.Ref<HTMLInputElement>}
            className={inputClasses}
            suppressHydrationWarning
            {...rest}
          />
        )}
      </div>
      {error && <span className={styles.errorMessage}>{error}</span>}
    </div>
  );
});

Input.displayName = "Input";
