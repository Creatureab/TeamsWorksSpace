import { syncUser } from "@/lib/sync-user";
import { ReactNode } from "react";
import { RedirectHandler } from "./components/RedirectHandler";

export default async function MainLayout({ children }: { children: ReactNode }) {
    // This will run on the server every time a main route is visited
    await syncUser();

    return (
        <div className="h-full">
            <RedirectHandler />
            {children}
        </div>
    );
}
