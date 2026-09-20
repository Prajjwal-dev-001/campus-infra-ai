import React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  isLoading = false,
  className = "",
  disabled,
  ...props
}) => {
  const baseClasses = variant === "secondary" ? "lpu-btn-secondary" : "lpu-btn-primary";
  return (
    <button
      className={`${baseClasses} ${className} ${disabled || isLoading ? "opacity-60 cursor-not-allowed" : ""}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? "Loading..." : children}
    </button>
  );
};

export default Button;
