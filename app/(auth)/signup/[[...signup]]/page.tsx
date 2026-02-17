"use client";

import { SignUp } from "@clerk/nextjs";
import AuthShell from "@/components/auth/AuthShell";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

export default function SignupPage() {
  const [showExistingUserMessage, setShowExistingUserMessage] = useState(false);
  const searchParams = useSearchParams();
  const emailParam = searchParams?.get("email");

  useEffect(() => {
    // Check if user is being redirected because they already exist
    if (emailParam) {
      checkEmailExists(emailParam);
    }
  }, [emailParam]);

  const checkEmailExists = async (email: string) => {
    try {
      const response = await fetch("/api/check-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.exists) {
          setShowExistingUserMessage(true);
        }
      }
    } catch (error) {
      console.error("Error checking email:", error);
    }
  };

  return (
    <AuthShell
      title={showExistingUserMessage ? "Account Already Exists" : "Create your Workspace account"}
      description={
        showExistingUserMessage
          ? "An account with this email already exists. Please log in to access your workspace."
          : "Set up your account to create collaborative pages, manage projects, and invite your team."
      }
      footerText="Already have an account?"
      footerCta="Sign in"
      footerHref="/login"
    >
      {showExistingUserMessage ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-6 text-center">
          <div className="mb-4 text-4xl">⚠️</div>
          <h3 className="mb-2 text-lg font-semibold text-amber-900">
            Account Already Exists
          </h3>
          <p className="mb-4 text-sm text-amber-800">
            An account with this email already exists. Please log in to continue.
          </p>
          <a
            href="/login"
            className="inline-flex items-center justify-center rounded-md bg-[#3b19e6] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#3015c4] transition-colors"
          >
            Go to Login
          </a>
        </div>
      ) : (
        <SignUp
          routing="path"
          path="/signup"
          signInUrl="/login"
          forceRedirectUrl="/project/create"
        />
      )}
    </AuthShell>
  );
}
