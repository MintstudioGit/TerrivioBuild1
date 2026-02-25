import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router";
import { Button } from "./ui/button";
import { useDesignContext } from "./DesignController";
import { projectId } from "../utils/supabase/info";
import {
  Building2,
  Lock,
  ArrowRight,
  Loader2,
  Save,
  Eye,
  AlertCircle,
  CheckCircle2,
  Image,
  Palette,
  Globe,
  EyeOff,
  Sparkles,
} from "lucide-react";

interface WhiteLabelConfig {
  companyName: string;
  logoUrl: string;
  accentColor: string;
  customDomain: string;
  hideBranding: boolean;
}

const DEFAULT_CONFIG: WhiteLabelConfig = {
  companyName: "",
  logoUrl: "",
  accentColor: "#7c3aed",
  customDomain: "",
  hideBranding: false,
};

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-a2b5dce9`;

export function WhiteLabelPage() {
  const { session, userState } = useDesignContext();
  const [config, setConfig] = useState<WhiteLabelConfig>(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState(false);

  const isAgency = userState === "agency";

  const fetchConfig = useCallback(async () => {
    if (!session || !isAgency) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/white-label`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.config) setConfig({ ...DEFAULT_CONFIG, ...data.config });
    } catch {
      // no-op, use defaults
    } finally {
      setLoading(false);
    }
  }, [session, isAgency]);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  const handleSave = async () => {
    if (!session) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/white-label`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ config }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        setError(data.error ?? "Failed to save settings.");
      }
    } catch {
      setError("Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  if (!isAgency) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 min-h-[50vh]">
        <div className="max-w-md text-center">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-5">
            <Lock className="w-8 h-8 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-bold mb-2">White-Label — Agency Plan</h2>
          <p className="text-muted-foreground mb-6 text-sm leading-relaxed">
            White-labelling is available exclusively on the Agency plan. Remove Terrivio branding, add your logo, and use your own domain on all exports and dashboards.
          </p>
          <Button asChild size="lg" className="font-bold">
            <Link to="/pricing">Upgrade to Agency <ArrowRight className="w-4 h-4 ml-2" /></Link>
          </Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 bg-background text-foreground">
      <main className="flex-grow w-full max-w-[900px] mx-auto px-6 py-12 md:py-16">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <Button variant="ghost" asChild>
            <Link to="/app">← App Hub</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/pricing">View Agency Plan</Link>
          </Button>
        </div>

        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-emerald-500" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight">White-Label Settings</h1>
            </div>
            <p className="text-muted-foreground text-sm max-w-lg">
              Customise how Terrivio appears to your clients. Changes affect exports, reports, and shared pipelines.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="shrink-0 gap-1.5"
            onClick={() => setPreviewMode(!previewMode)}
          >
            {previewMode ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            {previewMode ? "Hide preview" : "Preview"}
          </Button>
        </div>

        <div className={`grid gap-8 ${previewMode ? "lg:grid-cols-2" : "grid-cols-1"}`}>
          {/* Settings form */}
          <div className="space-y-6">

            {/* Company name */}
            <div className="p-5 rounded-xl border border-border bg-card">
              <label className="text-sm font-bold block mb-1 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                Company / Brand Name
              </label>
              <p className="text-xs text-muted-foreground mb-3">Replaces "Terrivio" in exports and reports.</p>
              <input
                type="text"
                placeholder="Your Company Name"
                value={config.companyName}
                onChange={(e) => setConfig((c) => ({ ...c, companyName: e.target.value }))}
                className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>

            {/* Logo URL */}
            <div className="p-5 rounded-xl border border-border bg-card">
              <label className="text-sm font-bold block mb-1 flex items-center gap-2">
                <Image className="w-4 h-4 text-primary" />
                Logo URL
              </label>
              <p className="text-xs text-muted-foreground mb-3">Direct link to your logo image (PNG, SVG, WebP). Recommended size: 200×48px.</p>
              <input
                type="url"
                placeholder="https://yourcompany.com/logo.png"
                value={config.logoUrl}
                onChange={(e) => setConfig((c) => ({ ...c, logoUrl: e.target.value }))}
                className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              {config.logoUrl && (
                <div className="mt-3 p-3 bg-muted rounded-lg flex items-center gap-3">
                  <img
                    src={config.logoUrl}
                    alt="Logo preview"
                    className="h-8 max-w-[140px] object-contain"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                  <span className="text-xs text-muted-foreground">Logo preview</span>
                </div>
              )}
            </div>

            {/* Accent colour */}
            <div className="p-5 rounded-xl border border-border bg-card">
              <label className="text-sm font-bold block mb-1 flex items-center gap-2">
                <Palette className="w-4 h-4 text-primary" />
                Brand Colour
              </label>
              <p className="text-xs text-muted-foreground mb-3">Used for buttons and highlights in branded exports.</p>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={config.accentColor}
                  onChange={(e) => setConfig((c) => ({ ...c, accentColor: e.target.value }))}
                  className="w-10 h-10 rounded-lg border border-border cursor-pointer bg-transparent"
                />
                <input
                  type="text"
                  value={config.accentColor}
                  onChange={(e) => setConfig((c) => ({ ...c, accentColor: e.target.value }))}
                  className="flex-1 px-3 py-2 text-sm font-mono rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                  maxLength={7}
                />
              </div>
            </div>

            {/* Custom domain */}
            <div className="p-5 rounded-xl border border-border bg-card">
              <label className="text-sm font-bold block mb-1 flex items-center gap-2">
                <Globe className="w-4 h-4 text-primary" />
                Custom Domain
              </label>
              <p className="text-xs text-muted-foreground mb-3">Appears in exported reports and share links. Contact us to fully configure DNS.</p>
              <input
                type="text"
                placeholder="prompts.yourcompany.com"
                value={config.customDomain}
                onChange={(e) => setConfig((c) => ({ ...c, customDomain: e.target.value }))}
                className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>

            {/* Hide branding */}
            <div className="p-5 rounded-xl border border-border bg-card">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-bold flex items-center gap-2">
                    <EyeOff className="w-4 h-4 text-primary" />
                    Hide Terrivio branding
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Removes "Powered by Terrivio" from all exports, reports, and shared pipelines.
                  </p>
                </div>
                <button
                  onClick={() => setConfig((c) => ({ ...c, hideBranding: !c.hideBranding }))}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors shrink-0 ${config.hideBranding ? "bg-primary" : "bg-muted-foreground/30"}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${config.hideBranding ? "translate-x-6" : "translate-x-1"}`} />
                </button>
              </div>
            </div>

            {/* Save */}
            <div className="flex items-center justify-between gap-4">
              <Button
                size="lg"
                className="font-bold gap-2 h-11"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {saving ? "Saving…" : "Save Settings"}
              </Button>
              {saved && (
                <div className="flex items-center gap-1.5 text-sm text-emerald-600 font-semibold">
                  <CheckCircle2 className="w-4 h-4" />
                  Saved successfully
                </div>
              )}
              {error && (
                <div className="flex items-center gap-1.5 text-sm text-destructive">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}
            </div>
          </div>

          {/* Preview panel */}
          {previewMode && (
            <div className="sticky top-6">
              <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-4">Export Preview</h3>
              <div className="rounded-xl border-2 border-dashed border-border bg-card overflow-hidden">
                {/* Mock export header */}
                <div className="p-4 border-b border-border" style={{ backgroundColor: config.accentColor + "15" }}>
                  <div className="flex items-center gap-3">
                    {config.logoUrl ? (
                      <img src={config.logoUrl} alt="logo" className="h-7 max-w-[120px] object-contain" />
                    ) : (
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                        style={{ backgroundColor: config.accentColor }}
                      >
                        {(config.companyName || "T").charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className="font-bold text-foreground">
                      {config.companyName || "Your Company"}
                    </span>
                  </div>
                </div>
                <div className="p-4 space-y-3">
                  <div className="text-sm font-bold text-foreground">Pipeline Report — Q4 Cold Outreach</div>
                  <div className="text-xs text-muted-foreground">Generated 47 prompts across 5 pipeline steps</div>
                  <div
                    className="h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold cursor-default"
                    style={{ backgroundColor: config.accentColor }}
                  >
                    View Full Report →
                  </div>
                  {!config.hideBranding && (
                    <div className="text-[10px] text-muted-foreground/50 text-center pt-1">Powered by Terrivio</div>
                  )}
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-3 text-center">Preview of how clients see shared reports</p>
            </div>
          )}
        </div>

      </main>
    </div>
  );
}
