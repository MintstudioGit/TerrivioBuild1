import { motion } from "motion/react";
import { Lock, Zap } from "lucide-react";
import { Link } from "react-router";
import { Button } from "../ui/button";

interface ActionLockModalProps {
  isOpen: boolean;
  onClose: () => void;
  action: string;
  description?: string;
}

export function ActionLockModal({ isOpen, onClose, action, description }: ActionLockModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-md bg-card border border-border rounded-xl shadow-2xl overflow-hidden"
      >
        <div className="p-6 text-center">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
            <Lock className="w-6 h-6" />
          </div>

          <h3 className="text-xl font-bold mb-2">Unlock {action}</h3>
          <p className="text-muted-foreground text-sm mb-6 max-w-xs mx-auto">
            {description || (
              <>
                Saved prompts become reusable systems. <br /> Upgrade to Pro to{" "}
                {action.toLowerCase()}.
              </>
            )}
          </p>

          <div className="space-y-3">
            <Button size="lg" className="w-full font-bold shadow-lg shadow-primary/20" asChild>
              <Link to="/pricing">Upgrade to Pro</Link>
            </Button>
            <p className="text-[10px] text-muted-foreground">
              €9 for your first 30 days. Cancel anytime.
            </p>
            <Button variant="ghost" size="sm" onClick={onClose} className="w-full">
              Maybe later
            </Button>
          </div>
        </div>

        <div className="bg-muted/30 px-6 py-3 border-t border-border flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <Zap className="w-3 h-3 text-amber-500" />
          <span>Pro: unlimited prompts, workflows, and exports.</span>
        </div>
      </motion.div>
    </div>
  );
}
