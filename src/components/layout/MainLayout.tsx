import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { useApp } from "@/contexts/AppContext";

const MobileHeader = () => {
  const { setUI } = useApp();
  return (
    <header className="md:hidden flex items-center h-16 px-4 border-b bg-background sticky top-0 z-30">
      <Button size="icon" variant="outline" onClick={() => setUI({ isSidebarOpen: true })}>
        <Menu className="h-5 w-5" />
        <span className="sr-only">Toggle Menu</span>
      </Button>
      <div className="ml-4">
        <h1 className="text-lg font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
          CRM NoCode
        </h1>
      </div>
    </header>
  );
};

interface MainLayoutProps {
  children: ReactNode;
}

export const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="flex flex-col md:ml-[280px]">
        <MobileHeader />
        <main className="p-6">
          <div className="mx-auto max-w-[1600px]">{children}</div>
        </main>
      </div>
    </div>
  );
};