"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SignIn } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Mail, Lock, Eye, EyeOff } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setError("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // Clerk will handle the sign in process
      // The SignIn component will manage the actual authentication
      router.push("/workspace");
    } catch (err) {
      setError("Invalid email or password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-lg border-0">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <CardTitle className="text-2xl font-bold text-slate-900">Welcome back</CardTitle>
            <CardDescription className="text-slate-600">
              Sign in to your TeamsWorks account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Clerk SignIn Component */}
            <SignIn 
              path="/login"
              routing="path"
              signUpUrl="/signup"
              redirectUrl="/workspace"
              appearance={{
                elements: {
                  rootBox: "w-full",
                  card: "shadow-none border-0 p-0",
                  formButtonPrimary: 
                    "w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors",
                  formFieldInput: 
                    "flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                  socialButtonsBlockButton: 
                    "w-full inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-slate-200 bg-white hover:bg-slate-100 h-10 px-4 py-2",
                  socialButtonsBlockButtonText: "text-slate-700",
                  dividerText: "text-slate-500 text-sm",
                }
              }}
            />

            <div className="text-center">
              <p className="text-sm text-slate-600">
                Don't have an account?{" "}
                <Link 
                  href="/signup" 
                  className="font-medium text-blue-600 hover:text-blue-700 transition-colors"
                >
                  Sign up
                </Link>
              </p>
            </div>

            <div className="text-center">
              <Link 
                href="/" 
                className="text-sm text-slate-500 hover:text-slate-700 transition-colors"
              >
                ← Back to home
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
