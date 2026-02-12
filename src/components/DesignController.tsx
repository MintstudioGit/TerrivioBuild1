import React, { createContext, useContext, useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Settings2, User, UserCheck, UserX, X, LayoutTemplate, LogOut } from "lucide-react";
import { cn } from "./ui/utils";
import { createClient } from "@supabase/supabase-js";
import { projectId, publicAnonKey } from "../utils/supabase/info";

// --- Types ---

export type UserState = 'guest' | 'free' | 'pro';

interface DesignContextType {
  userState: UserState;
  setUserState: (state: UserState) => void;
  showController: boolean;
  setShowController: (show: boolean) => void;
  session: any;
  supabase: any;
  isInitialized: boolean;
}

// --- Context ---

const DesignContext = createContext<DesignContextType | undefined>(undefined);

export const useDesignContext = () => {
  const context = useContext(DesignContext);
  if (!context) {
    throw new Error("useDesignContext must be used within a DesignProvider");
  }
  return context;
};

// Initialize Supabase Client
const supabase = createClient(`https://${projectId}.supabase.co`, publicAnonKey);

// --- Provider ---

export function DesignProvider({ children }: { children: React.ReactNode }) {
  const [userState, setUserState] = useState<UserState>('guest');
  const [showController, setShowController] = useState(true);
  const [session, setSession] = useState<any>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      if (session) {
        try {
          // Fetch real status from backend (simulating webhook source-of-truth)
          const res = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-a2b5dce9/user-status`, {
            headers: { 'Authorization': `Bearer ${session.access_token}` }
          });
          const { status } = await res.json();
          setUserState(status || 'free');
        } catch (e) {
          console.error("Failed to sync user status", e);
          setUserState('free');
        }
      } else {
        setUserState('guest');
      }
      setIsInitialized(true);
    });

    // Listen for changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      if (session) {
         try {
          const res = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-a2b5dce9/user-status`, {
            headers: { 'Authorization': `Bearer ${session.access_token}` }
          });
          const { status } = await res.json();
          setUserState(status || 'free');
        } catch (e) {
          setUserState('free');
        }
      } else {
        setUserState('guest');
      }
      setIsInitialized(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <DesignContext.Provider value={{ userState, setUserState, showController, setShowController, session, supabase, isInitialized }}>
      {children}
      {/* Dev Controller hidden for production */}
      {showController && <DesignController />}
    </DesignContext.Provider>
  );
}

// --- Controller UI Component ---

function DesignController() {
  const { userState, setUserState, setShowController, session, supabase } = useDesignContext();
  const [isExpanded, setIsExpanded] = useState(false);

  // Helper to persist state (simulating admin/webhook action)
  const handleStateChange = async (newState: UserState) => {
    setUserState(newState);
    
    // Only persist if logged in (Guest state is just UI simulation otherwise)
    if (session && newState !== 'guest') {
      try {
        await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-a2b5dce9/user-status`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ status: newState })
        });
      } catch (e) {
        console.error("Failed to persist status", e);
      }
    }
  };

  // Keyboard shortcut to toggle controller visibility (Ctrl + Shift + D)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        setShowController(false); // Can only hide via shortcut if focused, but mainly for dev use
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setShowController]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  if (!isExpanded) {
    return (
      <div className="fixed bottom-4 right-4 z-[100]">
        <Button 
          size="icon" 
          variant="outline" 
          className="h-10 w-10 rounded-full shadow-xl bg-background border-primary/20 hover:border-primary"
          onClick={() => setIsExpanded(true)}
          title="Open Design Controller"
        >
          <Settings2 className="h-5 w-5 text-primary" />
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-[100] w-72 bg-card border border-border shadow-2xl rounded-xl animate-in slide-in-from-bottom-5 fade-in duration-200 overflow-hidden">
      
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-muted/50 border-b border-border">
        <div className="flex items-center gap-2">
          <LayoutTemplate className="w-4 h-4 text-primary" />
          <span className="text-sm font-bold">Design Controller</span>
        </div>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setIsExpanded(false)}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        
        {/* User State Switcher (Manual override for testing Pro UI) */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Simulate State</label>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handleStateChange('guest')}
              className={cn(
                "flex flex-col items-center justify-center gap-1 p-2 rounded-lg border transition-all text-xs font-medium",
                userState === 'guest' 
                  ? "bg-primary/10 border-primary text-primary ring-1 ring-primary/20" 
                  : "bg-background border-border hover:bg-muted text-muted-foreground hover:text-foreground"
              )}
            >
              <UserX className="w-4 h-4 mb-1" />
              Guest
            </button>
            
            <button
              onClick={() => handleStateChange('free')}
              className={cn(
                "flex flex-col items-center justify-center gap-1 p-2 rounded-lg border transition-all text-xs font-medium",
                userState === 'free' 
                  ? "bg-primary/10 border-primary text-primary ring-1 ring-primary/20" 
                  : "bg-background border-border hover:bg-muted text-muted-foreground hover:text-foreground"
              )}
            >
              <User className="w-4 h-4 mb-1" />
              Free
            </button>

            <button
              onClick={() => handleStateChange('pro')}
              className={cn(
                "flex flex-col items-center justify-center gap-1 p-2 rounded-lg border transition-all text-xs font-medium",
                userState === 'pro' 
                  ? "bg-primary/10 border-primary text-primary ring-1 ring-primary/20" 
                  : "bg-background border-border hover:bg-muted text-muted-foreground hover:text-foreground"
              )}
            >
              <UserCheck className="w-4 h-4 mb-1" />
              Pro
            </button>
          </div>
        </div>

        {/* Auth Status */}
        <div className="text-xs bg-muted/30 p-2 rounded border border-border/50 flex items-center justify-between">
           <span className="text-muted-foreground">
             {session ? `Logged in as ${session.user.email}` : "Not logged in"}
           </span>
           {session && (
             <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleSignOut}>
               <LogOut className="w-3 h-3" />
             </Button>
           )}
        </div>

        {/* Info / Description */}
        <div className="text-[10px] text-muted-foreground bg-muted/30 p-2 rounded border border-border/50">
          <p>
            <strong>Guest:</strong> Not logged in. Restricted access.<br/>
            <strong>Free:</strong> Logged in. Basic features. Upgrade CTAs.<br/>
            <strong>Pro:</strong> Paid plan. Full features. No ads.
          </p>
        </div>

      </div>
    </div>
  );
}
