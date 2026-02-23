"use client";

import { useClerk } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AuthShell from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/button";
import { Loader2, LogOut } from "lucide-react";
import Link from "next/link";

/**
 * Logout Page
 * 
 * Automatically triggers the Clerk sign-out process when visited.
 * Shows a loading state during the process and a confirmation message after.
 */
export default function LogoutPage() {
    const { signOut } = useClerk();
    const router = useRouter();
    const [status, setStatus] = useState<"logging_out" | "logged_out" | "error">("logging_out");

    useEffect(() => {
        const performLogout = async () => {
            try {
                await signOut();
                setStatus("logged_out");

                // Automatically redirect to home after 5 seconds
                setTimeout(() => router.push("/"), 5000);
            } catch (error) {
                console.error("Logout failed:", error);
                setStatus("error");
            }
        };

        performLogout();
    }, [router, signOut]);

    if (status === "logging_out") {
        return (
            <AuthShell
                title="Signing out..."
                description="Please wait while we safely close your session."
                footerText="Want to stay?"
                footerCta="Go back"
                footerHref="/"
            >
                <div className="flex flex-col items-center justify-center py-12">
                    <Loader2 className="h-10 w-10 animate-spin text-[#3b19e6]" />
                </div>
            </AuthShell>
        );
    }

    if (status === "error") {
        return (
            <AuthShell
                title="Logout Error"
                description="Something went wrong while trying to sign out."
                footerText="Need help?"
                footerCta="Contact Support"
                footerHref="mailto:support@workspace.com"
            >
                <div className="space-y-6 text-center">
                    <p className="text-sm text-slate-500">
                        You might already be signed out, or there was a network issue.
                    </p>
                    <Button asChild className="w-full bg-[#3b19e6] hover:bg-[#3015c4]">
                        <Link href="/">Back to Home</Link>
                    </Button>
                </div>
            </AuthShell>
        );
    }

    return (
        <AuthShell
            title="You've been signed out"
            description="Come back soon! Your collaborative workspace is always waiting for you."
            footerText="Need to log back in?"
            footerCta="Sign In"
            footerHref="/sign-in"
        >
            <div className="space-y-8">
                <div className="flex justify-center">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 dark:bg-white/5">
                        <LogOut className="h-10 w-10 text-slate-400" />
                    </div>
                </div>

                <div className="grid gap-3">
                    <Button asChild className="bg-[#3b19e6] py-6 font-bold text-white hover:bg-[#3015c4]">
                        <Link href="/sign-in">Sign In Again</Link>
                    </Button>
                    <Button asChild variant="outline" className="py-6 border-slate-200">
                        <Link href="/">Return to Home</Link>
                    </Button>
                </div>

                <p className="text-center text-xs text-slate-400">
                    Redirecting to home page in 5 seconds...
                </p>
            </div>
        </AuthShell>
    );
}
