import { SignUp } from "@clerk/nextjs";
import AuthShell from "@/components/auth/AuthShell";

export default function SignupPage() {
  return (
    <AuthShell
      title="Create your Workspace account"
      description="Set up your account to create collaborative pages, manage projects, and invite your team."
      footerText="Already have an account?"
      footerCta="Sign in"
      footerHref="/login"
    >
      <SignUp
        routing="path"
        path="/signup"
        signInUrl="/login"
        forceRedirectUrl="/project/create"
      />
    </AuthShell>
  );
}
