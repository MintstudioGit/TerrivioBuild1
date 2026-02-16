import { BrowserRouter, Routes, Route, Navigate, useParams } from "react-router";
import { LandingPage } from "./components/LandingPage";
import { DirectoryPage } from "./components/DirectoryPage";
import { SavedPromptsPage } from "./components/SavedPromptsPage";
import { PricingPage } from "./components/PricingPage";
import { SignInPage } from "./components/SignInPage";
import { SignUpPage } from "./components/SignUpPage";

import { GeneratorPage } from "./components/GeneratorPage";
import { PackLandingPage } from "./components/PackLandingPage";
import { Layout } from "./components/Layout";
import { DesignProvider } from "./components/DesignController";
import { AboutPage } from "./components/AboutPage";
import { PrivacyPage } from "./components/PrivacyPage";
import { TermsPage } from "./components/TermsPage";
import { ComingSoonPage } from "./components/ComingSoonPage";
import { PipelineBuilderPage } from "./components/PipelineBuilderPage";

import { UpgradePage } from "./components/UpgradePage";

export default function App() {
  return (
    <DesignProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            {/* Landing Page */}
            <Route path="/" element={<LandingPage />} />
            
            {/* Directory Routes */}
            <Route path="/generator" element={<GeneratorPage />} />
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
            <Route path="/analytics" element={<Navigate to="/saved" replace />} />

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

            {/* Pipeline Builder */}
            <Route path="/pipeline" element={<PipelineBuilderPage />} />

            {/* Legal & Company Pages */}
            <Route path="/about" element={<AboutPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/blog" element={<ComingSoonPage />} />
            <Route path="/careers" element={<ComingSoonPage />} />
            <Route path="/contact" element={<ComingSoonPage />} />
            <Route path="/cookies" element={<ComingSoonPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </DesignProvider>
  );
}
