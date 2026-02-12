import { Outlet } from "react-router";
import { GlobalHeader } from "./GlobalHeader";
import { GlobalFooter } from "./GlobalFooter";
import { SiteMapNav } from "./SiteMapNav";

export function Layout() {
  return (
    <div className="flex flex-col min-h-screen bg-background font-[var(--font-family-inter)]">
      <GlobalHeader />
      <div className="flex-1 flex flex-col">
        <Outlet />
      </div>
      <GlobalFooter />
      <SiteMapNav />
    </div>
  );
}
