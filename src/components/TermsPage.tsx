import { Link } from "react-router";

export function TermsPage() {
  return (
    <div className="container max-w-3xl mx-auto px-6 py-12 md:py-20 font-sans text-foreground">
      <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
      <p className="text-muted-foreground mb-8">Last Updated: February 2026</p>

      <div className="space-y-8 text-sm leading-relaxed">
        <section>
          <h2 className="text-xl font-bold mb-4">1. Introduction</h2>
          <p>
            Welcome to Terrivio ("we," "our," or "us"). By accessing or using our website, services, and tools (collectively, the "Services"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, please do not use our Services.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-4">2. Account Registration</h2>
          <p>
            To access certain features of the Services, you may be required to create an account. You agree to provide accurate, current, and complete information during the registration process and to update such information to keep it accurate, current, and complete. You are responsible for safeguarding your password and for all activities that occur under your account.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-4">3. Use of Services</h2>
          <p>
            You agree to use the Services only for lawful purposes and in accordance with these Terms. You agree not to:
          </p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>Use the Services in any way that violates any applicable federal, state, local, or international law or regulation.</li>
            <li>Use the Services for the purpose of exploiting, harming, or attempting to exploit or harm minors in any way.</li>
            <li>Impersonate or attempt to impersonate Terrivio, a Terrivio employee, another user, or any other person or entity.</li>
            <li>Engage in any other conduct that restricts or inhibits anyone's use or enjoyment of the Services, or which, as determined by us, may harm Terrivio or users of the Services or expose them to liability.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-4">4. Intellectual Property</h2>
          <p>
            The Services and their entire contents, features, and functionality (including but not limited to all information, software, text, displays, images, video, and audio, and the design, selection, and arrangement thereof) are owned by Terrivio, its licensors, or other providers of such material and are protected by copyright, trademark, patent, trade secret, and other intellectual property or proprietary rights laws.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-4">5. Termination</h2>
          <p>
            We may terminate or suspend your account and bar access to the Services immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever and without limitation, including but not limited to a breach of the Terms.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-4">6. Limitation of Liability</h2>
          <p>
            In no event shall Terrivio, its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from (i) your access to or use of or inability to access or use the Services; (ii) any conduct or content of any third party on the Services; (iii) any content obtained from the Services; and (iv) unauthorized access, use or alteration of your transmissions or content, whether based on warranty, contract, tort (including negligence) or any other legal theory, whether or not we have been informed of the possibility of such damage.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-4">7. Changes to Terms</h2>
          <p>
            We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material we will provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-4">8. Contact Us</h2>
          <p>
            If you have any questions about these Terms, please contact us at support@signalexplorer.com.
          </p>
        </section>
      </div>
      
      <div className="mt-12 pt-8 border-t border-border">
        <Link to="/" className="text-primary hover:underline font-medium">Back to Home</Link>
      </div>
    </div>
  );
}
