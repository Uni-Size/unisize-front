import { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary";
  children: React.ReactNode;
}

export default function Button({
  variant = "primary",
  disabled,
  children,
  className = "",
  ...props
}: ButtonProps) {
  const baseStyles =
    " cursor-pointer w-full font-medium py-3 px-4 rounded-lg transition duration-200 ease-in-out focus:outline-none";

  const variantStyles = disabled
    ? "bg-transparent border-2 border-primary-500 text-primary-500 cursor-not-allowed"
    : "bg-primary-900 text-white border-2 border-transparent";

  return (
    <button
      disabled={disabled}
      className={`${baseStyles} ${variantStyles} ${className} `}
      {...props}
    >
      {children}
    </button>
  );
}
