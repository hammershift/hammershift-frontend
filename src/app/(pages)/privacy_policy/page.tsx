import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/group/text_card";
import { createPageUrl } from '@/app/components/utils';
import Link from 'next/link';
export default function PrivacyPolicy() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-center mb-8">PRIVACY POLICY</h1>

      <div className="max-w-3xl mx-auto">
        <Card className="bg-[#13202D] border-[#1E2A36] mb-8">
          <CardHeader>
            <CardTitle>1. INTRODUCTION</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-gray-300">
            <p>
              At Velocity Markets, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform.
            </p>
            <p>
              Please read this Privacy Policy carefully. By accessing or using the platform, you acknowledge that you have read, understood, and agree to be bound by all the terms of this Privacy Policy.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-[#13202D] border-[#1E2A36] mb-8">
          <CardHeader>
            <CardTitle>2. INFORMATION WE COLLECT</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-gray-300">
            <p>
              We collect information that you provide directly to us, including:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Personal information, such as your name, email address, and date of birth</li>
              <li>Account information, including your username and password</li>
              <li>Profile information, such as your profile picture</li>
              <li>Payment information, including credit card details or other financial information</li>
              <li>KYC (Know Your Customer) information, as required for verification purposes</li>
              <li>Communication data, including messages sent through our customer support system</li>
            </ul>
            <p className="mt-4">
              We also automatically collect certain information about your device and usage patterns, including:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Device information, such as IP address, browser type, and operating system</li>
              <li>Usage data, including pages visited, time spent on the platform, and actions taken</li>
              <li>Location information, as permitted by your device settings</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="bg-[#13202D] border-[#1E2A36] mb-8">
          <CardHeader>
            <CardTitle>3. HOW WE USE YOUR INFORMATION</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-gray-300">
            <p>
              We use the information we collect for various purposes, including:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Providing, maintaining, and improving the platform</li>
              <li>Processing transactions and managing your account</li>
              <li>Verifying your identity and preventing fraud</li>
              <li>Communicating with you about updates, promotions, and other information</li>
              <li>Personalizing your experience on the platform</li>
              <li>Analyzing usage patterns to improve the platform</li>
              <li>Complying with legal and regulatory requirements</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="bg-[#13202D] border-[#1E2A36] mb-8">
          <CardHeader>
            <CardTitle>4. DATA SECURITY</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-gray-300">
            <p>
              We implement appropriate technical and organizational measures to protect your personal information from unauthorized access, disclosure, alteration, and destruction.
            </p>
            <p>
              While we strive to use commercially acceptable means to protect your personal information, we cannot guarantee its absolute security. Any transmission of personal information is at your own risk.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-[#13202D] border-[#1E2A36] mb-8">
          <CardHeader>
            <CardTitle>5. YOUR RIGHTS</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-gray-300">
            <p>
              Depending on your location, you may have certain rights regarding your personal information, including:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>The right to access the personal information we hold about you</li>
              <li>The right to request correction or deletion of your personal information</li>
              <li>The right to restrict or object to our processing of your personal information</li>
              <li>The right to data portability</li>
              <li>The right to withdraw consent at any time, where processing is based on consent</li>
            </ul>
            <p className="mt-4">
              {"To exercise these rights, please contact us using the information provided in the \"Contact Information\" section"}.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-[#13202D] border-[#1E2A36]">
          <CardHeader>
            <CardTitle>6. CONTACT INFORMATION</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-gray-300">
            <p>
              If you have any questions or concerns about this Privacy Policy or our privacy practices, please contact us at:
            </p>
            <p>
              Email: privacy@velocitymarkets.com<br />
              Address: 123 Auction Lane, Suite 100, San Francisco, CA 94103
            </p>
            <p className="mt-6">
              Last updated: June 15, 2024
            </p>
            <p className="mt-6">
              <Link href={createPageUrl("Terms Of Service")} className="text-[#F2CA16] hover:underline">
                View our Terms of Service
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}