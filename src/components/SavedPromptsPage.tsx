import { useState, useMemo, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useDesignContext } from "./DesignController";
import { projectId } from "../utils/supabase/info";
import { Link } from "react-router";
import {
  Search,
  ArrowRight,
  Bookmark,
  FileText,
  X,
  Copy,
  LayoutGrid,
  List,
  Plus,
  Trash2,
  Edit3,
  Save,
  Zap,
  Lock,
  CloudOff,
  Clock,
  RotateCcw,
  History,
  BarChart3,
  Trophy,
  DollarSign,
  MessageCircle,
  Calendar,
  Lightbulb,
  ArrowUpRight,
  Factory,
  Briefcase,
  Filter,
  MoreHorizontal
} from "lucide-react";
import { cn } from "./ui/utils";
import { motion, AnimatePresence } from "motion/react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

// --- Types ---

interface SavedPrompt {
  id: string;
  title: string;
  content: string;
  badge: string;
  uses: number;
  tags: string[];
  rating: string;
  author: string;
  verified: boolean;
  description: string;
  lastModified: number;
  userId?: string;
  outcomes?: any[];
  industry?: string;
  role?: string;
  useCase?: string;
}

interface HistoryItem {
  id: number;
  title: string;
  date: string;
  type: string;
  content: string;
  model: string;
}

// --- Mock Data ---

const GUEST_PROMPTS: SavedPrompt[] = [
  {
    id: "guest-1",
    title: "Cold Outreach: SaaS Decision Maker",
    content: "Act as a B2B Sales Expert. Write a cold email to a SaaS CTO about our new developer tool. Focus on pain points around technical debt and scaling. Keep it under 150 words.",
    badge: "High-Conversion",
    uses: 1240,
    tags: ["Sales", "B2B", "Email"],
    rating: "4.9",
    author: "GrowthGuru",
    verified: true,
    description: "A highly optimized cold email framework designed to engage C-level executives in SaaS companies. Focuses on pain points and value prop.",
    lastModified: Date.now() - 10000000
  },
  {
    id: "guest-2",
    title: "Code: React Component Expert",
    content: "You are an expert React developer. Create a reusable Button component using TypeScript and Tailwind CSS. It should support variants (primary, secondary, ghost) and sizes (sm, md, lg). Ensure accessibility attributes are included.",
    badge: "Clean Code",
    uses: 8500,
    tags: ["Development", "React", "TypeScript"],
    rating: "4.9",
    author: "DevWizard",
    verified: true,
    description: "Generates production-ready, accessible, and typed React components with Tailwind CSS. Follows best practices and includes tests.",
    lastModified: Date.now() - 5000000
  }
];

