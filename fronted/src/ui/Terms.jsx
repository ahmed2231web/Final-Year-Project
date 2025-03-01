import TermsSection from './TermsSection';

function Terms() {
  return (
    <div className="max-w-4xl mx-auto">
      {/* Acceptance of Terms */}
      <TermsSection title="1. Acceptance of Terms">
        <p>
          By registering, accessing, or using the AgroConnect platform, you confirm that you have read, understood, and agree to be bound by these Terms and Conditions. If you do not agree with these terms, you must refrain from using the platform.
        </p>
      </TermsSection>

      {/* About AgroConnect */}
      <TermsSection title="2. About AgroConnect">
        <p>
          AgroConnect is a platform that connects farmers, customers, and medicine dealers for the sale and purchase of agricultural products and related services.
        </p>
      </TermsSection>

      {/* User Accounts */}
      <TermsSection title="3. User Accounts">
        <p>
          Users are responsible for maintaining the confidentiality of their account credentials and notifying AgroConnect immediately of unauthorized use.
        </p>
      </TermsSection>

      {/* Roles and Responsibilities */}
      <TermsSection title="4. Roles and Responsibilities">
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>Farmers:</strong> Responsible for listing products accurately and ensuring quality.
          </li>
          <li>
            <strong>Customers:</strong> Must comply with payment and purchase guidelines.
          </li>
          <li>
            <strong>Medicine Dealers:</strong> Must ensure the authenticity of medicines.
          </li>
        </ul>
      </TermsSection>

      {/* Payment Terms */}
      <TermsSection title="5. Payment Terms">
        <p>
          Customers must pay 10% upfront for online orders, with the balance due upon delivery.
        </p>
      </TermsSection>

      {/* AI-Powered Support */}
      <TermsSection title="6. AI-Powered Support">
        <p>
          AgroConnect provides an AI-powered chatbot for basic support. For additional assistance, farmers can contact dealers.
        </p>
      </TermsSection>

      {/* Feedback and Reviews */}
      <TermsSection title="7. Feedback and Reviews">
        <p>
          Users can provide honest feedback for farmers and dealers. Offensive or defamatory reviews are prohibited.
        </p>
      </TermsSection>

      {/* Prohibited Activities */}
      <TermsSection title="8. Prohibited Activities">
        <ul className="list-disc pl-6 space-y-2">
          <li>Posting false or misleading content.</li>
          <li>Engaging in fraudulent transactions.</li>
          <li>Using the platform for illegal activities.</li>
        </ul>
      </TermsSection>

      {/* Limitation of Liability */}
      <TermsSection title="9. Limitation of Liability">
        <p>
          AgroConnect acts as a platform to connect users and is not responsible for product quality or disputes.
        </p>
      </TermsSection>

      {/* Privacy Policy */}
      <TermsSection title="10. Privacy Policy">
        <p>
          Use of AgroConnect is subject to our Privacy Policy, which governs the collection and use of personal information.
        </p>
      </TermsSection>

      {/* Changes to Terms */}
      <TermsSection title="11. Changes to Terms">
        <p>
          AgroConnect may update these Terms and Conditions at any time. Continued use of the platform signifies acceptance of the updated terms.
        </p>
      </TermsSection>

      {/* Governing Law */}
      <TermsSection title="12. Governing Law">
        <p>
          These Terms and Conditions are governed by the laws of [Your Jurisdiction].
        </p>
      </TermsSection>

      {/* Contact Information */}
      <TermsSection title="13. Contact Information">
        <p>
          For any questions, contact us at:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Email: support@agroconnect.com</li>
          <li>Phone: [Insert Contact Number]</li>
        </ul>
      </TermsSection>
    </div>
  );
}

export default Terms;
