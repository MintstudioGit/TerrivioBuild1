import { Link } from "react-router";
import { Wand2, Twitter, Github, Linkedin, ShieldCheck } from "lucide-react";

export function GlobalFooter() {
  return (
    <footer className="border-t border-border/40 bg-background text-sm">
      <div className="mx-auto max-w-[1600px] px-6 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8">
          
          {/* Brand Column */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2 font-bold text-lg tracking-tight hover:opacity-80 transition-opacity">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-primary-foreground">
                <Wand2 className="w-4 h-4" />
              </div>
              Terrivio
            </Link>
            <p className="text-muted-foreground leading-relaxed max-w-xs">
              The professional prompt engineering platform for teams who need reliable, high-signal outputs.
            </p>
            <div className="flex gap-4 pt-2">
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <Twitter className="w-5 h-5" />
                <span className="sr-only">Twitter</span>
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <Github className="w-5 h-5" />
                <span className="sr-only">GitHub</span>
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <Linkedin className="w-5 h-5" />
                <span className="sr-only">LinkedIn</span>
              </a>
            </div>
          </div>

          {/* Product Column */}
          <div className="space-y-4">
            <h3 className="font-bold text-foreground">Product</h3>
            <ul className="space-y-3 text-muted-foreground">
              <li><Link to="/prompts" className="hover:text-foreground transition-colors">Directory</Link></li>
              <li><Link to="/app" className="hover:text-foreground transition-colors">App Hub</Link></li>
              <li><Link to="/generator" className="hover:text-foreground transition-colors">Prompt Generator</Link></li>
              <li><Link to="/pipeline" className="hover:text-foreground transition-colors">Pipeline Builder</Link></li>
              <li><Link to="/packs" className="hover:text-foreground transition-colors">Pack Builder</Link></li>
              <li><Link to="/marketplace" className="hover:text-foreground transition-colors">Marketplace</Link></li>
              <li><Link to="/pricing" className="hover:text-foreground transition-colors">Pricing</Link></li>
              <li><Link to="/analytics" className="hover:text-foreground transition-colors">Analytics</Link></li>
              <li><Link to="/integrations" className="hover:text-foreground transition-colors">Integrations</Link></li>
              <li><Link to="/api-keys" className="hover:text-foreground transition-colors">API Keys</Link></li>
              <li><Link to="/white-label" className="hover:text-foreground transition-colors">White Label</Link></li>
              <li><Link to="/mobile" className="hover:text-foreground transition-colors">Mobile App</Link></li>
              <li><Link to="/labs/sidebar" className="hover:text-foreground transition-colors">UI Lab</Link></li>
            </ul>
          </div>

          {/* Company Column */}
          <div className="space-y-4">
            <h3 className="font-bold text-foreground">Company</h3>
            <ul className="space-y-3 text-muted-foreground">
              <li><Link to="/about" className="hover:text-foreground transition-colors">About Us</Link></li>
              <li><Link to="/blog" className="hover:text-foreground transition-colors">Blog</Link></li>
              <li><Link to="/contact" className="hover:text-foreground transition-colors">Contact</Link></li>
            </ul>
          </div>

          {/* Legal Column */}
          <div className="space-y-4">
            <h3 className="font-bold text-foreground">Legal</h3>
            <ul className="space-y-3 text-muted-foreground">
              <li><Link to="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link></li>
              <li><Link to="/cookies" className="hover:text-foreground transition-colors">Cookie Policy</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border/40 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-muted-foreground text-xs">
            &copy; {new Date().getFullYear()} Terrivio. All rights reserved.
          </p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground/60">
             <ShieldCheck className="w-3 h-3" />
             <span>Secure & Encrypted</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
