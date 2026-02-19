import { SignIn } from "@clerk/nextjs";
import AuthShell from "@/components/auth/AuthShell";

export default function SignInPage() {
    return (
        <AuthShell
            title="Welcome back"
            description="Sign in to continue managing pages, docs, and team workflows in one workspace."
            footerText="New to Workspace?"
            footerCta="Create an account"
            footerHref="/sign-up"
        >
            <SignIn
                routing="path"
                path="/sign-in"
                signUpUrl="/sign-up"
            />
        </AuthShell>
    );
}
