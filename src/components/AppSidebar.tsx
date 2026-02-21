import { useState, useEffect } from "react";
import { LayoutDashboard, ScrollText, Package, Eye, Settings, Sword, LogOut, ChevronRight, Sparkles } from "lucide-react";
import { useLocation, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

const navItems = [
  { title: "Dashboard",  url: "/",          icon: LayoutDashboard },
  { title: "Quest Log",  url: "/quests",    icon: ScrollText },
  { title: "Inventory",  url: "/inventory", icon: Package },
  { title: "Visions",    url: "/visions",   icon: Eye },
  { title: "Settings",   url: "/settings",  icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const { user, signOut } = useAuth();
  const collapsed = state === "collapsed";
  const [expFlash, setExpFlash] = useState(false);

  useEffect(() => {
    const handler = () => {
      setExpFlash(true);
      setTimeout(() => setExpFlash(false), 1700);
    };
    window.addEventListener("exp-gained", handler);
    return () => window.removeEventListener("exp-gained", handler);
  }, []);

  const isActive = (url: string) =>
    url === "/" ? location.pathname === "/" : location.pathname.startsWith(url);

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border bg-sidebar">
      {/* Header / Logo */}
      <SidebarHeader className="px-4 py-5 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-secondary border border-gold/40 flex items-center justify-center">
            <Sword className="w-4 h-4 text-gold" />
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <p className="font-display font-bold text-foreground text-base leading-tight truncate">
                Nexus Log
              </p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
                Life JRPG
              </p>
            </div>
          )}
        </div>
        {expFlash && !collapsed && (
          <div className="animate-exp-flash flex items-center gap-1.5 mt-2 px-1">
            <Sparkles className="w-3.5 h-3.5 text-gold" />
            <span className="text-[11px] font-medium text-gold">EXP Gained!</span>
          </div>
        )}
      </SidebarHeader>

      {/* Nav */}
      <SidebarContent className="py-4">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1 px-2">
              {navItems.map((item) => {
                const active = isActive(item.url);
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild tooltip={item.title}>
                      <Link
                        to={item.url}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group",
                          active
                            ? "bg-gold/10 text-gold border border-gold/20"
                            : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground border border-transparent"
                        )}
                      >
                        <item.icon
                          className={cn(
                            "w-4 h-4 flex-shrink-0 transition-colors",
                            active ? "text-gold" : "text-muted-foreground group-hover:text-foreground"
                          )}
                        />
                        {!collapsed && (
                          <>
                            <span className="flex-1">{item.title}</span>
                            {active && <ChevronRight className="w-3 h-3 text-gold/60" />}
                          </>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer / User */}
      <SidebarFooter className="p-3 border-t border-sidebar-border">
        <div className={cn("flex items-center gap-3", collapsed ? "justify-center" : "px-1")}>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-foreground truncate">
                {user?.user_metadata?.full_name || "Adventurer"}
              </p>
              <p className="text-[10px] text-muted-foreground truncate">{user?.email}</p>
            </div>
          )}
          <button
            onClick={signOut}
            title="Sign out"
            className="flex-shrink-0 p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
