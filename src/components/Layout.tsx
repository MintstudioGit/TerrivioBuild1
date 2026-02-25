import { Outlet } from "react-router";
import { GlobalHeader } from "./GlobalHeader";
import { GlobalFooter } from "./GlobalFooter";
import { SiteMapNav } from "./SiteMapNav";
import { OnboardingModal, useOnboarding } from "./OnboardingModal";
import { useDesignContext } from "./DesignController";

export function Layout() {
  const { session } = useDesignContext();
  const { show, dismiss } = useOnboarding(Boolean(session));

  return (
    <div className="flex flex-col min-h-screen bg-background font-[var(--font-family-inter)]">
      <GlobalHeader />
      <div className="flex-1 flex flex-col">
        <Outlet />
      </div>
      <GlobalFooter />
      <SiteMapNav />
      {show && <OnboardingModal onClose={dismiss} />}
    </div>
  );
}
