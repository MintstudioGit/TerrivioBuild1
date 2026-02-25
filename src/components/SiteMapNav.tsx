import { useState } from "react";
import { Link, useLocation } from "react-router";
import { 
  Map, 
  X, 
  ChevronRight, 
  Home, 
  LayoutGrid, 
  BookOpen, 
  CreditCard, 
  LogIn, 
  UserPlus, 
  Terminal, 
  Package, 
  BarChart3, 
  Info, 
  Shield, 
  FileText, 
  Globe,
  LayoutDashboard
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "./ui/utils";
import { Button } from "./ui/button";

export function SiteMapNav() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const routes = [
    { label: "Main", items: [
      { path: "/", label: "Landing Page", icon: Home },
      { path: "/app", label: "App Hub", icon: LayoutDashboard },
      { path: "/prompts", label: "Directory", icon: LayoutGrid },
      { path: "/saved", label: "Saved Prompts", icon: BookOpen },
      { path: "/pricing", label: "Pricing", icon: CreditCard },
    ]},
    { label: "App", items: [
      { path: "/generator", label: "Generator", icon: Terminal },
      { path: "/packs", label: "Packs", icon: Package },
      { path: "/marketplace", label: "Marketplace", icon: Package },
      { path: "/pipeline", label: "Pipeline", icon: LayoutDashboard },
      { path: "/analytics", label: "Analytics", icon: BarChart3 },
      { path: "/integrations", label: "Integrations", icon: Globe },
      { path: "/api-keys", label: "API Keys", icon: Shield },
      { path: "/white-label", label: "White Label", icon: Shield },
      { path: "/mobile", label: "Mobile App", icon: Globe },
    ]},
    { label: "Auth", items: [
      { path: "/signin", label: "Sign In", icon: LogIn },
      { path: "/signup", label: "Sign Up", icon: UserPlus },
    ]},
    { label: "Company", items: [
      { path: "/about", label: "About", icon: Info },
      { path: "/privacy", label: "Privacy", icon: Shield },
      { path: "/terms", label: "Terms", icon: FileText },
      { path: "/blog", label: "Blog", icon: Globe },
      { path: "/careers", label: "Careers", icon: Globe },
      { path: "/contact", label: "Contact", icon: Globe },
      { path: "/cookies", label: "Cookies", icon: Globe },
    ]}
  ];

  return (
    <>
      <div className="fixed bottom-4 left-4 z-50 font-[var(--font-family-inter)] print:hidden">
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10, x: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10, x: -20 }}
              transition={{ duration: 0.2 }}
              className="absolute bottom-14 left-0 w-64 bg-card border border-border rounded-[var(--radius)] shadow-2xl overflow-hidden flex flex-col max-h-[70vh]"
            >
              <div className="p-3 border-b border-border bg-muted/30 flex items-center justify-between backdrop-blur-sm">
                <span className="text-[var(--text-sm)] font-bold pl-1 flex items-center gap-2">
                  <Map className="w-3.5 h-3.5" /> Site Map
                </span>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:bg-destructive/10 hover:text-destructive" onClick={() => setIsOpen(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="overflow-y-auto p-2 space-y-4">
                {routes.map((section) => (
                  <div key={section.label}>
                    <h4 className="px-2 text-[10px] uppercase font-bold text-muted-foreground mb-1 tracking-wider opacity-70">
                      {section.label}
                    </h4>
                    <div className="space-y-0.5">
                      {section.items.map((item) => {
                        const isActive = location.pathname === item.path || (item.path !== "/" && location.pathname.startsWith(item.path));
                        return (
                          <Link
                            key={item.path}
                            to={item.path}
                            onClick={() => setIsOpen(false)}
                            className={cn(
                              "flex items-center gap-2 px-2 py-1.5 text-[var(--text-sm)] rounded-[var(--radius-sm)] transition-colors relative",
                              isActive 
                                ? "bg-primary/10 text-primary font-medium" 
                                : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            )}
                          >
                            <item.icon className={cn("w-3.5 h-3.5", isActive ? "text-primary" : "opacity-70")} />
                            {item.label}
                            {isActive && <ChevronRight className="w-3 h-3 ml-auto opacity-50" />}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <Button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "h-10 w-10 rounded-full shadow-lg transition-all duration-300",
            isOpen ? "bg-primary text-primary-foreground rotate-90" : "bg-card hover:bg-muted text-foreground border border-border"
          )}
          size="icon"
          title="Open Site Map"
        >
          {isOpen ? <X className="w-5 h-5" /> : <Map className="w-5 h-5" />}
        </Button>
      </div>
    </>
  );
}
