import { useState, useMemo } from "react";
import { Link } from "react-router";
import { Button } from "./ui/button";
import { useDesignContext } from "./DesignController";
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Target,
  Users,
  Trophy,
  ArrowRight,
  Lock,
  Mail,
  MessageSquare,
  CalendarCheck,
  Handshake,
  ChevronRight,
  Info,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import { cn } from "./ui/utils";

// ── Funnel stage config ──────────────────────────────────────────────────────
const FUNNEL_STAGES = [
  { id: "generated", label: "Prompts Generated",  icon: Sparkles,       color: "text-violet-500", bg: "bg-violet-500/10", valuePerUnit: 0,    description: "Total prompts generated across all pipelines" },
  { id: "sent",      label: "Emails Sent",        icon: Mail,           color: "text-sky-500",    bg: "bg-sky-500/10",    valuePerUnit: 0,    description: "How many emails were actually sent using your prompts" },
  { id: "replies",   label: "Replies",            icon: MessageSquare,  color: "text-amber-500",  bg: "bg-amber-500/10",  valuePerUnit: 100,  description: "Replies received · estimated value €100/reply" },
  { id: "booked",    label: "Meetings Booked",    icon: CalendarCheck,  color: "text-emerald-500",bg: "bg-emerald-500/10",valuePerUnit: 500,  description: "Booked demos or discovery calls · est. value €500/meeting" },
  { id: "closed",    label: "Deals Closed",       icon: Handshake,      color: "text-primary",    bg: "bg-primary/10",    valuePerUnit: 2000, description: "Deals closed · est. value €2,000/deal (adjust below)" },
];

// ── Mock leaderboard data (top prompts) ──────────────────────────────────────
const MOCK_LEADERBOARD = [
  { rank: 1, title: "SaaS Outbound — Series B Hook",    replies: 12, booked: 5, roi: 3700, industry: "B2B SaaS"   },
  { rank: 2, title: "Enterprise Pain-Point Opener",     replies: 9,  booked: 3, roi: 2400, industry: "Enterprise" },
  { rank: 3, title: "Agency Pitch — Results First",     replies: 7,  booked: 4, roi: 2700, industry: "Agency"     },
  { rank: 4, title: "Inbound Re-engagement Sequence",   replies: 6,  booked: 2, roi: 1600, industry: "B2B SaaS"   },
  { rank: 5, title: "Contrarian Cold Opener",           replies: 5,  booked: 2, roi: 1500, industry: "E-commerce" },
];

// ── ROI calculator state ─────────────────────────────────────────────────────
interface FunnelValues { generated: number; sent: number; replies: number; booked: number; closed: number; }
interface RoiSettings  { replyValue: number; meetingValue: number; dealValue: number; }

function FunnelBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = max === 0 ? 0 : Math.min(100, (value / max) * 100);
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center text-xs">
        <span className="text-muted-foreground font-medium">{label}</span>
        <span className="font-bold text-foreground">{value.toLocaleString()}</span>
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-700", color.replace("text-", "bg-"))}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, sub, color, bg }: {
  icon: React.ElementType; label: string; value: string; sub?: string; color: string; bg: string;
}) {
  return (
    <div className="p-5 rounded-xl border border-border bg-card">
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center", bg, color)}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="text-2xl font-extrabold text-foreground tracking-tight">{value}</div>
      <div className="text-sm font-semibold text-muted-foreground mt-0.5">{label}</div>
      {sub && <div className="text-xs text-muted-foreground/70 mt-1">{sub}</div>}
    </div>
  );
}

