import Footer from "@/app/components/footer";
import React from "react";

const TermsOfServicePage = () => {
  return (
    <div>
      <div className="page-container tw-gap-5">
        <div className="tw-mb-10">
          <h1 className="tw-font-bold tw-text-3xl md:tw-text-5xl">
            Terms of Service
          </h1>
        </div>
        <div className="section-container">
          <h3 className="tw-text-xl tw-py-2 tw-font-bold">Introduction</h3>
          <p className="tw-px-2">
            This document constitutes a legal agreement between you and
            HammerShift regarding your use of our game and services. By
            accessing or using HammerShift, you agree to be bound by these Terms
            of Service.
          </p>
        </div>
        <div className="section-container">
          <h3 className="tw-text-xl tw-py-2 tw-font-bold">Definitions</h3>
          <ul className="tw-px-6 tw-list-disc">
            <li>Service: The HammerShift game and related services.</li>
            <li>User: Any individual who uses the Service.</li>
            <li>Account: The user account created to access the Service</li>
          </ul>
        </div>
        <div className="section-container">
          <h3 className="tw-text-xl tw-py-2 tw-font-bold">User Accounts</h3>
          <p className="tw-px-2">
            Users must be at least 18 years old to create an account and
            participate in wagering activities. Users are responsible for
            maintaining the confidentiality of their account information and for
            all activities that occur under their account.
          </p>
        </div>
        <div className="section-container">
          <h3 className="tw-text-xl tw-py-2 tw-font-bold">
            {" "}
            Use of the Service
          </h3>
          <p className="tw-px-2">
            Users agree not to use cheats, exploits, or any unauthorized
            third-party software to interfere with the game. Users must comply
            with all applicable laws and regulations when using the Service.
          </p>
        </div>
        <div className="section-container">
          <h3 className="tw-text-xl tw-py-2 tw-font-bold">
            Wagering and Payments
          </h3>
          <p className="tw-px-2">
            All wagers are final, and users must ensure they have sufficient
            funds in their account before placing a wager. Payments are
            processed through secure third-party payment processors. HammerShift
            is not responsible for any issues arising from payment processing.
          </p>
        </div>
        <div className="section-container">
          <h3 className="tw-text-xl tw-py-2 tw-font-bold">
            Privacy and Data Collection
          </h3>
          <p className="tw-px-2">
            By using our Service, you agree to our Privacy Policy, which
            explains how we collect, use, and protect your personal information.
          </p>
        </div>
        <div className="section-container">
          <h3 className="tw-text-xl tw-py-2 tw-font-bold">
            {" "}
            Intellectual Property
          </h3>
          <p className="tw-px-2">
            All game content, including but not limited to text, graphics,
            logos, and software, is the property of HammerShift and may not be
            used without permission. Users retain ownership of any content they
            create and share within the Service but grant HammerShift a
            non-exclusive, royalty-free license to use, display, and distribute
            such content.
          </p>
        </div>
        <div className="section-container">
          <h3 className="tw-text-xl tw-py-2 tw-font-bold">Termination</h3>
          <p className="tw-px-2">
            HammerShift reserves the right to terminate accounts for violations
            of these terms or any other reason at its sole discretion. Users may
            also terminate their accounts at any time by contacting customer
            support.
          </p>
        </div>
        <div className="section-container">
          <h3 className="tw-text-xl tw-py-2 tw-font-bold">
            Limitation of Liability
          </h3>
          <p className="tw-px-2">
            HammerShift is not liable for any indirect, incidental, or
            consequential damages arising from the use of our Service. The total
            liability of HammerShift for any claims under these terms is limited
            to the amount paid by the user to use the Service.
          </p>
        </div>
        <div className="section-container">
          <h3 className="tw-text-xl tw-py-2 tw-font-bold">Governing Law</h3>
          <p className="tw-px-2">
            These terms are governed by the laws of the State of Delaware, USA.
            Any disputes arising from these terms or the use of the Service will
            be resolved in the state or federal courts located in Delaware.
          </p>
        </div>
        <div className="section-container">
          <h3 className="tw-text-xl tw-py-2 tw-font-bold">
            Contact Information
          </h3>
          <p className="tw-px-2">
            If you have any questions about these Terms of Service, please
            contact us at [email].
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default TermsOfServicePage;