const HISTORY_ITEMS: HistoryItem[] = [
  { id: 1, title: "SaaS Cold Email Sequence", date: "2 hours ago", type: "Sales", content: "Write a cold email...", model: "GPT-4" },
  { id: 2, title: "React Button Component", date: "Yesterday", type: "Development", content: "Create a button...", model: "Claude 3.5" },
  { id: 3, title: "SEO Blog Post Outline", date: "2 days ago", type: "Content", content: "Outline for SEO...", model: "GPT-4" },
  { id: 4, title: "LinkedIn Viral Post", date: "3 days ago", type: "Marketing", content: "Post about AI...", model: "GPT-4" },
  { id: 5, title: "Postgres Migration Script", date: "5 days ago", type: "Development", content: "Select * from...", model: "Claude 3.5" },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

// --- Components ---

function StatCard({ title, value, icon: Icon, description, trend, className }: any) {
  return (
    <div className={cn("p-6 rounded-2xl border border-border bg-card shadow-[0_2px_10px_-2px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_20px_-4px_rgba(0,0,0,0.1)] transition-all duration-300 group", className)}>
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 rounded-xl bg-primary/5 text-primary group-hover:bg-primary/10 transition-colors">
          <Icon className="w-5 h-5" />
        </div>
        {trend && (
          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
            {trend}
          </span>
        )}
      </div>
      <div>
        <h3 className="text-3xl font-bold tracking-tight mb-1 text-foreground">{value}</h3>
        <p className="font-medium text-foreground/80 mb-1">{title}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

function PromptCard({ 
  prompt, 
  onView, 
  onDelete 
}: { 
  prompt: SavedPrompt, 
  onView: (prompt: SavedPrompt) => void,
  onDelete: (id: string) => void
}) {
  return (
    <motion.div 
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      onClick={() => onView(prompt)}
      className="group relative flex flex-col h-full bg-card border border-border rounded-2xl overflow-hidden cursor-pointer shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:border-primary/30 transition-all duration-300"
    >
       {/* Decorative Gradient Header */}
       <div className="h-2 bg-gradient-to-r from-primary/20 via-primary/40 to-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
       
       <div className="p-6 flex flex-col h-full">
          <div className="flex justify-between items-start mb-5">
             <div className="w-12 h-12 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-center text-primary group-hover:scale-110 group-hover:bg-primary/10 transition-all duration-300 shadow-sm">
                <FileText className="w-6 h-6" />
             </div>
             
             {/* Actions Menu */}
             <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-all"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(prompt.id);
                }}
              >
                 <Trash2 className="w-4 h-4" />
             </Button>
          </div>
          
          <div className="flex-1 space-y-3">
            <div className="flex flex-wrap gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider bg-secondary/80 text-secondary-foreground px-2.5 py-1 rounded-md">
                {prompt.badge || "Draft"}
              </span>
              {prompt.tags.slice(0, 1).map(tag => (
                <span key={tag} className="text-[10px] font-medium text-muted-foreground border border-border px-2.5 py-1 rounded-md bg-background">
                  {tag}
                </span>
              ))}
            </div>

            <h3 className="text-lg font-bold leading-tight text-foreground group-hover:text-primary transition-colors line-clamp-2">
              {prompt.title}
            </h3>
            
            <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
              {prompt.description || "No description provided."}
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-border/40 flex items-center justify-between">
             <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
               <Clock className="w-3.5 h-3.5" />
               <span>{new Date(prompt.lastModified).toLocaleDateString()}</span>
             </div>
             
             <div className="flex items-center text-xs font-bold text-primary opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
               Open Prompt <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
             </div>
          </div>
       </div>
    </motion.div>
  );
}

function HistoryItemCard({ item, index }: { item: HistoryItem, index: number }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="group relative flex flex-col md:flex-row md:items-center gap-6 p-5 rounded-2xl border border-border bg-card hover:border-primary/30 hover:shadow-md transition-all cursor-pointer overflow-hidden"
    >
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary/20 group-hover:bg-primary transition-colors" />
      
      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors shrink-0">
        <History className="w-5 h-5" />
      </div>
      
      <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
         <div className="md:col-span-5">
            <h3 className="font-bold text-base text-foreground group-hover:text-primary transition-colors truncate">{item.title}</h3>
            <p className="text-sm text-muted-foreground truncate mt-1 font-mono bg-muted/30 px-2 py-0.5 rounded w-fit max-w-full">
               {item.content.substring(0, 40)}...
            </p>
         </div>
         
         <div className="md:col-span-4 flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider bg-secondary px-2.5 py-1 rounded-md text-secondary-foreground">
              {item.type}
            </span>
            <span className="text-[11px] font-medium text-muted-foreground border border-border px-2.5 py-1 rounded-md">
              {item.model}
            </span>
         </div>

         <div className="md:col-span-3 text-right">
            <span className="text-xs font-medium text-muted-foreground flex items-center justify-end gap-1.5">
               <Clock className="w-3 h-3" /> {item.date}
            </span>
         </div>
      </div>

      <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0 bg-card pl-4 shadow-[-20px_0_20px_0_var(--card)]">
        <Button variant="outline" size="sm" className="h-9 gap-2 font-medium bg-background hover:bg-secondary/80">
          <RotateCcw className="w-3.5 h-3.5" /> Restore
        </Button>
      </div>
    </motion.div>
  );
}

