import { 
  Inbox, 
  Users, 
  BrainCircuit, 
  LayoutDashboard, 
  Settings,
  LogOut,
  Building2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ThemeToggle";

const navItems = [
  { name: "Inbox", icon: Inbox, id: "inbox", badge: 4 },
  { name: "Active Leads", icon: Users, id: "leads" },
  { name: "AI Review Queue", icon: BrainCircuit, id: "ai-review", badge: 2 },
  { name: "Dashboard", icon: LayoutDashboard, id: "dashboard" },
  { name: "Settings", icon: Settings, id: "settings" },
];

interface SidebarProps {
  activeTab: string;
  setActiveTab: (id: string) => void;
}

export function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  return (
    <div className="w-64 flex flex-col h-screen border-r bg-background">
      {/* Header / Logo */}
      <div className="h-14 flex items-center px-4 border-b">
        <div className="flex items-center gap-2 font-semibold text-lg tracking-tight">
          <div className="bg-primary text-primary-foreground p-1.5 rounded-md">
            <Building2 className="w-5 h-5" />
          </div>
          QuickMove
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-4 flex flex-col gap-1 px-3">
        <div className="text-xs font-semibold text-muted-foreground px-2 mb-2 tracking-wider uppercase">
          Workspace
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "flex items-center justify-between px-2 py-1.5 rounded-md text-sm transition-colors",
                isActive 
                  ? "bg-secondary text-secondary-foreground font-medium" 
                  : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
              )}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={cn("w-4 h-4", isActive ? "text-primary" : "text-muted-foreground")} />
                {item.name}
              </div>
              {item.badge && (
                <span className="bg-primary/10 text-primary text-xs font-medium px-2 py-0.5 rounded-full">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* User Profile */}
      <div className="p-4 border-t">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-sm font-medium text-secondary-foreground shrink-0">
            OC
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-medium truncate">Operations Coord.</p>
            <p className="text-[10px] text-muted-foreground truncate">ops@quickmove.in</p>
          </div>
          <ThemeToggle />
          <button className="p-1.5 rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors" aria-label="Log out">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
