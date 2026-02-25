import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router";
import { Button } from "./ui/button";
import { useDesignContext } from "./DesignController";
import { projectId } from "../utils/supabase/info";
import {
  Key,
  Plus,
  Trash2,
  Copy,
  Check,
  Loader2,
  AlertCircle,
  Code2,
  Lock,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";
import { cn } from "./ui/utils";

interface ApiKey {
  id: string;
  name: string;
  prefix: string;
  createdAt: string;
  lastUsed: string | null;
}

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-a2b5dce9`;

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <button
      onClick={handleCopy}
      className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
      title="Copy"
    >
      {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  );
}

export function APIKeysPage() {
  const { session, userState } = useDesignContext();
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [revealedKey, setRevealedKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [revoking, setRevoking] = useState<string | null>(null);

  const isPro = userState === "pro" || userState === "team" || userState === "agency";

  const fetchKeys = useCallback(async () => {
    if (!session || !isPro) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api-keys`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const data = await res.json().catch(() => ({ keys: [] }));
      setKeys(data.keys ?? []);
    } catch {
      setError("Failed to load API keys.");
    } finally {
      setLoading(false);
    }
  }, [session, isPro]);

  useEffect(() => {
    fetchKeys();
  }, [fetchKeys]);

  const handleCreate = async () => {
    if (!session || !newKeyName.trim()) return;
    setCreating(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api-keys`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: newKeyName.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.key) {
        setRevealedKey(data.key);
        setNewKeyName("");
        await fetchKeys();
      } else {
        setError(data.error ?? "Failed to create key.");
      }
    } catch {
      setError("Failed to create key.");
    } finally {
      setCreating(false);
    }
  };

  const handleRevoke = async (id: string) => {
    if (!session) return;
    setRevoking(id);
    try {
      await fetch(`${API_BASE}/api-keys/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      setKeys((prev) => prev.filter((k) => k.id !== id));
    } catch {
      setError("Failed to revoke key.");
    } finally {
      setRevoking(null);
    }
  };

  if (!isPro) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 min-h-[50vh]">
        <div className="max-w-md text-center">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-5">
            <Lock className="w-8 h-8 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-bold mb-2">API Keys — Team Plan</h2>
          <p className="text-muted-foreground mb-6 text-sm leading-relaxed">
            The Pipeline API is available on Team and Agency plans. Generate API keys to run prompts programmatically from your CRM, scripts, or integrations.
          </p>
          <Button asChild size="lg" className="font-bold">
            <Link to="/pricing">Upgrade to Team <ArrowRight className="w-4 h-4 ml-2" /></Link>
          </Button>
        </div>
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
            <Link to="/integrations">View Integrations</Link>
          </Button>
        </div>

        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <Key className="w-5 h-5 text-primary" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">API Keys</h1>
          </div>
          <p className="text-muted-foreground text-sm max-w-lg">
            Generate keys to authenticate Pipeline API requests from your code, automations, or CRM integrations.
          </p>
        </div>

        {/* Revealed new key */}
        {revealedKey && (
          <div className="mb-8 p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                  <p className="text-sm font-bold text-emerald-700">Copy your key now — it won't be shown again</p>
                </div>
                <code className="text-xs font-mono text-foreground break-all">{revealedKey}</code>
              </div>
              <div className="flex gap-1 shrink-0">
                <CopyButton text={revealedKey} />
                <button
                  onClick={() => setRevealedKey(null)}
                  className="p-1.5 text-muted-foreground hover:text-foreground"
                >✕</button>
              </div>
            </div>
          </div>
        )}

        {/* Create new key */}
        <div className="mb-8 p-5 rounded-xl border border-border bg-card">
          <h2 className="text-sm font-bold mb-3">Create New Key</h2>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Key name (e.g. CRM Integration)"
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              className="flex-1 px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <Button
              size="sm"
              className="h-9 font-semibold gap-1.5"
              onClick={handleCreate}
              disabled={creating || !newKeyName.trim()}
            >
              {creating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
              Generate
            </Button>
          </div>
          {error && (
            <p className="mt-2 text-xs text-destructive flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" /> {error}
            </p>
          )}
        </div>

        {/* Keys table */}
        <div className="mb-12">
          <h2 className="text-sm font-bold mb-3">Your Keys</h2>
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : keys.length === 0 ? (
            <div className="py-10 text-center text-muted-foreground border border-border rounded-xl bg-muted/20">
              <Key className="w-10 h-10 mx-auto mb-3 opacity-20" />
              <p className="text-sm">No API keys yet. Create one above.</p>
            </div>
          ) : (
            <div className="rounded-xl border border-border overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left px-5 py-3 font-bold text-muted-foreground">Name</th>
                    <th className="text-left px-5 py-3 font-bold text-muted-foreground">Key</th>
                    <th className="text-left px-5 py-3 font-bold text-muted-foreground">Created</th>
                    <th className="text-left px-5 py-3 font-bold text-muted-foreground">Last used</th>
                    <th className="px-5 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {keys.map((k) => (
                    <tr key={k.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-5 py-3 font-medium text-foreground">{k.name}</td>
                      <td className="px-5 py-3">
                        <code className="text-xs text-muted-foreground font-mono">{k.prefix}••••••••</code>
                      </td>
                      <td className="px-5 py-3 text-muted-foreground text-xs">{new Date(k.createdAt).toLocaleDateString()}</td>
                      <td className="px-5 py-3 text-muted-foreground text-xs">
                        {k.lastUsed ? new Date(k.lastUsed).toLocaleDateString() : "Never"}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <button
                          onClick={() => handleRevoke(k.id)}
                          disabled={revoking === k.id}
                          className={cn(
                            "flex items-center gap-1.5 text-xs font-semibold text-destructive hover:opacity-70 transition-opacity",
                            revoking === k.id && "opacity-50 cursor-not-allowed"
                          )}
                        >
                          {revoking === k.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                          Revoke
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Code example */}
        <div className="rounded-xl border border-border overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-3 bg-muted/40 border-b border-border">
            <Code2 className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-bold">API Usage Example</span>
          </div>
          <div className="p-5 bg-card">
            <p className="text-xs text-muted-foreground mb-3">Run a pipeline via the API:</p>
            <pre className="text-xs font-mono text-foreground bg-muted p-4 rounded-lg overflow-x-auto leading-relaxed whitespace-pre">{`curl -X POST \\
  https://${projectId}.supabase.co/functions/v1/make-server-a2b5dce9/pipeline/run \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "packId": "saas-outbound",
    "rows": [
      { "company": "Acme Corp", "role": "Head of Sales", "pain": "slow pipeline" }
    ]
  }'`}</pre>
            <p className="text-xs text-muted-foreground mt-3">Response includes generated prompts for each pipeline step.</p>
          </div>
        </div>

      </main>
    </div>
  );
}
