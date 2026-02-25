import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Send, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "./ui/utils";
import { projectId } from "../utils/supabase/info";

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-a2b5dce9`;

export function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to send message. Please try again.");
      }
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="container max-w-2xl mx-auto px-6 py-16 text-center">
        <div className="w-14 h-14 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-6 text-emerald-600">
          <CheckCircle2 className="w-7 h-7" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Message sent</h1>
        <p className="text-muted-foreground mb-8">
          Thanks for reaching out. We'll get back to you as soon as possible.
        </p>
        <Button variant="outline" onClick={() => { setSent(false); setName(""); setEmail(""); setMessage(""); }}>
          Send another message
        </Button>
      </div>
    );
  }

  return (
    <div className="container max-w-2xl mx-auto px-6 py-16">
      <h1 className="text-3xl font-bold mb-2">Contact us</h1>
      <p className="text-muted-foreground mb-10">
        Have a question or feedback? We'd love to hear from you.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="text-sm font-medium mb-2 block" htmlFor="name">Name</label>
          <Input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            required
            className="h-11"
          />
        </div>
        <div>
          <label className="text-sm font-medium mb-2 block" htmlFor="email">Email</label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            className="h-11"
          />
        </div>
        <div>
          <label className="text-sm font-medium mb-2 block" htmlFor="message">Message</label>
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="How can we help?"
            required
            rows={5}
            className={cn(
              "w-full rounded-md border border-input bg-input-background px-3 py-2 text-base",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              "placeholder:text-muted-foreground"
            )}
          />
        </div>

        {error && (
          <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md px-3 py-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        <Button type="submit" disabled={loading} className="gap-2">
          <Send className="w-4 h-4" />
          {loading ? "Sending..." : "Send message"}
        </Button>
      </form>

      <p className="mt-8 text-sm text-muted-foreground">
        For support, you can also email us at{" "}
        <a href="mailto:support@terrivio.com" className="text-primary hover:underline">support@terrivio.com</a>.
      </p>
    </div>
  );
}
