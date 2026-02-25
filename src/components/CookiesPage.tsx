import { Link } from "react-router";

export function CookiesPage() {
  return (
    <div className="container max-w-3xl mx-auto px-6 py-12 md:py-20 font-sans text-foreground">
      <h1 className="text-3xl font-bold mb-6">Cookie Policy</h1>
      <p className="text-muted-foreground mb-8">Last Updated: February 2026</p>

      <div className="space-y-8 text-sm leading-relaxed">
        <section>
          <h2 className="text-xl font-bold mb-4">1. What Are Cookies</h2>
          <p>
            Cookies are small text files that are placed on your device when you visit our website. They help us provide a better experience by remembering your preferences and understanding how you use our service.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-4">2. How We Use Cookies</h2>
          <p>We use cookies for the following purposes:</p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li><strong>Essential:</strong> Required for authentication, security, and core functionality.</li>
            <li><strong>Preferences:</strong> To remember your settings (e.g. theme, language).</li>
            <li><strong>Analytics:</strong> To understand how visitors use our site and improve it.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-4">3. Your Choices</h2>
          <p>
            You can control cookies through your browser settings. Disabling certain cookies may affect the functionality of our service.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-4">4. Third-Party Cookies</h2>
          <p>
            We may use third-party services (e.g. analytics, payment processors) that set their own cookies. Please refer to their respective privacy policies for more information.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-4">5. Updates</h2>
          <p>
            We may update this Cookie Policy from time to time. We will notify you of any changes by posting the new policy on this page.
          </p>
        </section>

        <section>
          <p>
            For more information about how we handle your data, please see our{" "}
            <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
          </p>
        </section>
      </div>
    </div>
  );
}