function PromptEditorModal({ 
  prompt, 
  isOpen, 
  onClose, 
  onSave,
  isNew = false 
}: { 
  prompt: SavedPrompt | null, 
  isOpen: boolean, 
  onClose: () => void, 
  onSave: (prompt: SavedPrompt) => void,
  isNew?: boolean
}) {
  const [editedPrompt, setEditedPrompt] = useState<SavedPrompt | null>(null);
  const [isEditing, setIsEditing] = useState(isNew);

  useEffect(() => {
    if (prompt) {
      setEditedPrompt({ ...prompt });
      setIsEditing(isNew);
    } else if (isNew) {
      setEditedPrompt({
        id: `temp-${Date.now()}`,
        title: "Untitled Prompt",
        content: "",
        badge: "Draft",
        uses: 0,
        tags: ["General"],
        rating: "0.0",
        author: "You",
        verified: false,
        description: "",
        lastModified: Date.now()
      });
    }
  }, [prompt, isOpen, isNew]);

  if (!isOpen || !editedPrompt) return null;

  const handleSave = () => {
    onSave({ ...editedPrompt, lastModified: Date.now() });
    if (isNew) onClose();
    else setIsEditing(false);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(editedPrompt.content);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-6xl h-[90vh] bg-background rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-border"
      >
        {/* Header */}
        <div className="px-8 py-5 border-b border-border flex items-center justify-between bg-card">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
                <FileText className="w-6 h-6" />
             </div>
             <div>
                {isEditing ? (
                  <Input 
                    value={editedPrompt.title}
                    onChange={(e) => setEditedPrompt({ ...editedPrompt, title: e.target.value })}
                    className="h-9 text-xl font-bold bg-transparent border-transparent hover:border-border focus:border-primary px-2 -ml-2 w-full md:w-[400px]"
                    placeholder="Prompt Title"
                  />
                ) : (
                  <h2 className="text-2xl font-bold text-foreground tracking-tight">{editedPrompt.title}</h2>
                )}
                <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                   <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Edited {new Date(editedPrompt.lastModified).toLocaleDateString()}</span>
                   <span className="w-1 h-1 rounded-full bg-border" />
                   <span className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5" /> {editedPrompt.uses || 0} generations</span>
                </div>
             </div>
          </div>
          
          <div className="flex items-center gap-3">
            {!isEditing && (
              <Button variant="outline" onClick={() => setIsEditing(true)}>
                <Edit3 className="w-4 h-4 mr-2" /> Edit
              </Button>
            )}
            <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-muted">
               <X className="w-6 h-6" />
            </Button>
          </div>
        </div>

        {/* Main Content (Split View) */}
        <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
           
           {/* Left: Configuration / Metadata */}
           <div className="w-full lg:w-80 border-r border-border bg-muted/10 p-8 overflow-y-auto space-y-8">
              <div className="space-y-6">
                 <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 block">Description</label>
                    {isEditing ? (
                      <textarea 
                        className="w-full rounded-lg border border-border bg-background p-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 min-h-[120px] resize-none"
                        value={editedPrompt.description}
                        onChange={(e) => setEditedPrompt({...editedPrompt, description: e.target.value})}
                        placeholder="Describe what this prompt does..."
                      />
                    ) : (
                      <p className="text-sm text-foreground leading-relaxed bg-background p-4 rounded-lg border border-border/50">
                        {editedPrompt.description || "No description provided."}
                      </p>
                    )}
                 </div>

                 <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 block">Tags</label>
                    <div className="flex flex-wrap gap-2">
                       {editedPrompt.tags.map((tag, i) => (
                         <div key={i} className="px-3 py-1.5 rounded-md bg-white dark:bg-zinc-800 border border-border text-xs font-medium shadow-sm">
                            {tag}
                         </div>
                       ))}
                       {isEditing && (
                         <button className="px-3 py-1.5 rounded-md border border-dashed border-border text-muted-foreground text-xs hover:border-primary hover:text-primary transition-colors flex items-center gap-1 bg-transparent">
                            <Plus className="w-3 h-3" /> Add Tag
                         </button>
                       )}
                    </div>
                 </div>

                 <div className="p-5 rounded-xl bg-gradient-to-br from-primary/5 to-purple-500/5 border border-primary/10">
                    <div className="flex items-center gap-2 mb-2 text-primary font-bold text-sm">
                       <Lightbulb className="w-4 h-4" /> Pro Tip
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                       Use variables like <code className="bg-background px-1.5 py-0.5 rounded border border-border text-foreground font-mono">{"{Company}"}</code> to make your prompt reusable.
                    </p>
                 </div>
              </div>
           </div>

           {/* Right: Prompt Content (The "Editor") */}
           <div className="flex-1 flex flex-col bg-background">
              <div className="flex-1 p-8 overflow-y-auto">
                 <div className="max-w-4xl mx-auto h-full flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                       <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                          <Terminal className="w-4 h-4" /> Prompt Content
                       </label>
                       {isEditing && <span className="text-[10px] font-bold bg-primary/10 text-primary px-2.5 py-1 rounded-full uppercase tracking-wide">Editing Mode</span>}
                    </div>
                    
                    {isEditing ? (
                      <textarea 
                        className="flex-1 w-full rounded-2xl border border-border bg-muted/10 p-6 text-sm md:text-base font-mono leading-relaxed focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-inner resize-none transition-all"
                        value={editedPrompt.content}
                        onChange={(e) => setEditedPrompt({...editedPrompt, content: e.target.value})}
                        placeholder="Enter your prompt here..."
                      />
                    ) : (
                      <div className="flex-1 w-full rounded-2xl border border-border bg-muted/5 p-8 text-sm md:text-base font-mono leading-relaxed shadow-sm whitespace-pre-wrap text-foreground hover:bg-muted/10 transition-colors">
                        {editedPrompt.content}
                      </div>
                    )}
                 </div>
              </div>

              {/* Action Bar */}
              <div className="p-6 border-t border-border bg-card flex items-center justify-between px-8">
                 <div className="flex items-center gap-6 text-xs font-medium text-muted-foreground">
                    <span className="flex items-center gap-1.5"><MoreHorizontal className="w-4 h-4" /> {editedPrompt.content.length} chars</span>
                    <span className="w-1 h-1 rounded-full bg-border" />
                    <span>{editedPrompt.content.split(/\s+/).length} words</span>
                 </div>
                 
                 <div className="flex items-center gap-3">
                    {isEditing ? (
                      <>
                        <Button variant="ghost" onClick={isNew ? onClose : () => setIsEditing(false)}>Cancel</Button>
                        <Button onClick={handleSave} className="font-bold gap-2 shadow-lg shadow-primary/20">
                           <Save className="w-4 h-4" /> Save Changes
                        </Button>
                      </>
                    ) : (
                      <Button onClick={copyToClipboard} size="lg" className="font-bold gap-2 shadow-lg shadow-primary/20">
                         <Copy className="w-4 h-4" /> Copy to Clipboard
                      </Button>
                    )}
                 </div>
              </div>
           </div>
        </div>
      </motion.div>
    </div>
  );
}

function LimitReachedModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl animate-in fade-in zoom-in-95 duration-200 overflow-hidden p-8 text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 text-primary">
            <Lock className="w-8 h-8" />
          </div>
          
          <h3 className="text-2xl font-bold mb-3 tracking-tight">Limit Reached</h3>
          <p className="text-muted-foreground text-base mb-8 max-w-xs mx-auto leading-relaxed">
            Free users can save up to 5 prompts. Upgrade to Pro to unlock unlimited storage.
          </p>
          
          <div className="space-y-4">
            <Button size="lg" className="w-full font-bold h-12 text-base shadow-lg shadow-primary/20" asChild>
              <Link to="/pricing">Upgrade to Pro</Link>
            </Button>
            <p className="text-xs text-muted-foreground font-medium">
              Starts at €9/month. Cancel anytime.
            </p>
            <Button variant="ghost" size="sm" onClick={onClose} className="w-full mt-2">
              Maybe later
            </Button>
          </div>
      </div>
    </div>
  );
}

export function SavedPromptsPage() {
  const [activeTab, setActiveTab] = useState<"library" | "history" | "analytics">("library");
  
  // Library State
  const [prompts, setPrompts] = useState<SavedPrompt[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewingPrompt, setViewingPrompt] = useState<SavedPrompt | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [activeFilter, setActiveFilter] = useState("All");
  const [isLoading, setIsLoading] = useState(false);
  
  // History State
  const [historySearch, setHistorySearch] = useState("");

  // Analytics State
  const [stats, setStats] = useState({
      total: 0,
      replies: 0,
      booked: 0,
      closed: 0,
      roi: 0
  });

  const { userState, session } = useDesignContext();
  const FREE_LIMIT = 5;

  const handleCreateClick = () => {
    if (userState !== 'pro' && prompts.length >= FREE_LIMIT) {
      setShowLimitModal(true);
    } else {
      setIsCreating(true);
    }
  };

  useEffect(() => {
    async function fetchPrompts() {
      if (!session) {
        setPrompts(GUEST_PROMPTS);
        return;
      }
      
      setIsLoading(true);
      try {
        const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-a2b5dce9/prompts`, {
          headers: {
            'Authorization': `Bearer ${session.access_token}`
          }
        });
        const data = await response.json();
        
        let loadedPrompts = [];
        if (data.data) {
          loadedPrompts = data.data;
          setPrompts(loadedPrompts);
        }

        if (Array.isArray(loadedPrompts)) {
            let replies = 0;
            let booked = 0;
            let closed = 0;

            loadedPrompts.forEach((p: any) => {
                if (p.outcomes) {
                    p.outcomes.forEach((o: any) => {
                        if (o.type === "Reply") replies++;
                        if (o.type === "Booked") booked++;
                        if (o.type === "Closed") closed++;
                    });
                }
            });

            const roi = (replies * 100) + (booked * 500) + (closed * 2000);
            setStats({
                total: loadedPrompts.length,
                replies,
                booked,
                closed,
                roi
            });
        }
      } catch (e) {
        console.error("Failed to fetch prompts", e);
      } finally {
        setIsLoading(false);
      }
    }
    fetchPrompts();
  }, [session]);

  const filteredPrompts = useMemo(() => {
    return prompts.filter(p => {
      const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            p.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesFilter = activeFilter === "All" || p.tags.includes(activeFilter);
      return matchesSearch && matchesFilter;
    });
  }, [prompts, searchQuery, activeFilter]);

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    prompts.forEach(p => p.tags.forEach(t => tags.add(t)));
    return ["All", ...Array.from(tags)];
  }, [prompts]);

  const filteredHistory = HISTORY_ITEMS.filter(item => 
    item.title.toLowerCase().includes(historySearch.toLowerCase()) ||
    item.type.toLowerCase().includes(historySearch.toLowerCase())
  );

  const outcomeData = [
    { name: 'Replies', value: stats.replies },
    { name: 'Booked', value: stats.booked },
    { name: 'Closed', value: stats.closed },
  ].filter(d => d.value > 0);

  const topPrompts = prompts
     .filter(p => p.outcomes && p.outcomes.length > 0)
     .sort((a, b) => (b.outcomes?.length || 0) - (a.outcomes?.length || 0))
     .slice(0, 5);

  const breakdownData = useMemo(() => {
      const byIndustry: Record<string, number> = {};
      const byRole: Record<string, number> = {};

      prompts.forEach(p => {
          if (!p.outcomes) return;
          const promptRoi = p.outcomes.reduce((acc: number, o: any) => {
              if (o.type === "Reply") return acc + 100;
              if (o.type === "Booked") return acc + 500;
              if (o.type === "Closed") return acc + 2000;
              return acc;
          }, 0);

          if (promptRoi > 0) {
              const ind = p.industry || "Uncategorized";
              const role = p.role || "Uncategorized";
              byIndustry[ind] = (byIndustry[ind] || 0) + promptRoi;
              byRole[role] = (byRole[role] || 0) + promptRoi;
          }
      });

      const industryData = Object.entries(byIndustry)
        .map(([name, roi]) => ({ name, roi }))
        .sort((a, b) => b.roi - a.roi)
        .slice(0, 5);

      const roleData = Object.entries(byRole)
        .map(([name, roi]) => ({ name, roi }))
        .sort((a, b) => b.roi - a.roi)
        .slice(0, 5);

      return { industryData, roleData };
  }, [prompts]);

  const handleSave = async (prompt: SavedPrompt) => {
    if (!session) {
      alert("Please sign in to save changes permanently.");
      if (prompts.find(p => p.id === prompt.id)) {
        setPrompts(prompts.map(p => p.id === prompt.id ? prompt : p));
      } else {
        setPrompts([prompt, ...prompts]);
      }
      return;
    }

    const isNew = !prompts.find(p => p.id === prompt.id);
    const method = isNew ? "POST" : "PUT";
    const url = isNew 
      ? `https://${projectId}.supabase.co/functions/v1/make-server-a2b5dce9/prompts`
      : `https://${projectId}.supabase.co/functions/v1/make-server-a2b5dce9/prompts/${prompt.id}`;

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify(prompt)
      });
      
      const resData = await response.json();
      
      if (!response.ok) {
        if (response.status === 403 && resData.code === "LIMIT_REACHED") {
          setShowLimitModal(true);
          return;
        }
        throw new Error(resData.error || "Failed to save");
      }

      const { data } = resData;
      if (data) {
        if (isNew) {
           setPrompts([data, ...prompts]);
        } else {
           setPrompts(prompts.map(p => p.id === data.id ? data : p));
        }
      }
    } catch (e) {
      console.error("Failed to save prompt", e);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this prompt?")) return;
    if (!session) {
      setPrompts(prompts.filter(p => p.id !== id));
      return;
    }
    try {
      await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-a2b5dce9/prompts/${id}`, {
        method: "DELETE",
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });
      setPrompts(prompts.filter(p => p.id !== id));
    } catch (e) {
      console.error("Failed to delete prompt", e);
    }
  };

  return (
    <div className="flex flex-col flex-1 bg-background text-foreground font-[var(--font-family-inter)] min-h-screen">
      
      {showLimitModal && <LimitReachedModal onClose={() => setShowLimitModal(false)} />}

      <AnimatePresence>
        {(viewingPrompt || isCreating) && (
          <PromptEditorModal 
            prompt={viewingPrompt} 
            isOpen={true}
            isNew={isCreating}
            onClose={() => {
              setViewingPrompt(null);
              setIsCreating(false);
            }} 
            onSave={handleSave}
          />
        )}
      </AnimatePresence>

      <div className="relative border-b border-border bg-card/30 py-12 md:py-16">
        <div className="absolute inset-0 bg-grid-black/[0.02] dark:bg-grid-white/[0.02]" />
        <div className="relative max-w-[1600px] mx-auto px-6 flex flex-col items-center text-center space-y-4">
           <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
             Your Creative Hub
           </h1>
           <p className="text-xl text-muted-foreground max-w-2xl font-light">
             Manage your high-performance prompts, track their impact, and revisit your history.
           </p>

           <div className="flex items-center gap-2 p-1 bg-muted/50 rounded-full border border-border mt-6 shadow-sm">
              {(["library", "history", "analytics"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-2 relative",
                    activeTab === tab 
                      ? "text-primary-foreground shadow-md" 
                      : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                  )}
                >
                  {activeTab === tab && (
                    <motion.div 
                      layoutId="activeTabBg" 
                      className="absolute inset-0 bg-primary rounded-full"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-2">
                    {tab === "library" && <Bookmark className="w-4 h-4" />}
                    {tab === "history" && <History className="w-4 h-4" />}
                    {tab === "analytics" && <BarChart3 className="w-4 h-4" />}
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </span>
                </button>
              ))}
           </div>
        </div>
      </div>

      <main className="flex-grow px-6 py-10 mx-auto w-full max-w-[1600px] space-y-8">
        
        {/* --- LIBRARY TAB CONTENT --- */}
        {activeTab === "library" && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Toolbar */}
            <div className="flex flex-col lg:flex-row items-center justify-between gap-4 py-2">
               <div className="flex items-center gap-2 w-full lg:w-auto overflow-x-auto no-scrollbar pb-2 lg:pb-0">
                  {allTags.slice(0, 6).map(tag => (
                    <button
                      key={tag}
                      onClick={() => setActiveFilter(tag)}
                      className={cn(
                        "px-4 py-1.5 rounded-full text-sm font-medium transition-all border whitespace-nowrap",
                        activeFilter === tag 
                          ? "bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20" 
                          : "bg-card text-muted-foreground border-border hover:border-primary/50 hover:text-foreground hover:shadow-sm"
                      )}
                    >
                      {tag}
                    </button>
                  ))}
               </div>

               <div className="flex items-center gap-3 w-full lg:w-auto">
                  <div className="relative flex-1 lg:w-80 group">
                     <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                     <Input 
                       placeholder="Search your library..." 
                       value={searchQuery}
                       onChange={(e) => setSearchQuery(e.target.value)}
                       className="pl-10 h-10 bg-card border-border shadow-sm focus:ring-primary/20 rounded-full"
                     />
                  </div>
                  <Button size="lg" onClick={handleCreateClick} className="rounded-full shadow-lg shadow-primary/20 font-bold gap-2 px-6">
                      <Plus className="w-5 h-5" /> New Prompt
                  </Button>
               </div>
            </div>

            {/* Grid Content */}
            {isLoading ? (
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                 {[1,2,3,4].map(i => (
                   <div key={i} className="h-72 bg-muted/20 border border-border rounded-2xl animate-pulse"></div>
                 ))}
               </div>
            ) : filteredPrompts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredPrompts.map((prompt) => (
                  <PromptCard 
                    key={prompt.id} 
                    prompt={prompt} 
                    onView={(p) => setViewingPrompt(p)}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            ) : (
              <div className="py-24 flex flex-col items-center justify-center text-center border-2 border-dashed border-border rounded-3xl bg-card/50">
                 <div className="w-20 h-20 bg-muted/50 rounded-full flex items-center justify-center mb-6 text-muted-foreground">
                    <Search className="w-10 h-10" />
                 </div>
                 <h3 className="text-xl font-bold text-foreground mb-2">No prompts found</h3>
                 <p className="text-muted-foreground max-w-md mx-auto mb-8 text-lg">
                   We couldn't find any prompts matching your criteria.
                 </p>
                 <Button variant="outline" size="lg" onClick={() => { setSearchQuery(""); setActiveFilter("All"); }} className="rounded-full">
                   Clear Search Filters
                 </Button>
              </div>
            )}
          </div>
        )}

        {/* --- HISTORY TAB CONTENT --- */}
        {activeTab === "history" && (
          <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
             {/* Toolbar */}
             <div className="flex items-center justify-between gap-4 py-2">
                <div className="relative flex-1 max-w-md">
                   <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                   <Input 
                     placeholder="Search history..." 
                     value={historySearch}
                     onChange={(e) => setHistorySearch(e.target.value)}
                     className="pl-10 h-10 bg-card border-border shadow-sm focus:ring-primary/20 rounded-full"
                   />
                </div>
                <Button variant="outline" size="sm" className="gap-2 rounded-full px-4 border-dashed">
                  <Filter className="w-4 h-4" /> Filter
                </Button>
             </div>

             {/* List */}
             <div className="space-y-4">
               {filteredHistory.length > 0 ? (
                 filteredHistory.map((item, i) => (
                   <HistoryItemCard key={item.id} item={item} index={i} />
                 ))
               ) : (
                 <div className="py-24 text-center border-2 border-dashed border-border rounded-3xl bg-card/50">
                   <div className="w-20 h-20 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-6 text-muted-foreground">
                      <Clock className="w-10 h-10 opacity-50" />
                   </div>
                   <h3 className="font-bold text-xl mb-2">No history found</h3>
                   <p className="text-muted-foreground">Try adjusting your search or generate a new prompt.</p>
                 </div>
               )}
             </div>
          </div>
        )}

        {/* --- ANALYTICS TAB CONTENT --- */}
        {activeTab === "analytics" && (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
             {/* TOP STATS */}
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                  title="Est. ROI" 
                  value={`$${stats.roi.toLocaleString()}`} 
                  icon={DollarSign} 
                  description="Value generated from outcomes"
                  trend="lifetime"
                />
                <StatCard 
                  title="Demos Booked" 
                  value={stats.booked} 
                  icon={Calendar} 
                  description="High intent conversions"
                />
                <StatCard 
                  title="Replies" 
                  value={stats.replies} 
                  icon={MessageCircle} 
                  description="Positive engagement"
                />
                 <StatCard 
                  title="Prompts Created" 
                  value={stats.total} 
                  icon={Zap} 
                  description="Total assets in library"
                />
             </div>

             <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* LEFT COLUMN: PERFORMANCE */}
                <div className="lg:col-span-2 space-y-8">
                  <Card className="border-border shadow-sm rounded-2xl overflow-hidden">
                      <CardHeader className="bg-muted/10 border-b border-border">
                          <CardTitle className="flex items-center gap-2">
                               <Trophy className="w-5 h-5 text-primary" /> Top Converting Prompts
                          </CardTitle>
                          <CardDescription>
                              Your highest performing assets based on marked outcomes.
                          </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4 p-6">
                          {topPrompts.length > 0 ? topPrompts.map((prompt, i) => (
                          <PromptPerformanceRow key={prompt.id} prompt={prompt} index={i} />
                          )) : (
                              <div className="text-center p-12 bg-muted/5 rounded-xl border border-dashed border-border">
                                  <p className="text-muted-foreground">No outcomes tracked yet. Use your saved prompts to generate outcomes.</p>
                              </div>
                          )}
                      </CardContent>
                  </Card>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <Card className="border-border shadow-sm rounded-2xl overflow-hidden">
                         <CardHeader className="bg-muted/10 border-b border-border">
                             <CardTitle className="flex items-center gap-2">
                                 <Factory className="w-5 h-5 text-primary" /> ROI by Industry
                             </CardTitle>
                         </CardHeader>
                         <CardContent className="p-6">
                             <div className="h-[250px] w-full">
                                 {breakdownData.industryData.length > 0 ? (
                                     <ResponsiveContainer width="100%" height="100%">
                                         <BarChart data={breakdownData.industryData} layout="vertical" margin={{ left: 20 }}>
                                             <CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.3} />
                                             <XAxis type="number" hide />
                                             <YAxis dataKey="name" type="category" width={100} tick={{fontSize: 12}} />
                                             <Tooltip 
                                                 formatter={(value: number) => [`$${value.toLocaleString()}`, 'ROI']}
                                                 cursor={{fill: 'var(--muted)', opacity: 0.2}}
                                                 contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: 'var(--radius)' }}
                                             />
                                             <Bar dataKey="roi" fill="var(--chart-1)" radius={[0, 4, 4, 0]} barSize={24} />
                                         </BarChart>
                                     </ResponsiveContainer>
                                 ) : (
                                     <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                                         No data available.
                                     </div>
                                 )}
                             </div>
                         </CardContent>
                     </Card>

                     <Card className="border-border shadow-sm rounded-2xl overflow-hidden">
                         <CardHeader className="bg-muted/10 border-b border-border">
                             <CardTitle className="flex items-center gap-2">
                                 <Briefcase className="w-5 h-5 text-primary" /> ROI by Role
                             </CardTitle>
                         </CardHeader>
                         <CardContent className="p-6">
                             <div className="h-[250px] w-full">
                                 {breakdownData.roleData.length > 0 ? (
                                     <ResponsiveContainer width="100%" height="100%">
                                         <BarChart data={breakdownData.roleData} layout="vertical" margin={{ left: 20 }}>
                                             <CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.3} />
                                             <XAxis type="number" hide />
                                             <YAxis dataKey="name" type="category" width={100} tick={{fontSize: 12}} />
                                             <Tooltip 
                                                 formatter={(value: number) => [`$${value.toLocaleString()}`, 'ROI']}
                                                 cursor={{fill: 'var(--muted)', opacity: 0.2}}
                                                 contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: 'var(--radius)' }}
                                             />
                                             <Bar dataKey="roi" fill="var(--chart-2)" radius={[0, 4, 4, 0]} barSize={24} />
                                         </BarChart>
                                     </ResponsiveContainer>
                                 ) : (
                                     <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                                         No data available.
                                     </div>
                                 )}
                             </div>
                         </CardContent>
                     </Card>
                  </div>
                </div>

                {/* RIGHT COLUMN: INSIGHTS & UPSELL */}
                <div className="space-y-6">
                  {/* Outcome Distribution */}
                  <Card className="border-border shadow-sm rounded-2xl overflow-hidden">
                      <CardHeader className="bg-muted/10 border-b border-border">
                           <CardTitle>Outcome Distribution</CardTitle>
                      </CardHeader>
                      <CardContent className="p-6">
                           <div className="h-[250px] w-full min-w-0 flex items-center justify-center">
                              {outcomeData.length > 0 ? (
                                  <ResponsiveContainer width="100%" height="100%">
                                  <PieChart>
                                      <Pie
                                      data={outcomeData}
                                      cx="50%"
                                      cy="50%"
                                      innerRadius={60}
                                      outerRadius={80}
                                      paddingAngle={5}
                                      dataKey="value"
                                      >
                                      {outcomeData.map((entry, index) => (
                                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                      ))}
                                      </Pie>
                                      <Tooltip 
                                          formatter={(value: number) => [value, 'Count']}
                                          contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: 'var(--radius)' }}
                                      />
                                      <Legend />
                                  </PieChart>
                                  </ResponsiveContainer>
                              ) : (
                                  <div className="text-sm text-muted-foreground">Not enough data to display chart.</div>
                              )}
                          </div>
                      </CardContent>
                  </Card>

                  {/* Suggestions */}
                  <Card className="border-amber-200 dark:border-amber-900 bg-amber-50/50 dark:bg-amber-950/10 rounded-2xl overflow-hidden">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-amber-700 dark:text-amber-500">
                          <Lightbulb className="w-5 h-5" /> Smart Insights
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 p-6">
                      <div className="p-4 rounded-xl bg-background border border-border/50 shadow-sm">
                           <p className="text-sm font-bold mb-1">Increase Reply Rate</p>
                           <p className="text-xs text-muted-foreground leading-relaxed">Prompts with "Casual Tone" have 20% higher reply rates in your industry based on aggregate data.</p>
                      </div>
                      <div className="p-4 rounded-xl bg-background border border-border/50 shadow-sm">
                           <p className="text-sm font-bold mb-1">Pack Recommendation</p>
                           <p className="text-xs text-muted-foreground leading-relaxed">You generate many Sales prompts. Try the "Cold Outreach System" pack to automate the workflow.</p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Locked Feature */}
                  <div className="relative overflow-hidden p-8 rounded-2xl border border-border bg-muted/20 text-center">
                    <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center mb-4 shadow-lg mx-auto">
                      <Lock className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-foreground text-lg mb-2">Unlock Keyword Data</h3>
                    <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                      See exactly which specific words drove the highest conversion across your organization.
                    </p>
                    <Button size="lg" className="w-full shadow-lg shadow-primary/20 font-bold" asChild>
                      <Link to="/pricing">Upgrade to Pro</Link>
                    </Button>
                  </div>
                </div>
             </div>
          </div>
        )}

      </main>
    </div>
  );
}
