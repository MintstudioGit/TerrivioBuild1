import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { cn } from "./ui/utils";
import { ShieldCheck, Lock, AlertCircle } from "lucide-react";
import svgPaths from "../imports/svg-vcs8woz1uw";
import { useDesignContext } from "./DesignController";
import { projectId } from "../utils/supabase/info";

// --- Theme ---

const theme = {
  card: "bg-card",
  radius: "rounded-lg",
  cardBorder: "border-border",
};

function GoogleIcon() {
  return (
    <div className="w-[18px] h-[18px] shrink-0">
      <svg className="block w-full h-full" fill="none" viewBox="0 0 17.16 18" xmlns="http://www.w3.org/2000/svg">
        <path d={svgPaths.p35e3a200} fill="currentColor" />
      </svg>
    </div>
  );
}

export function SignUpPage() {
  const { supabase } = useDesignContext();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // 1. Create user via Server (to auto-confirm email)
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-a2b5dce9/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name: email.split('@')[0] })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create account");
      }

      // 2. Sign In immediately
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (signInError) {
        throw signInError;
      }

      navigate("/saved");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    alert("Please enable Google Provider in Supabase Auth Settings to use this feature.");
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 font-sans text-foreground bg-background relative overflow-hidden min-h-screen">
      
      {/* Decorative Background Elements */}
      <div className="absolute top-1/4 right-10 hidden lg:block animate-pulse duration-[3000ms]">
          <div className="bg-primary/5 border border-primary/20 text-primary px-3 py-1.5 rounded-full text-xs font-mono transform rotate-12 shadow-sm">
            Zero Setup
          </div>
      </div>
      <div className="absolute bottom-1/3 left-10 hidden lg:block animate-pulse duration-[4000ms]">
          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 px-3 py-1.5 rounded-full text-xs font-mono transform -rotate-6 shadow-sm">
            €9 First Month
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
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-primary to-emerald-500/40"></div>
          
          <div className="p-8 sm:p-10 flex flex-col h-full relative">
            
            {/* Header Section */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted/50 border border-border text-xs font-medium text-muted-foreground mb-6">
                <Lock className="w-3 h-3 text-primary" />
                <span>Start Free</span>
              </div>
              
              <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">Create your account</h1>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Start your journey with unlimited access to top-tier prompts.
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
                <span className="bg-card px-2 text-muted-foreground opacity-70">Or</span>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSignUp} className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1" htmlFor="email">
                  Email address
                </label>
                <Input 
                  id="email" 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com" 
                  required
                  className={cn("h-11 bg-background shadow-sm border-border focus:border-primary transition-all rounded-lg")}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between ml-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground" htmlFor="password">
                    Password
                  </label>
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
                  {loading ? "Creating Account..." : "Create Account"}
                </Button>
              </div>
            </form>

            {/* Terms */}
            <div className="mt-6 text-center">
              <p className="text-xs text-muted-foreground leading-relaxed">
                By continuing, you agree to PromptVault's{" "}
                <a href="#" className="hover:text-foreground underline underline-offset-2">Terms of Service</a>
                {" "}and{" "}
                <a href="#" className="hover:text-foreground underline underline-offset-2">Privacy Policy</a>.
              </p>
            </div>

            {/* Footer */}
            <div className="mt-6 pt-6 border-t border-border/50 text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link to="/signin" className="font-bold text-foreground hover:text-primary transition-colors">
                Sign in
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
