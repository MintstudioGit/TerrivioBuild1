import { Link } from "react-router";
import { Button } from "./ui/button";
import { ReactNode } from "react";

export function AppPageTopBar({ right }: { right?: ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-8">
      <Button variant="ghost" asChild>
        <Link to="/app">← App Hub</Link>
      </Button>
      {right ?? null}
    </div>
  );
}
