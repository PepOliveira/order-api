import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { Mic, LayoutDashboard } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#09090b] flex flex-col text-zinc-50 font-sans selection:bg-indigo-500/30">
      <header className="bg-zinc-950/80 border-b border-zinc-900/80 sticky top-0 z-50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-600 p-2.5 rounded-xl text-white shadow-lg shadow-indigo-500/20">
                <Mic size={22} />
              </div>
              <span className="text-2xl font-extrabold tracking-tight text-white">
                Testimonify
              </span>
            </div>
            
            <nav className="flex items-center gap-6">
              <Link 
                href="/dashboard" 
                className="text-zinc-400 hover:text-white flex items-center gap-2 font-semibold transition-colors"
              >
                <LayoutDashboard size={18} />
                Dashboard
              </Link>
              <div className="h-6 w-px bg-zinc-800"></div>
              <div className="ring-2 ring-zinc-800 rounded-full">
                <UserButton 
                  appearance={{
                    elements: {
                      userButtonAvatarBox: "w-9 h-9",
                    }
                  }} 
                />
              </div>
            </nav>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
        {children}
      </main>
    </div>
  );
}
