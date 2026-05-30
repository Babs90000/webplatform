import React from "react";
import styles from "./Input.module.css";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  as?: "input" | "textarea";
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  icon,
  as = "input",
  id,
  className,
  ...rest
}) => {
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
      <div className={styles.inputWrapper}>
        {icon && <span className={styles.icon}>{icon}</span>}
        {as === "textarea" ? (
          <textarea
            id={inputId}
            className={inputClasses}
            {...(rest as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
          />
        ) : (
          <input id={inputId} className={inputClasses} {...rest} />
        )}
      </div>
      {error && <span className={styles.errorMessage}>{error}</span>}
    </div>
  );
};
