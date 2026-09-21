import type { ReactNode } from "react";

export default function AuthCard({
  emoji,
  title,
  subtitle,
  children,
  footer,
}: {
  emoji: string;
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#fff3e6] px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="metal-card relative overflow-hidden rounded-[32px] p-8 text-white shadow-2xl">
          <div className="mb-6 flex items-center justify-between">
            <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-bold tracking-wide">
              GGM CARD
            </span>
            <span className="text-3xl">{emoji}</span>
          </div>
          <h1 className="font-brand text-2xl">{title}</h1>
          <p className="mt-1 mb-6 text-sm text-white/70">{subtitle}</p>
          {children}
        </div>
        <div className="mt-6 text-center text-sm text-[#a5674a]">{footer}</div>
      </div>
    </main>
  );
}
