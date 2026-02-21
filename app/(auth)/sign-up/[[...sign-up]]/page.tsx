import { SignUp } from "@clerk/nextjs";
import AuthShell from "@/components/auth/AuthShell";

export default function SignUpPage() {
    return (
        <AuthShell
            title="Create your account"
            description="Join thousands of teams using Workspace to organize their work and collaborate better."
            footerText="Already have an account?"
            footerCta="Sign in"
            footerHref="/sign-in"
        >
            <SignUp
                routing="path"
                path="/sign-up"
                signInUrl="/sign-in"
                forceRedirectUrl="/project/create"
            />
        </AuthShell>
    );
}
