"use client";

export function FilterSelect({ name, label, value, options }: {
  name: string;
  label: string;
  value: string;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="flex min-w-0 flex-col gap-1.5 text-xs font-medium text-muted-foreground">
      {label}
      <select
        className="h-10 w-full rounded-lg border bg-card px-2 text-sm text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        name={name}
        defaultValue={value}
        onChange={(event) => event.currentTarget.form?.requestSubmit()}
      >
        <option value="">All</option>
        {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
    </label>
  );
}
