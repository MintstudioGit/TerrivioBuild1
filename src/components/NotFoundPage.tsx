import { Link } from "react-router";
import { Button } from "./ui/button";
import { FileQuestion } from "lucide-react";

export function NotFoundPage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-6">
        <FileQuestion className="w-8 h-8 text-muted-foreground" />
      </div>
      <h1 className="text-3xl font-bold tracking-tight mb-2">Page not found</h1>
      <p className="text-muted-foreground max-w-md mb-8">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Button asChild>
        <Link to="/">Back to Home</Link>
      </Button>
    </div>
  );
}
