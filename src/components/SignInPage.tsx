import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { cn } from "./ui/utils";
import { ShieldCheck, Lock, AlertCircle } from "lucide-react";
import svgPaths from "../imports/svg-38ut0vjqbn";
import { useDesignContext } from "./DesignController";

// --- Theme ---

const theme = {
  card: "bg-card",
  radius: "rounded-lg",
  cardBorder: "border-border",
};

function GoogleIcon() {
  return (
    <div className="w-[18px] h-[18px] shrink-0">
      <svg className="block w-full h-full" fill="none" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
        <path d={svgPaths.p35e3a200} fill="currentColor" />
      </svg>
    </div>
  );
}

export function SignInPage() {
  const { supabase } = useDesignContext();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get("redirect") || "/generator";
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      navigate(redirect);
    }
  };

  const handleGoogleSignIn = async () => {
    // Instructions for user to set up Google Auth
    alert("Please enable Google Provider in Supabase Auth Settings to use this feature.");
    // const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 font-sans text-foreground bg-background relative overflow-hidden min-h-screen">
      
      {/* Decorative Background Elements */}
      <div className="absolute top-1/4 left-10 hidden lg:block animate-pulse duration-[3000ms]">
          <div className="bg-primary/5 border border-primary/20 text-primary px-3 py-1.5 rounded-full text-xs font-mono transform -rotate-12 shadow-sm">
            Secure Access
          </div>
      </div>
      <div className="absolute bottom-1/3 right-10 hidden lg:block animate-pulse duration-[4000ms]">
          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 px-3 py-1.5 rounded-full text-xs font-mono transform rotate-6 shadow-sm">
            Encrypted
          </div>
      </div>

      <div className="w-full max-w-md relative z-10">
        
        <div className={cn(
            "group relative flex flex-col w-full overflow-hidden transition-all duration-500", 
            theme.card, 
            theme.radius,
            theme.cardBorder + " border",
            "shadow-2xl shadow-primary/5"
        )}>
          {/* Decorative top bar gradient */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary via-purple-500 to-primary/40"></div>
          
          <div className="p-8 sm:p-10 flex flex-col h-full relative">
            
            {/* Header Section */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted/50 border border-border text-xs font-medium text-muted-foreground mb-6">
                <Lock className="w-3 h-3 text-primary" />
                <span>Secure Login</span>
              </div>
              
              <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">Welcome back</h1>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Enter your credentials to access your workspace.
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            {/* Social Auth */}
            <Button 
              variant="outline" 
              onClick={handleGoogleSignIn}
              className={cn("w-full h-11 gap-3 font-medium bg-background hover:bg-muted/50 text-foreground border-input mb-6 transition-all", theme.radius)}
            >
              <GoogleIcon />
              Continue with Google
            </Button>

            {/* Divider */}
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase tracking-widest font-semibold">
                <span className="bg-card px-2 text-muted-foreground opacity-70">Or continue with</span>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSignIn} className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1" htmlFor="email">
                  Email
                </label>
                <Input 
                  id="email" 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com" 
                  required
                  className={cn("h-11 bg-background shadow-sm border-border focus:border-primary transition-all rounded-lg")}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between ml-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground" htmlFor="password">
                    Password
                  </label>
                  <Link 
                    to="/forgot-password" 
                    className="text-xs font-medium text-primary hover:text-primary/80 hover:underline underline-offset-4"
                  >
                    Forgot password?
                  </Link>
                </div>
                <Input 
                  id="password" 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••" 
                  required
                  className={cn("h-11 bg-background shadow-sm border-border focus:border-primary transition-all rounded-lg")}
                />
              </div>

              <div className="space-y-3 pt-4">
                <Button 
                  type="submit" 
                  disabled={loading}
                  className={cn("w-full h-12 text-base font-bold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all hover:scale-[1.02]", theme.radius)}
                >
                  {loading ? "Signing In..." : "Sign In"}
                </Button>
              </div>
            </form>

            {/* Footer */}
            <div className="mt-8 pt-6 border-t border-border/50 text-center text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link to="/signup" className="font-bold text-foreground hover:text-primary transition-colors">
                Start your 30-day trial
              </Link>
            </div>
          </div>
        </div>

        {/* Security Badge */}
        <div className="mt-8 flex items-center justify-center gap-2 text-[10px] text-muted-foreground uppercase tracking-widest font-semibold opacity-60">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>256-bit Secure Connection</span>
        </div>

      </div>
    </div>
  );
}
