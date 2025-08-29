import { Footer } from "@/components/layout/Footer";
import GuestHeader from "@/components/layout/GuestHeader";
import React from "react";
import { FaBackspace } from "react-icons/fa";
import { IoArrowBackCircle } from "react-icons/io5";

const TermsAndConditions: React.FC = () => (
  <>
    <GuestHeader />

    <main className="relative min-h-screen bg-gradient-to-br from-[#f1f5f9] to-[rgba(124,58,237,0.11)] flex items-center justify-center pt-24 pb-16">
      <div className="max-w-2xl w-full bg-white shadow-xl rounded-lg p-8 my-8">
        <div className="flex items-center mb-6">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="flex items-center gap-2 px-3 py-1 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Go back">
            <IoArrowBackCircle className="w-7 h-7" />
            <span className="text-base font-semibold">Back</span>
          </button>
          <h1 className="text-3xl font-bold ml-6 text-blue-700">
            Terms & Conditions
          </h1>
        </div>
        <p className="text-sm text-gray-500 mb-6">
          Effective Date: 1 August 2025
        </p>

        <p className="mb-6 text-gray-700">
          Welcome to{" "}
          <span className="font-semibold text-blue-700">InterestMiner</span>. By
          accessing or using our services, you agree to be bound by these Terms
          & Conditions. Please read them thoroughly.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-2 text-blue-600">
          Acceptance of Terms
        </h2>
        <p className="mb-6 text-gray-700">
          By using our website and services, you accept and agree to comply with
          these Terms & Conditions and all applicable laws. If you do not agree,
          please do not use our services.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-2 text-blue-600">
          Use of Services
        </h2>
        <p className="mb-6 text-gray-700">
          Our services are provided for lawful purposes only. You agree not to
          misuse, disrupt, or attempt to access data or areas of our system
          without authorization. We reserve the right to suspend or terminate
          your access at any time for violation of these terms.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-2 text-blue-600">
          User Accounts
        </h2>
        <p className="mb-6 text-gray-700">
          You are responsible for maintaining the confidentiality of your
          account information. Notify us immediately if you suspect unauthorized
          access or usage.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-2 text-blue-600">
          Intellectual Property
        </h2>
        <p className="mb-6 text-gray-700">
          All content, trademarks, designs, and technology on InterestMiner are
          the property of InterestMiner or its licensors. You may not copy,
          reproduce, or distribute any material without explicit written
          consent.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-2 text-blue-600">
          Third-Party Services & Integrations
        </h2>
        <p className="mb-6 text-gray-700">
          We may integrate with third-party services, such as Facebook. Your use
          of those services is subject to their terms and privacy policies.
          InterestMiner is not responsible for third-party content or
          functionality.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-2 text-blue-600">
          Limitation of Liability
        </h2>
        <p className="mb-6 text-gray-700">
          InterestMiner is provided on an "as is" basis. We are not liable for
          any damages, direct or indirect, arising from your use of the website
          or services, to the maximum extent permitted by law.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-2 text-blue-600">
          Modifications to Terms
        </h2>
        <p className="mb-6 text-gray-700">
          We may update these Terms & Conditions from time to time. Changes will
          take effect upon posting the revised version on this page. Continued
          use signifies your acceptance of those changes.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-2 text-blue-600">
          Governing Law
        </h2>
        <p className="mb-6 text-gray-700">
          These Terms & Conditions are governed by the laws of India. All
          disputes shall be subject to the exclusive jurisdiction of courts in
          Indore, Madhya Pradesh, India.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-2 text-blue-600">
          Contact Information
        </h2>
        <p className="mb-2 text-gray-700">
          If you have any questions about these Terms & Conditions, please
          contact us:
        </p>
        <p className="mb-1 text-gray-700">
          Email:{" "}
          <a
            href="mailto:info@interestminer.com"
            className="text-blue-600 underline">
            info@interestminer.com
          </a>
        </p>
        <p className="text-gray-700">
          Address: 123 Business Street, Indore, Madhya Pradesh, India
        </p>
      </div>
    </main>
    <div className="overflow-hidden">
      <div className="-z-10 absolute top-[4.2rem] right-2 w-24 h-24 bg-gradient-to-b from-blue-500 to-purple-400 rounded-full opacity-30 animate-float"></div>
      <div
        className="-z-10 absolute bottom-4 right-[33rem] w-32 h-32 bg-gradient-to-r from-black to-purple-600 rounded-full opacity-20 animate-float"
        style={{ animationDelay: "2s" }}></div>
      <div className="-z-10 absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-t from-purple-500 to-blue-300 rounded-full opacity-30 animate-float"></div>
      <div className="-z-10 absolute top-[20rem] left-[20rem] w-40 h-40 bg-gradient-to-b from-purple-600 to-blue-500 rounded-full opacity:30 animate-float"></div>
      <div className="-z-10 absolute top-[20rem] right-[10rem] w-36 h-36 bg-gradient-to-t from-blue-500 to-purple-400 rounded-full opacity-20 animate-float"></div>
    </div>
    <Footer />
  </>
);

export default TermsAndConditions;
