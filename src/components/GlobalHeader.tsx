import { Link, useLocation } from "react-router";
import { Button } from "./ui/button";
import { cn } from "./ui/utils";
import { 
  LayoutGrid, Terminal, Package, BookOpen, CreditCard, Wand2, Menu, 
  Settings, BarChart3, Sparkles, LogOut, User 
} from "lucide-react";
import { motion } from "motion/react";
import { useDesignContext } from "./DesignController";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

export function GlobalHeader() {
  const { userState, supabase } = useDesignContext();
  const location = useLocation();
  const path = location.pathname;

  const isActive = (route: string) => {
    if (path === route) return true;
    if (route.startsWith("/prompts") && path.startsWith("/prompts")) return true;
    return false;
  };

  const navItems = [
    { id: "directory", path: "/prompts", label: "Directory", icon: LayoutGrid },
    { id: "generator", path: "/generator", label: "Generator", icon: Terminal },
    { id: "packs", path: "/packs", label: "Packs", icon: Package, badge: "New" },
    { id: "saved", path: "/saved", label: "Saved", icon: BookOpen },
    { id: "pricing", path: "/pricing", label: "Pricing", icon: CreditCard },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center px-6 max-w-[1600px] mx-auto gap-8">
        
        {/* Logo Area */}
        <Link to="/" className="flex items-center gap-2 font-bold text-lg tracking-tight mr-4 hover:opacity-80 transition-opacity">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-primary-foreground">
            <Wand2 className="w-4 h-4" />
          </div>
          Terrivio
        </Link>

        {/* Main Nav Links */}
        <nav className="hidden md:flex items-center gap-1">
           {navItems.map((item) => (
              <Link
                key={item.id}
                to={item.path}
                className={cn(
                  "px-4 py-2 text-sm font-medium rounded-md transition-all flex items-center gap-2 relative group",
                  isActive(item.path)
                    ? "text-foreground font-bold" 
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                <item.icon className={cn("w-4 h-4", isActive(item.path) ? "text-primary" : "opacity-70 group-hover:opacity-100")} />
                {item.label}
                {item.badge && (
                  <span className="ml-1 text-[9px] uppercase font-bold tracking-wider bg-primary/10 text-primary border border-primary/20 px-1.5 py-px rounded-full">
                    {item.badge}
                  </span>
                )}
                {isActive(item.path) && (
                  <motion.div layoutId="activeNav" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
                )}
              </Link>
           ))}
        </nav>

        {/* Right Side Actions */}
        <div className="ml-auto flex items-center gap-4">
           
           {/* GUEST STATE */}
           {userState === 'guest' && (
             <div className="flex items-center gap-2">
               <Button variant="ghost" size="sm" asChild className="hidden md:flex">
                 <Link to="/signin">Sign In</Link>
               </Button>
               <Button size="sm" asChild>
                 <Link to="/signup">Get Started</Link>
               </Button>
             </div>
           )}

           {/* FREE STATE */}
           {userState === 'free' && (
             <>
               <div className="hidden md:flex items-center gap-3">
                  <div className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full border bg-muted text-muted-foreground border-border">
                    Free Plan
                  </div>
                  <Button size="sm" variant="default" className="font-bold shadow-lg shadow-primary/20" asChild>
                    <Link to="/pricing">Upgrade to Pro</Link>
                  </Button>
               </div>
               <div className="h-4 w-px bg-border mx-1 hidden md:block" />
             </>
           )}

           {/* PRO STATE */}
           {userState === 'pro' && (
             <>
               <div className="hidden md:flex items-center gap-3">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full border bg-amber-500/10 text-amber-600 border-amber-500/20">
                    <Sparkles className="w-3 h-3 fill-amber-500/20" />
                    Pro Plan
                  </div>
               </div>
               <div className="h-4 w-px bg-border mx-1 hidden md:block" />
             </>
           )}

           {/* USER MENU (Free & Pro only) */}
           {userState !== 'guest' && (
             <DropdownMenu>
               <DropdownMenuTrigger asChild>
                 <button className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-full border border-border bg-card hover:bg-muted/50 transition-all outline-none focus-visible:ring-2 focus-visible:ring-ring">
                   <div className={cn(
                     "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                     userState === 'pro' ? "bg-amber-500 text-amber-50" : "bg-primary/10 text-primary"
                   )}>
                      {userState === 'pro' ? "PRO" : "ME"}
                   </div>
                   <Settings className="w-4 h-4 text-muted-foreground mr-1" />
                 </button>
               </DropdownMenuTrigger>
               <DropdownMenuContent align="end" className="w-56">
                 <DropdownMenuLabel>My Account</DropdownMenuLabel>
                 <DropdownMenuSeparator />
                 <DropdownMenuItem asChild>
                   <Link to="/saved" className="cursor-pointer w-full flex items-center">
                     <BookOpen className="w-4 h-4 mr-2" />
                     Saved Prompts
                   </Link>
                 </DropdownMenuItem>
                 <DropdownMenuItem asChild>
                   <Link to="/generator" className="cursor-pointer w-full flex items-center">
                     <Terminal className="w-4 h-4 mr-2" />
                     Generator
                   </Link>
                 </DropdownMenuItem>
                 {userState === 'free' && (
                   <DropdownMenuItem asChild>
                     <Link to="/pricing" className="cursor-pointer w-full flex items-center text-amber-600 focus:text-amber-600">
                       <Sparkles className="w-4 h-4 mr-2" />
                       Upgrade to Pro
                     </Link>
                   </DropdownMenuItem>
                 )}
                 <DropdownMenuSeparator />
                 <DropdownMenuItem onClick={async () => await supabase.auth.signOut()} className="text-red-600 focus:text-red-600 cursor-pointer">
                   <LogOut className="w-4 h-4 mr-2" />
                   Log out
                 </DropdownMenuItem>
               </DropdownMenuContent>
             </DropdownMenu>
           )}
           
           {/* Mobile Menu Toggle */}
           <button className="md:hidden p-2 text-muted-foreground hover:bg-muted rounded-md">
              <Menu className="w-5 h-5" />
           </button>
        </div>
      </div>
    </header>
  );
}
