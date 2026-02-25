import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import { Suspense, lazy } from "react";

import { Layout } from "./components/Layout";
import { DesignProvider } from "./components/DesignController";

const LandingPage = lazy(() => import("./components/LandingPage").then((m) => ({ default: m.LandingPage })));
const DirectoryPage = lazy(() => import("./components/DirectoryPage").then((m) => ({ default: m.DirectoryPage })));
const SavedPromptsPage = lazy(() => import("./components/SavedPromptsPage").then((m) => ({ default: m.SavedPromptsPage })));
const PricingPage = lazy(() => import("./components/PricingPage").then((m) => ({ default: m.PricingPage })));
const SignInPage = lazy(() => import("./components/SignInPage").then((m) => ({ default: m.SignInPage })));
const SignUpPage = lazy(() => import("./components/SignUpPage").then((m) => ({ default: m.SignUpPage })));
const GeneratorPage = lazy(() => import("./components/GeneratorPage").then((m) => ({ default: m.GeneratorPage })));
const PackLandingPage = lazy(() => import("./components/PackLandingPage").then((m) => ({ default: m.PackLandingPage })));
const AboutPage = lazy(() => import("./components/AboutPage").then((m) => ({ default: m.AboutPage })));
const PrivacyPage = lazy(() => import("./components/PrivacyPage").then((m) => ({ default: m.PrivacyPage })));
const TermsPage = lazy(() => import("./components/TermsPage").then((m) => ({ default: m.TermsPage })));
const ComingSoonPage = lazy(() => import("./components/ComingSoonPage").then((m) => ({ default: m.ComingSoonPage })));
const PipelineBuilderPage = lazy(() => import("./components/PipelineBuilderPage").then((m) => ({ default: m.PipelineBuilderPage })));
const PacksMarketplacePage = lazy(() => import("./components/PacksMarketplacePage").then((m) => ({ default: m.PacksMarketplacePage })));
const BlogPage = lazy(() => import("./components/BlogPage").then((m) => ({ default: m.BlogPage })));
const BlogPostPage = lazy(() => import("./components/BlogPostPage").then((m) => ({ default: m.BlogPostPage })));
const IntegrationsPage = lazy(() => import("./components/IntegrationsPage").then((m) => ({ default: m.IntegrationsPage })));
const AdvancedAnalyticsPage = lazy(() => import("./components/AdvancedAnalyticsPage").then((m) => ({ default: m.AdvancedAnalyticsPage })));
const APIKeysPage = lazy(() => import("./components/APIKeysPage").then((m) => ({ default: m.APIKeysPage })));
const WhiteLabelPage = lazy(() => import("./components/WhiteLabelPage").then((m) => ({ default: m.WhiteLabelPage })));
const MobileAppPage = lazy(() => import("./components/MobileAppPage").then((m) => ({ default: m.MobileAppPage })));
const ContactPage = lazy(() => import("./components/ContactPage").then((m) => ({ default: m.ContactPage })));
const CookiesPage = lazy(() => import("./components/CookiesPage").then((m) => ({ default: m.CookiesPage })));
const NotFoundPage = lazy(() => import("./components/NotFoundPage").then((m) => ({ default: m.NotFoundPage })));
const SidebarDemo = lazy(() => import("./components/SidebarDemo").then((m) => ({ default: m.SidebarDemo })));
const UpgradePage = lazy(() => import("./components/UpgradePage").then((m) => ({ default: m.UpgradePage })));
const AppHubPage = lazy(() => import("./components/AppHubPage").then((m) => ({ default: m.AppHubPage })));

export default function App() {
  return (
    <DesignProvider>
      <BrowserRouter>
        <Suspense
          fallback={
            <div className="min-h-screen flex items-center justify-center text-muted-foreground text-sm">
              Loading Terrivio...
            </div>
          }
        >
          <Routes>
            <Route element={<Layout />}>
            {/* Landing Page */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/app" element={<AppHubPage />} />
            
            {/* Directory Routes */}
            <Route path="/directory" element={<Navigate to="/prompts" replace />} />
            
            {/* Old URL Structure Restored */}
            <Route path="/prompts" element={<DirectoryPage />} />
            <Route path="/prompts/:category" element={<DirectoryPage />} />
            <Route path="/prompts/:category/:slug" element={<DirectoryPage />} />

            {/* Saved Prompts Page (Library, History & Analytics) */}
            <Route path="/saved" element={<SavedPromptsPage />} />
            
            {/* Legacy Dashboard, History & Analytics Redirects */}
            <Route path="/dashboard" element={<Navigate to="/saved" replace />} />
            <Route path="/history" element={<Navigate to="/saved" replace />} />
            <Route path="/analytics" element={<AdvancedAnalyticsPage />} />

            {/* Pricing Page */}
            <Route path="/pricing" element={<PricingPage />} />
            
            {/* Auth */}
            <Route path="/signin" element={<SignInPage />} />
            <Route path="/login" element={<Navigate to="/signin" replace />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/upgrade" element={<UpgradePage />} />
            
            {/* Generator Tools */}
            <Route path="/generator" element={<GeneratorPage initialTab="builder" />} />
            <Route path="/packs" element={<GeneratorPage initialTab="packs" />} />
            <Route path="/packs/:slug" element={<PackLandingPage />} />
            <Route path="/marketplace" element={<PacksMarketplacePage />} />

            {/* Pipeline Builder */}
            <Route path="/pipeline" element={<PipelineBuilderPage />} />

            {/* Legal & Company Pages */}
            <Route path="/about" element={<AboutPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/blog/:slug" element={<BlogPostPage />} />
            <Route path="/careers" element={<ComingSoonPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/cookies" element={<CookiesPage />} />

            {/* Platform Pages */}
            <Route path="/integrations" element={<IntegrationsPage />} />
            <Route path="/api-keys" element={<APIKeysPage />} />
            <Route path="/white-label" element={<WhiteLabelPage />} />
            <Route path="/mobile" element={<MobileAppPage />} />
            <Route path="/labs/sidebar" element={<SidebarDemo />} />

            {/* 404 */}
            <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </DesignProvider>
  );
}
