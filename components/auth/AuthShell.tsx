import Link from "next/link";
import type { ReactNode } from "react";

type AuthShellProps = {
  title: string;
  description: string;
  footerText: string;
  footerCta: string;
  footerHref: string;
  children: ReactNode;
};

export default function AuthShell({
  title,
  description,
  footerText,
  footerCta,
  footerHref,
  children,
}: AuthShellProps) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f6f6f8] text-slate-800">
      <div className="pointer-events-none absolute -top-24 left-1/2 h-[520px] w-[920px] -translate-x-1/2 rounded-full bg-[#3b19e6]/10 blur-[120px]" />
      <div className="pointer-events-none absolute right-[-120px] bottom-[-120px] h-[340px] w-[340px] rounded-full bg-[#3b19e6]/15 blur-[90px]" />

      <div className="relative mx-auto grid min-h-screen max-w-6xl items-center gap-12 px-4 py-10 sm:px-6 lg:grid-cols-2 lg:px-8">
        <section className="max-w-xl">
          <Link
            className="mb-8 inline-flex items-center gap-2 rounded-full border border-[#3b19e6]/20 bg-white/60 px-3 py-1.5 text-xs font-semibold text-[#3b19e6] backdrop-blur"
            href="/"
          >
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-md bg-[#3b19e6] text-[10px] font-bold text-white">
              W
            </span>
            Workspace
          </Link>
          <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
            {title}
          </h1>
          <p className="max-w-md text-base leading-relaxed text-slate-600 sm:text-lg">
            {description}
          </p>
        </section>

        <section className="rounded-3xl border border-slate-200/70 bg-white/85 p-4 shadow-2xl shadow-[#3b19e6]/10 backdrop-blur sm:p-6">
          <div className="rounded-2xl border border-slate-200/70 bg-white p-2 sm:p-3">
            {children}
          </div>
          <p className="mt-5 text-center text-sm text-slate-600">
            {footerText}{" "}
            <Link className="font-semibold text-[#3b19e6] hover:underline" href={footerHref}>
              {footerCta}
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}
