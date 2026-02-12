import { SignIn } from "@clerk/nextjs";
import AuthShell from "@/components/auth/AuthShell";

export default function LoginPage() {
  return (
    <AuthShell
      title="Welcome back"
      description="Sign in to continue managing pages, docs, and team workflows in one workspace."
      footerText="New to Workspace?"
      footerCta="Create an account"
      footerHref="/signup"
    >
      <SignIn
        routing="path"
        path="/login"
        signUpUrl="/signup"
        forceRedirectUrl="/project/create"
      />
    </AuthShell>
  );
}
