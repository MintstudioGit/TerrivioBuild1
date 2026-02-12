import { Construction } from "lucide-react";
import { Button } from "./ui/button";
import { Link } from "react-router";

export function ComingSoonPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-6">
        <Construction className="w-8 h-8 text-muted-foreground" />
      </div>
      <h1 className="text-3xl font-bold tracking-tight mb-2">Coming Soon</h1>
      <p className="text-muted-foreground max-w-md mb-8">
        We're working hard to bring you this page. Please check back later.
      </p>
      <Button asChild>
        <Link to="/">Back to Home</Link>
      </Button>
    </div>
  );
}
