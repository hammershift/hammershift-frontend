import { cn } from "@/helpers/utils";
import { forwardRef } from "react";

interface InputProps {
  className?: string;
  type?: string;
  id?: string;
  name?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  [x: string]: any;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    { className, type = "text", id, name, value, onChange, required, ...props },
    ref
  ) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        )}
        ref={ref}
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
