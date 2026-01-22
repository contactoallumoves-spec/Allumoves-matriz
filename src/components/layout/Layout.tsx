import { ReactNode } from "react";
import Topbar from "./Topbar";
import Sidebar from "./Sidebar";

interface LayoutProps {
    children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
    return (
        <div className="flex h-screen w-full flex-col bg-background text-foreground overflow-hidden">
            {/* Topbar fixed at top */}
            <Topbar />

            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar fixed at left on Desktop, hidden on mobile */}
                <Sidebar className="hidden md:flex w-64 flex-col border-r bg-card/50" />

                {/* Main Content Area */}
                <main className="flex-1 overflow-auto bg-background/50 p-4 md:p-6 lg:p-8">
                    <div className="mx-auto max-w-[1600px] w-full space-y-6">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
