import React from 'react';
import Hero from '../../ui/Hero';

function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Hero>Privacy Policy</Hero>
      
      <div className="py-8 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-8">
            {/* Introduction */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Privacy Policy</h2>
              <p className="text-gray-600 mb-4">
                Last Updated: April 12, 2025
              </p>
              <p className="text-gray-600">
                AgroConnect ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how your personal information is collected, used, and disclosed by AgroConnect when you use our website and services.
              </p>
            </section>

            {/* Information We Collect */}
            <section>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Information We Collect</h3>
              <div className="pl-4 space-y-2">
                <p className="text-gray-600">
                  <strong>Personal Information:</strong> When you register for an account, we collect your name, email address, phone number, and location information.
                </p>
                <p className="text-gray-600">
                  <strong>Transaction Information:</strong> We collect information about the products you buy or sell through our platform, including product details, prices, and transaction dates.
                </p>
                <p className="text-gray-600">
                  <strong>Communication Data:</strong> We store messages exchanged between users on our platform to facilitate communication and resolve disputes if necessary.
                </p>
                <p className="text-gray-600">
                  <strong>Usage Information:</strong> We collect information about how you interact with our website, including the pages you visit, the time spent on those pages, and the links you click.
                </p>
              </div>
            </section>

            {/* How We Use Your Information */}
            <section>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">How We Use Your Information</h3>
              <div className="pl-4 space-y-2">
                <p className="text-gray-600">
                  <strong>To Provide Our Services:</strong> We use your information to facilitate transactions between farmers and customers, process orders, and enable communication between users.
                </p>
                <p className="text-gray-600">
                  <strong>To Improve Our Platform:</strong> We analyze usage patterns to enhance our website's functionality, user experience, and content.
                </p>
                <p className="text-gray-600">
                  <strong>To Communicate With You:</strong> We may send you service-related announcements, updates, and promotional messages (which you can opt out of).
                </p>
                <p className="text-gray-600">
                  <strong>To Ensure Safety and Security:</strong> We use information to verify accounts, prevent fraud, and maintain the security of our platform.
                </p>
              </div>
            </section>

            {/* Information Sharing */}
            <section>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Information Sharing</h3>
              <div className="pl-4 space-y-2">
                <p className="text-gray-600">
                  <strong>With Other Users:</strong> When you engage in a transaction, certain information is shared with the other party to facilitate the transaction.
                </p>
                <p className="text-gray-600">
                  <strong>Service Providers:</strong> We may share information with third-party service providers who help us operate our business (e.g., payment processors, cloud storage providers).
                </p>
                <p className="text-gray-600">
                  <strong>Legal Requirements:</strong> We may disclose information if required by law or if we believe it's necessary to protect our rights, safety, or the rights of others.
                </p>
              </div>
            </section>

            {/* Data Security */}
            <section>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Data Security</h3>
              <p className="text-gray-600">
                We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet or electronic storage is 100% secure, so we cannot guarantee absolute security.
              </p>
            </section>

            {/* Your Rights */}
            <section>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Your Rights</h3>
              <div className="pl-4 space-y-2">
                <p className="text-gray-600">
                  <strong>Access and Update:</strong> You can access and update your personal information through your account settings.
                </p>
                <p className="text-gray-600">
                  <strong>Data Deletion:</strong> You can request deletion of your account and associated data by contacting us.
                </p>
                <p className="text-gray-600">
                  <strong>Marketing Communications:</strong> You can opt out of receiving marketing communications at any time.
                </p>
              </div>
            </section>

            {/* Children's Privacy */}
            <section>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Children's Privacy</h3>
              <p className="text-gray-600">
                Our services are not intended for individuals under the age of 18. We do not knowingly collect personal information from children under 18. If we become aware that we have collected personal information from a child under 18, we will take steps to delete that information.
              </p>
            </section>

            {/* Changes to This Policy */}
            <section>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Changes to This Policy</h3>
              <p className="text-gray-600">
                We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date. You are advised to review this Privacy Policy periodically for any changes.
              </p>
            </section>

            {/* Contact Us */}
            <section>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Contact Us</h3>
              <p className="text-gray-600">
                If you have any questions about this Privacy Policy, please contact us at:
              </p>
              <div className="pl-4 mt-2">
                <p className="text-gray-600">Email: privacy@agroconnect.com</p>
                <p className="text-gray-600">Phone: +92 123 456 789</p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PrivacyPolicy;