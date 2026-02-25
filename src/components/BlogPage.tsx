import { Link } from "react-router";
import { Calendar, Clock, ArrowRight, Tag } from "lucide-react";
import { BLOG_POSTS } from "../data/blog-posts";

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

export function BlogPage() {
  return (
    <div className="container max-w-4xl mx-auto px-6 py-16">
      {/* Header */}
      <div className="mb-14">
        <h1 className="text-4xl font-bold tracking-tight mb-3">Blog</h1>
        <p className="text-muted-foreground text-lg leading-relaxed max-w-2xl">
          Guides, frameworks, and comparisons for teams that take prompt engineering seriously.
        </p>
      </div>

      {/* Post list */}
      <div className="flex flex-col divide-y divide-border">
        {BLOG_POSTS.map((post) => (
          <article key={post.slug} className="py-10 group">
            <Link to={`/blog/${post.slug}`} className="block">
              {/* Category + date row */}
              <div className="flex items-center gap-3 mb-3">
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

              {/* Title */}
              <h2 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors mb-2 leading-snug">
                {post.title}
              </h2>

              {/* Description */}
              <p className="text-muted-foreground leading-relaxed mb-4 max-w-2xl">
                {post.description}
              </p>

              {/* Tags + Read more */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 flex-wrap">
                  {post.tags.slice(0, 3).map((tag) => (
                    <span key={tag} className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Tag className="w-3 h-3" />
                      {tag}
                    </span>
                  ))}
                </div>
                <span className="flex items-center gap-1 text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                  Read article
                  <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}
