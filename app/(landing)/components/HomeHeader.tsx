"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

const navItems = ["Product", "Solutions", "Pricing", "Enterprise"];

export default function HomeHeader() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => setMounted(true), []);

  return (
    <nav className="fixed top-0 z-50 w-full border-b border-gray-200 bg-white/80 backdrop-blur-md dark:border-white/10 dark:bg-[#141121]/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#3b19e6] text-white">
            <span className="text-sm font-bold">W</span>
          </div>
          <span className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
            Workspace.
          </span>
        </div>

        <div className="hidden items-center gap-8 md:flex">
          {navItems.map((item) => (
            <a
              key={item}
              className="text-sm font-medium text-gray-600 transition-colors hover:text-[#3b19e6] dark:text-slate-200"
              href="#"
            >
              {item}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-3">
          {mounted && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="text-gray-600 dark:text-gray-300"
            >
              {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
            </Button>
          )}

          <SignedOut>
            <Button
              asChild
              className="text-gray-700 shadow-none hover:bg-gray-100 dark:text-slate-200 dark:hover:bg-white/5"
              variant="ghost"
            >
              <Link href="/login">Log in</Link>
            </Button>
            <Button
              asChild
              className="bg-[#3b19e6] text-white shadow-lg shadow-[#3b19e6]/20 hover:bg-[#3015c4]"
            >
              <Link href="/signup">Get Started</Link>
            </Button>
          </SignedOut>
          <SignedIn>
            <Button
              asChild
              variant="ghost"
              className="text-gray-700 dark:text-slate-200"
            >
              <Link href="/workspace">Dashboard</Link>
            </Button>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </div>
      </div>
    </nav>
  );
}
