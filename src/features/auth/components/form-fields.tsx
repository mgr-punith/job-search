import type { ReactNode } from "react";

type TextFieldProps = {
  id: string;
  name: string;
  label: string;
  type?: "email" | "password" | "text";
  autoComplete: string;
  error?: string;
};

export function TextField({
  id,
  name,
  label,
  type = "text",
  autoComplete,
  error,
}: TextFieldProps) {
  const errorId = `${id}-error`;

  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium" htmlFor={id}>
        {label}
      </label>
      <input
        aria-describedby={error ? errorId : undefined}
        aria-invalid={error ? true : undefined}
        autoComplete={autoComplete}
        className="h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/20 aria-invalid:border-destructive aria-invalid:ring-destructive/20 sm:h-11"
        id={id}
        name={name}
        required
        spellCheck={type === "email" ? false : undefined}
        type={type}
      />
      {error ? (
        <p className="text-sm text-destructive" id={errorId}>
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function FormMessage({ children }: { children: ReactNode }) {
  return (
    <p aria-live="polite" className="text-sm text-destructive" role="alert">
      {children}
    </p>
  );
}