export function AdvancedAnalyticsPage() {
  const { userState } = useDesignContext();

  const isPro = userState === "pro" || userState === "team" || userState === "agency";

  const [funnel, setFunnel] = useState<FunnelValues>({ generated: 0, sent: 0, replies: 0, booked: 0, closed: 0 });
  const [settings, setSettings] = useState<RoiSettings>({ replyValue: 100, meetingValue: 500, dealValue: 2000 });
  const [showSettings, setShowSettings] = useState(false);

  const roi = useMemo(() => {
    return (funnel.replies * settings.replyValue) + (funnel.booked * settings.meetingValue) + (funnel.closed * settings.dealValue);
  }, [funnel, settings]);

  const replyRate    = funnel.sent    > 0 ? ((funnel.replies / funnel.sent)    * 100).toFixed(1) : "—";
  const bookingRate  = funnel.replies > 0 ? ((funnel.booked  / funnel.replies) * 100).toFixed(1) : "—";
  const closeRate    = funnel.booked  > 0 ? ((funnel.closed  / funnel.booked)  * 100).toFixed(1) : "—";

  const handleFunnelChange = (id: string, raw: string) => {
    const val = Math.max(0, parseInt(raw) || 0);
    setFunnel((prev) => ({ ...prev, [id]: val }));
  };

  if (!isPro) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 min-h-[50vh]">
        <div className="max-w-md text-center">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-5">
            <Lock className="w-8 h-8 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Advanced Analytics — Pro</h2>
          <p className="text-muted-foreground mb-6 text-sm leading-relaxed">
            Track real conversion from prompt to closed deal, calculate pipeline ROI, and see which prompts perform best. Available on Pro and above.
          </p>
          <Button asChild size="lg" className="font-bold">
            <Link to="/pricing">Upgrade to Pro <ArrowRight className="w-4 h-4 ml-2" /></Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 bg-background text-foreground">
      <main className="flex-grow w-full max-w-[1100px] mx-auto px-6 py-12 md:py-16">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <Button variant="ghost" asChild>
            <Link to="/app">← App Hub</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/pipeline">View Pipeline Results</Link>
          </Button>
        </div>

        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-primary" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Advanced Analytics</h1>
          </div>
          <p className="text-muted-foreground text-sm max-w-lg">
            Track full-funnel conversion from prompts generated to deals closed. Calculate real ROI from your pipeline activity.
          </p>
        </div>

        {/* Summary stat cards */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <StatCard
            icon={TrendingUp}
            label="Total ROI"
            value={roi > 0 ? `€${roi.toLocaleString()}` : "€0"}
            sub="from pipeline activity"
            color="text-emerald-500"
            bg="bg-emerald-500/10"
          />
          <StatCard
            icon={MessageSquare}
            label="Reply Rate"
            value={replyRate === "—" ? "—" : `${replyRate}%`}
            sub="sent → reply"
            color="text-amber-500"
            bg="bg-amber-500/10"
          />
          <StatCard
            icon={CalendarCheck}
            label="Booking Rate"
            value={bookingRate === "—" ? "—" : `${bookingRate}%`}
            sub="reply → meeting"
            color="text-sky-500"
            bg="bg-sky-500/10"
          />
          <StatCard
            icon={Target}
            label="Close Rate"
            value={closeRate === "—" ? "—" : `${closeRate}%`}
            sub="meeting → deal"
            color="text-primary"
            bg="bg-primary/10"
          />
        </section>

        <div className="grid lg:grid-cols-2 gap-8 mb-10">

          {/* ROI Calculator — Funnel inputs */}
          <div className="p-6 rounded-2xl border border-border bg-card">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-bold">Conversion Funnel</h2>
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Adjust values
              </button>
            </div>

            {showSettings && (
              <div className="mb-5 p-4 rounded-xl bg-muted/40 border border-border grid grid-cols-3 gap-3">
                {[
                  { key: "replyValue", label: "€ per reply" },
                  { key: "meetingValue", label: "€ per meeting" },
                  { key: "dealValue", label: "€ per deal" },
                ].map(({ key, label }) => (
                  <div key={key}>
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide block mb-1">{label}</label>
                    <input
                      type="number"
                      min={0}
                      value={(settings as any)[key]}
                      onChange={(e) => setSettings((s) => ({ ...s, [key]: parseInt(e.target.value) || 0 }))}
                      className="w-full px-2 py-1.5 text-sm rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary/30"
                    />
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-5">
              {FUNNEL_STAGES.map((stage, idx) => (
                <div key={stage.id}>
                  <div className="flex items-center gap-2 mb-2">
                    <div className={cn("w-6 h-6 rounded-md flex items-center justify-center", stage.bg)}>
                      <stage.icon className={cn("w-3.5 h-3.5", stage.color)} />
                    </div>
                    <label className="text-sm font-semibold text-foreground">{stage.label}</label>
                    <div className="group relative ml-auto">
                      <Info className="w-3.5 h-3.5 text-muted-foreground/50 cursor-help" />
                      <div className="absolute right-0 top-5 w-56 p-2.5 rounded-lg bg-card border border-border text-xs text-muted-foreground shadow-lg hidden group-hover:block z-10 leading-relaxed">
                        {stage.description}
                      </div>
                    </div>
                  </div>
                  <input
                    type="number"
                    min={0}
                    value={funnel[stage.id as keyof FunnelValues] || ""}
                    onChange={(e) => handleFunnelChange(stage.id, e.target.value)}
                    placeholder="0"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                  {idx < FUNNEL_STAGES.length - 1 && (
                    <div className="flex justify-center mt-2">
                      <ChevronRight className="w-4 h-4 text-border rotate-90" />
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-border">
              <div className="flex justify-between items-center">
                <span className="font-bold text-foreground">Estimated Pipeline ROI</span>
                <span className={cn("text-2xl font-extrabold tracking-tight", roi > 0 ? "text-emerald-500" : "text-muted-foreground")}>
                  {roi > 0 ? `€${roi.toLocaleString()}` : "€0"}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Based on {funnel.replies} replies · {funnel.booked} meetings · {funnel.closed} deals
              </p>
            </div>
          </div>

          {/* Funnel visualisation */}
          <div className="p-6 rounded-2xl border border-border bg-card">
            <h2 className="text-base font-bold mb-6">Funnel Breakdown</h2>
            <div className="space-y-4">
              {FUNNEL_STAGES.map((stage) => (
                <FunnelBar
                  key={stage.id}
                  label={stage.label}
                  value={funnel[stage.id as keyof FunnelValues]}
                  max={funnel.generated || 1}
                  color={stage.color}
                />
              ))}
            </div>
            <div className="mt-6 pt-4 border-t border-border grid grid-cols-3 gap-3 text-center">
              <div>
                <div className="text-lg font-extrabold text-amber-500">{replyRate === "—" ? "—" : `${replyRate}%`}</div>
                <div className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">Reply rate</div>
              </div>
              <div>
                <div className="text-lg font-extrabold text-sky-500">{bookingRate === "—" ? "—" : `${bookingRate}%`}</div>
                <div className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">Booking rate</div>
              </div>
              <div>
                <div className="text-lg font-extrabold text-primary">{closeRate === "—" ? "—" : `${closeRate}%`}</div>
                <div className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">Close rate</div>
              </div>
            </div>
          </div>
        </div>

        {/* Top prompt leaderboard */}
        <div className="p-6 rounded-2xl border border-border bg-card mb-8">
          <div className="flex items-center gap-2 mb-5">
            <Trophy className="w-5 h-5 text-amber-500" />
            <h2 className="text-base font-bold">Top Performing Prompts</h2>
            <span className="ml-auto text-xs text-muted-foreground">Sample data — connect your outcomes above</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="pb-3 font-bold text-muted-foreground text-xs uppercase tracking-wide">#</th>
                  <th className="pb-3 font-bold text-muted-foreground text-xs uppercase tracking-wide">Prompt</th>
                  <th className="pb-3 font-bold text-muted-foreground text-xs uppercase tracking-wide hidden sm:table-cell">Industry</th>
                  <th className="pb-3 font-bold text-muted-foreground text-xs uppercase tracking-wide text-center">Replies</th>
                  <th className="pb-3 font-bold text-muted-foreground text-xs uppercase tracking-wide text-center">Meetings</th>
                  <th className="pb-3 font-bold text-muted-foreground text-xs uppercase tracking-wide text-right">ROI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {MOCK_LEADERBOARD.map((row) => (
                  <tr key={row.rank} className="hover:bg-muted/20 transition-colors">
                    <td className="py-3 pr-4">
                      <span className={cn(
                        "w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-extrabold inline-flex",
                        row.rank === 1 ? "bg-amber-400/20 text-amber-600" :
                        row.rank === 2 ? "bg-muted text-muted-foreground" :
                        "text-muted-foreground/50"
                      )}>
                        {row.rank}
                      </span>
                    </td>
                    <td className="py-3 font-medium text-foreground max-w-[200px] truncate">{row.title}</td>
                    <td className="py-3 text-muted-foreground hidden sm:table-cell">{row.industry}</td>
                    <td className="py-3 text-center font-medium">{row.replies}</td>
                    <td className="py-3 text-center font-medium">{row.booked}</td>
                    <td className="py-3 text-right font-bold text-emerald-500">€{row.roi.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 pt-4 border-t border-border text-center">
            <p className="text-xs text-muted-foreground mb-3">Connect real outcomes by marking prompts as used and logging results in your Saved Prompts library.</p>
            <Button asChild size="sm" variant="outline" className="font-semibold gap-1.5">
              <Link to="/saved">Go to Saved Prompts <ArrowRight className="w-3.5 h-3.5" /></Link>
            </Button>
          </div>
        </div>

        {/* Team plan upsell */}
        {userState === "pro" && (
          <div className="p-6 rounded-2xl border border-dashed border-primary/30 bg-primary/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <Users className="w-5 h-5 text-primary mt-0.5 shrink-0" />
              <div>
                <p className="font-bold text-foreground">Team Leaderboards — Team Plan</p>
                <p className="text-sm text-muted-foreground">Compare performance across your whole team. See who's generating the highest-ROI prompts.</p>
              </div>
            </div>
            <Button asChild size="sm" className="font-bold shrink-0">
              <Link to="/pricing">Upgrade to Team</Link>
            </Button>
          </div>
        )}

      </main>
    </div>
  );
}
