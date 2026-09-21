import type { InputHTMLAttributes } from "react";

export default function AuthInput({
  label,
  ...props
}: { label: string } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={props.id} className="text-sm font-medium text-white/80">
        {label}
      </label>
      <input
        {...props}
        className="rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-white placeholder-white/40 outline-none backdrop-blur-sm transition focus:border-white/50 focus:bg-white/15"
      />
    </div>
  );
}
