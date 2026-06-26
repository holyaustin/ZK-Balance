import React from "react";

interface InputProps {
  type: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  required?: boolean;
  label?: string;
}

const Input: React.FC<InputProps> = ({
  type,
  placeholder,
  value,
  onChange,
  className = "",
  required = false,
  label,
}) => {
  return (
    <div className="w-full space-y-2">
      {label && (
        <label className="block text-sm font-bold tracking-tight text-foreground/80">
          {label}
          {required && <span className="text-rose-500 ml-1">*</span>}
        </label>
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        // Tailwind v4 compliant styling: High-visibility font, semantic theme tokens, and dynamic styling focus rings
        className={`w-full text-base font-medium rounded-xl border border-border bg-card px-4 py-3 text-foreground placeholder:text-muted/60 transition-all duration-200 focus:border-primary/80 focus:outline-hidden focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      />
    </div>
  );
};

export default Input;
