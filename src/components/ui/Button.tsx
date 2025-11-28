import { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary";
  size?: "small" | "medium" | "large";
  children: React.ReactNode;
}

export default function Button({
  variant = "primary",
  size = "medium",
  disabled,
  children,
  className = "",
  ...props
}: ButtonProps) {
  const baseStyles =
    "cursor-pointer w-full font-medium rounded-lg transition duration-200 ease-in-out focus:outline-none";

  // Size styles
  const sizeStyles = {
    small: "py-2 px-3 text-sm",
    medium: "py-3 px-4 text-base",
    large: "py-4 px-6 text-lg",
  };

  // Variant styles
  const getVariantStyles = () => {
    if (disabled) {
      return "bg-transparent border-2 border-primary-500 text-primary-500 cursor-not-allowed opacity-50";
    }

    if (variant === "secondary") {
      return "bg-transparent border-2 border-primary-900 text-primary-900 hover:bg-primary-50";
    }

    return "bg-primary-900 text-white border-2 border-transparent hover:bg-primary-800";
  };

  return (
    <button
      disabled={disabled}
      className={`${baseStyles} ${sizeStyles[size]} ${getVariantStyles()} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
