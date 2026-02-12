import { Link } from "react-router";

export function PrivacyPage() {
  return (
    <div className="container max-w-3xl mx-auto px-6 py-12 md:py-20 font-sans text-foreground">
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
      <p className="text-muted-foreground mb-8">Last Updated: February 2026</p>

      <div className="space-y-8 text-sm leading-relaxed">
        <section>
          <h2 className="text-xl font-bold mb-4">1. Introduction</h2>
          <p>
            Terrivio ("us", "we", or "our") operates the Terrivio website (the "Service"). This page informs you of our policies regarding the collection, use, and disclosure of personal data when you use our Service and the choices you have associated with that data.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-4">2. Information Collection and Use</h2>
          <p>
            We collect several different types of information for various purposes to provide and improve our Service to you.
          </p>
          <h3 className="font-bold mt-4 mb-2">Types of Data Collected</h3>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>Personal Data:</strong> While using our Service, we may ask you to provide us with certain personally identifiable information that can be used to contact or identify you ("Personal Data"). Personally identifiable information may include, but is not limited to: Email address, First name and last name, Cookies and Usage Data.</li>
            <li><strong>Usage Data:</strong> We may also collect information how the Service is accessed and used ("Usage Data"). This Usage Data may include information such as your computer's Internet Protocol address (e.g. IP address), browser type, browser version, the pages of our Service that you visit, the time and date of your visit, the time spent on those pages, unique device identifiers and other diagnostic data.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-4">3. Use of Data</h2>
          <p>
            Terrivio uses the collected data for various purposes:
          </p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>To provide and maintain the Service</li>
            <li>To notify you about changes to our Service</li>
            <li>To allow you to participate in interactive features of our Service when you choose to do so</li>
            <li>To provide customer care and support</li>
            <li>To provide analysis or valuable information so that we can improve the Service</li>
            <li>To monitor the usage of the Service</li>
            <li>To detect, prevent and address technical issues</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-4">4. Transfer of Data</h2>
          <p>
            Your information, including Personal Data, may be transferred to — and maintained on — computers located outside of your state, province, country or other governmental jurisdiction where the data protection laws may differ than those from your jurisdiction.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-4">5. Disclosure of Data</h2>
          <p>
            Terrivio may disclose your Personal Data in the good faith belief that such action is necessary to:
          </p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>To comply with a legal obligation</li>
            <li>To protect and defend the rights or property of Terrivio</li>
            <li>To prevent or investigate possible wrongdoing in connection with the Service</li>
            <li>To protect the personal safety of users of the Service or the public</li>
            <li>To protect against legal liability</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-4">6. Security of Data</h2>
          <p>
            The security of your data is important to us, but remember that no method of transmission over the Internet, or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your Personal Data, we cannot guarantee its absolute security.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-4">7. Service Providers</h2>
          <p>
            We may employ third party companies and individuals to facilitate our Service ("Service Providers"), to provide the Service on our behalf, to perform Service-related services or to assist us in analyzing how our Service is used. These third parties have access to your Personal Data only to perform these tasks on our behalf and are obligated not to disclose or use it for any other purpose.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-4">8. Changes to This Privacy Policy</h2>
          <p>
            We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page. You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted on this page.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-4">9. Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us at support@signalexplorer.com.
          </p>
        </section>
      </div>
      
      <div className="mt-12 pt-8 border-t border-border">
        <Link to="/" className="text-primary hover:underline font-medium">Back to Home</Link>
      </div>
    </div>
  );
}
