import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";

interface MainLayoutProps {
  children: ReactNode;
}

export const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="ml-[280px] p-6">
        <div className="mx-auto max-w-[1600px]">
          {children}
        </div>
      </main>
    </div>
  );
};
