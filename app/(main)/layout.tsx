import { syncUser } from "@/lib/sync-user";
import { ReactNode } from "react";
import { RedirectHandler } from "./components/RedirectHandler";
import { PageSearchCommand } from "@/components/PageSearchCommand";

export default async function MainLayout({ children }: { children: ReactNode }) {
    await syncUser();

    return (
        <div className="h-full">
            <RedirectHandler />
            <PageSearchCommand />
            {children}
        </div>
    );
}
