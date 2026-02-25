import { useParams, Link, Navigate } from "react-router";
import { Calendar, Clock, ArrowLeft, Tag, ArrowRight } from "lucide-react";
import { getPost, BLOG_POSTS } from "../data/blog-posts";
import { Button } from "./ui/button";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

const CATEGORY_COLORS: Record<string, string> = {
  "Prompt Engineering": "bg-primary/10 text-primary border-primary/20",
  "Comparison":         "bg-blue-500/10 text-blue-600 border-blue-500/20",
  "Tutorial":           "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
};

export function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const post = getPost(slug ?? "");

  if (!post) return <Navigate to="/blog" replace />;

  // Next/prev navigation
  const idx = BLOG_POSTS.findIndex((p) => p.slug === post.slug);
  const prev = BLOG_POSTS[idx + 1];
  const next = BLOG_POSTS[idx - 1];

  return (
    <div className="container max-w-3xl mx-auto px-6 py-16">
      {/* Back */}
      <div className="mb-10">
        <Button variant="ghost" size="sm" asChild className="gap-2 -ml-2 text-muted-foreground hover:text-foreground">
          <Link to="/blog">
            <ArrowLeft className="w-4 h-4" />
            All posts
          </Link>
        </Button>
      </div>

      {/* Header */}
      <header className="mb-10">
        <div className="flex items-center gap-3 mb-5">
          <span
            className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
              CATEGORY_COLORS[post.category] ?? "bg-muted text-muted-foreground border-border"
            }`}
          >
            {post.category}
          </span>
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Calendar className="w-3 h-3" />
            {formatDate(post.date)}
          </span>
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            {post.readingTime}
          </span>
        </div>

        <h1 className="text-3xl font-bold tracking-tight leading-snug mb-5">
          {post.title}
        </h1>

        <p className="text-lg text-muted-foreground leading-relaxed">
          {post.description}
        </p>

        {/* Tags */}
        <div className="flex items-center gap-3 mt-6 flex-wrap">
          {post.tags.map((tag) => (
            <span key={tag} className="flex items-center gap-1 text-xs text-muted-foreground">
              <Tag className="w-3 h-3" />
              {tag}
            </span>
          ))}
        </div>
      </header>

      {/* Divider */}
      <div className="border-t border-border mb-10" />

      {/* Body — rendered as HTML from the data file */}
      <div
        className="blog-body text-foreground/90 leading-relaxed"
        dangerouslySetInnerHTML={{ __html: post.body }}
      />

      {/* CTA */}
      <div className="mt-16 p-8 rounded-xl border border-primary/20 bg-primary/5 text-center">
        <h3 className="text-lg font-bold mb-2">Ready to build your first prompt pipeline?</h3>
        <p className="text-muted-foreground text-sm mb-5">
          Start free — no credit card required. 5 saved prompts on the free tier.
        </p>
        <Button asChild size="lg">
          <Link to="/generator">Try the Generator →</Link>
        </Button>
      </div>

      {/* Prev / Next */}
      {(prev || next) && (
        <nav className="mt-12 pt-8 border-t border-border flex items-start justify-between gap-8">
          {prev ? (
            <Link to={`/blog/${prev.slug}`} className="flex-1 group">
              <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                <ArrowLeft className="w-3 h-3" /> Older
              </p>
              <p className="text-sm font-medium group-hover:text-primary transition-colors leading-snug">
                {prev.title}
              </p>
            </Link>
          ) : <div className="flex-1" />}
          {next ? (
            <Link to={`/blog/${next.slug}`} className="flex-1 text-right group">
              <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1 justify-end">
                Newer <ArrowRight className="w-3 h-3" />
              </p>
              <p className="text-sm font-medium group-hover:text-primary transition-colors leading-snug">
                {next.title}
              </p>
            </Link>
          ) : <div className="flex-1" />}
        </nav>
      )}
    </div>
  );
}
