import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Button } from "./ui/button";
import { CheckCircle2, ShieldCheck, CreditCard, Loader2 } from "lucide-react";
import { useDesignContext } from "./DesignController";
import { projectId } from "../utils/supabase/info";

export function UpgradePage() {
  const { session, userState, setUserState } = useDesignContext();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!session) {
      navigate("/signin?redirect=/upgrade");
    }
  }, [session, navigate]);

  const handleUpgrade = async () => {
    setLoading(true);
    
    // SIMULATED STRIPE CHECKOUT
    // In a real app, this would redirect to a Stripe Payment Link or Checkout Session
    
    setTimeout(async () => {
      if (session) {
        try {
          // Call backend to upgrade user (Simulating webhook success)
          await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-a2b5dce9/user-status`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${session.access_token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status: 'pro' })
          });
          
          setUserState('pro');
          alert("Upgrade successful! (Simulated)");
          navigate("/generator");
        } catch (e) {
          console.error("Upgrade failed", e);
          alert("Something went wrong. Please try again.");
        } finally {
          setLoading(false);
        }
      }
    }, 2000);
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 bg-muted/10 min-h-screen">
      <div className="w-full max-w-md bg-card border border-border rounded-xl shadow-2xl overflow-hidden">
        <div className="p-8 text-center space-y-6">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary animate-pulse">
            <CreditCard className="w-8 h-8" />
          </div>
          
          <div>
            <h1 className="text-2xl font-bold mb-2">Complete Your Upgrade</h1>
            <p className="text-muted-foreground">
              You are upgrading to <span className="font-bold text-foreground">Pro Plan</span>.
            </p>
          </div>

          <div className="bg-muted p-4 rounded-lg text-left space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Plan</span>
              <span className="font-bold">Pro Monthly</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Price</span>
              <span className="font-bold">€39.00 / month</span>
            </div>
            <div className="border-t border-border pt-2 flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Discount</span>
              <span className="text-emerald-600 font-bold">- €30.00 (First Month)</span>
            </div>
            <div className="border-t border-border pt-2 flex justify-between items-center font-bold text-lg">
              <span>Total</span>
              <span>€9.00</span>
            </div>
          </div>

          <div className="space-y-3">
             <Button 
               size="lg" 
               className="w-full font-bold h-12 gap-2" 
               onClick={handleUpgrade}
               disabled={loading}
             >
               {loading ? (
                 <>
                   <Loader2 className="w-4 h-4 animate-spin" />
                   Processing Payment...
                 </>
               ) : (
                 <>
                   <ShieldCheck className="w-4 h-4" />
                   Pay €9.00 & Upgrade
                 </>
               )}
             </Button>
             <p className="text-xs text-muted-foreground">
               Secure payment powered by Stripe (Simulated Mode)
             </p>
          </div>
        </div>
        <div className="bg-muted/50 p-4 text-center text-xs text-muted-foreground border-t border-border">
           <p>This is a demo environment. No real money will be charged.</p>
        </div>
      </div>
    </div>
  );
}
