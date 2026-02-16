import { BottomNav } from "@/components/layout/bottom-nav";
import { AppHeader } from "@/components/layout/app-header";
import { QuickLogButton } from "@/components/quran/quick-log-button";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="pb-20 md:pb-6 pt-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">{children}</div>
      </main>
      <QuickLogButton />
      <BottomNav />
    </div>
  );
}
