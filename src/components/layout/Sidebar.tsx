import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { LayoutDashboard, KanbanSquare, Users, Settings, UserCircle, LogOut, Puzzle, Calendar } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useApp } from "@/contexts/AppContext";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  adminOnly?: boolean;
}

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Pipeline", href: "/pipeline", icon: KanbanSquare },
  { label: "Leads", href: "/leads", icon: Users },
  { label: "Agenda", href: "/agenda", icon: Calendar },
  { label: "Integrações", href: "/integrations", icon: Puzzle },
  { label: "Admin", href: "/admin", icon: Settings, adminOnly: true },
];

const SidebarContent = ({ onLinkClick }: { onLinkClick?: () => void }) => {
  const location = useLocation();
  const { appUser, signOut } = useAuth();

  if (!appUser) return null;

  const filteredNavItems = navItems.filter(
    (item) => !item.adminOnly || appUser.papel === "admin"
  );

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex h-16 items-center border-b border-sidebar-border px-6">
        <h1 className="text-xl font-bold text-primary">
          Dr.lead
        </h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        {filteredNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href;

          return (
            <Link
              key={item.href}
              to={item.href}
              onClick={onLinkClick}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                isActive && "bg-sidebar-accent text-sidebar-primary"
              )}
            >
              <Icon className={cn("h-5 w-5", isActive && "text-sidebar-primary")} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <Separator className="mx-4" />

      {/* Profile */}
      <div className="p-4 space-y-2">
        <Link
          to="/profile"
          onClick={onLinkClick}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
            "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            location.pathname === "/profile" && "bg-sidebar-accent text-sidebar-primary"
          )}
        >
          <UserCircle className={cn("h-5 w-5", location.pathname === "/profile" && "text-sidebar-primary")} />
          <div className="flex flex-col overflow-hidden">
            <span className="truncate">{appUser.nome}</span>
            <span className="text-xs text-muted-foreground capitalize">{appUser.papel}</span>
          </div>
        </Link>

        <Button
          variant="ghost"
          className="w-full justify-start gap-3 px-3 py-2.5 h-auto"
          onClick={() => {
            signOut();
            onLinkClick?.();
          }}
        >
          <LogOut className="h-5 w-5" />
          <span>Sair</span>
        </Button>
      </div>
    </div>
  );
};

export const Sidebar = () => {
  const isMobile = useIsMobile();
  const { ui, setUI } = useApp();

  const handleLinkClick = () => {
    setUI({ isSidebarOpen: false });
  };

  if (isMobile) {
    return (
      <Sheet open={ui.isSidebarOpen} onOpenChange={(isOpen) => setUI({ isSidebarOpen: isOpen })}>
        <SheetContent side="left" className="p-0 w-[280px] bg-sidebar border-r-0">
          <SidebarContent onLinkClick={handleLinkClick} />
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-[280px] border-r border-sidebar-border bg-sidebar hidden md:block">
      <SidebarContent />
    </aside>
  );
};