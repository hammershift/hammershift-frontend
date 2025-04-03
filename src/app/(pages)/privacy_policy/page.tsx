import Footer from "@/app/components/footer";
import React from "react";

const PrivacyPolicyPage = () => {
  return (
    <div>
      <div className="page-container gap-5">
        <div className="mb-10">
          <h1 className="font-bold text-3xl md:text-5xl">
            Privacy Policy
          </h1>
        </div>
        <div className="section-container">
          <h3 className="text-xl py-2 font-bold">Introduction</h3>
          <p className="px-2">
            This Privacy Policy explains how HammerShift collects, uses, and
            protects your personal information. By using our Service, you agree
            to the collection and use of information in accordance with this
            policy.
          </p>
        </div>
        <div className="section-container">
          <h3 className="text-xl py-2 font-bold">
            Information Collection
          </h3>
          <p className="px-2">
            We collect the following types of information:
          </p>
          <ul className="px-10 list-disc">
            <li>
              Personal Information: Name, email address, and payment information
              when you create an account and participate in wagering activities.
            </li>
            <li>
              Usage Data: Information on how you access and use the Service,
              including your IP address, browser type, and device information.
            </li>
          </ul>
        </div>
        <div className="section-container">
          <h3 className="text-xl py-2 font-bold">
            Use of Information
          </h3>
          <p className="px-2">
            We use the collected information for the following purposes:
          </p>
          <ul className="px-10 list-disc">
            <li>To provide and maintain the Service.</li>
            <li>To process wagers and manage your account.</li>
            <li>
              To communicate with you, including sending updates and promotional
              materials.
            </li>
            <li>To improve our services and develop new features.</li>
          </ul>
        </div>
        <div className="section-container">
          <h3 className="text-xl py-2 font-bold"> Data Sharing</h3>
          <p className="px-2">
            We do not share your personal information with third parties except
            as necessary to process payments or comply with legal obligations.
            We may share aggregated, non-personally identifiable information
            with third parties for research and analysis purposes.
          </p>
        </div>
        <div className="section-container">
          <h3 className="text-xl py-2 font-bold">Data Security</h3>
          <p className="px-2">
            We implement industry-standard security measures to protect your
            personal information from unauthorized access, disclosure,
            alteration, or destruction. However, no method of transmission over
            the internet or electronic storage is 100% secure.
          </p>
        </div>
        <div className="section-container">
          <h3 className="text-xl py-2 font-bold">User Rights</h3>
          <p className="px-2">
            You have the right to access, correct, or delete your personal
            information. To exercise these rights, please contact us at [email].
            We will respond to your request within a reasonable timeframe.
          </p>
        </div>
        <div className="section-container">
          <h3 className="text-xl py-2 font-bold">
            Cookies and Tracking
          </h3>
          <p className="px-2">
            We use cookies and similar tracking technologies to enhance your
            experience and gather usage data. You can control cookie settings
            through your browser. Disabling cookies may affect the functionality
            of the Service.
          </p>
        </div>
        <div className="section-container">
          <h3 className="text-xl py-2 font-bold">
            Children&apos;s Privacy
          </h3>
          <p className="px-2">
            Our services are not intended for children under 18, and we do not
            knowingly collect data from minors. If we become aware that we have
            collected personal information from a child under 18, we will take
            steps to delete such information.
          </p>
        </div>
        <div className="section-container">
          <h3 className="text-xl py-2 font-bold">
            Limitation of Liability
          </h3>
          <p className="px-2">
            HammerShift is not liable for any indirect, incidental, or
            consequential damages arising from the use of our Service. The total
            liability of HammerShift for any claims under these terms is limited
            to the amount paid by the user to use the Service.
          </p>
        </div>
        <div className="section-container">
          <h3 className="text-xl py-2 font-bold">
            Changes to the Privacy Policy
          </h3>
          <p className="px-2">
            We may update this Privacy Policy from time to time. Changes will be
            posted on our website, and significant changes will be communicated
            via email. Your continued use of the Service after any changes
            indicates your acceptance of the new policy.
          </p>
        </div>
        <div className="section-container">
          <h3 className="text-xl py-2 font-bold">
            Contact Information
          </h3>
          <p className="px-2">
            If you have any questions about these Terms of Service, please
            contact us at [email].
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PrivacyPolicyPage;
