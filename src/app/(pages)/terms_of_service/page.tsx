
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import Link from 'next/link';
import { createPageUrl } from '@/app/components/utils';

export default function TermsOfService() {
    return (
        <div className="container mx-auto px-4 py-12">
            <h1 className="text-3xl font-bold text-center mb-8">TERMS OF SERVICE</h1>

            <div className="max-w-3xl mx-auto">
                <Card className="bg-[#13202D] border-[#1E2A36] mb-8">
                    <CardHeader>
                        <CardTitle>1. ACCEPTANCE OF TERMS</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 text-gray-300">
                        <p>
                            Welcome to Velocity Markets. By accessing or using our platform, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site.
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-[#13202D] border-[#1E2A36] mb-8">
                    <CardHeader>
                        <CardTitle>2. ELIGIBILITY</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 text-gray-300">
                        <p>
                            You must be at least 18 years of age to use the Velocity Markets platform, and at least 21 years of age to participate in paid games. By using the platform, you represent and warrant that you meet these age requirements.
                        </p>
                        <p>
                            Velocity Markets is available to users in jurisdictions where such activities are legal. You are responsible for ensuring that your use of the platform complies with local laws and regulations.
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-[#13202D] border-[#1E2A36] mb-8">
                    <CardHeader>
                        <CardTitle>3. ACCOUNT REGISTRATION</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 text-gray-300">
                        <p>
                            To access certain features of the platform, you must register for an account. You agree to provide accurate, current, and complete information during the registration process and to update such information to keep it accurate, current, and complete.
                        </p>
                        <p>
                            You are responsible for safeguarding the password that you use to access the platform and for any activities or actions under your password. Velocity Markets cannot and will not be liable for any loss or damage arising from your failure to comply with these requirements.
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-[#13202D] border-[#1E2A36] mb-8">
                    <CardHeader>
                        <CardTitle>4. PREDICTION GAMES AND PAYMENTS</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 text-gray-300">
                        <p>
                            Velocity Markets offers various game modes, including free-to-play and paid options. By participating in paid games, you agree to the payment terms specified for each game.
                        </p>
                        <p>
                            All purchases of credits are final and non-refundable. Credits have no cash value and cannot be exchanged for cash except where required by law.
                        </p>
                        <p>
                            Withdrawals are subject to verification procedures, including but not limited to identity verification and compliance with anti-money laundering regulations.
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-[#13202D] border-[#1E2A36] mb-8">
                    <CardHeader>
                        <CardTitle>5. PROHIBITED CONDUCT</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 text-gray-300">
                        <p>
                            You agree not to engage in any of the following prohibited activities:
                        </p>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>Creating multiple accounts</li>
                            <li>Using the platform for any illegal purpose</li>
                            <li>Attempting to manipulate game outcomes</li>
                            <li>Engaging in collusion with other users</li>
                            <li>Using automated systems or bots to interact with the platform</li>
                            <li>Harassing, threatening, or intimidating other users</li>
                            <li>{"Attempting to gain unauthorized access to the platform or other users' accounts"}</li>
                        </ul>
                    </CardContent>
                </Card>

                <Card className="bg-[#13202D] border-[#1E2A36]">
                    <CardHeader>
                        <CardTitle>6. CONTACT INFORMATION</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 text-gray-300">
                        <p>
                            If you have any questions about these Terms of Service, please contact us at:
                        </p>
                        <p>
                            Email: support@velocitymarkets.com<br />
                            Address: 123 Auction Lane, Suite 100, San Francisco, CA 94103
                        </p>
                        <p className="mt-6">
                            Last updated: June 15, 2024
                        </p>
                        <p className="mt-6">
                            <Link href={createPageUrl("Privacy Policy")} className="text-[#F2CA16] hover:underline">
                                View our Privacy Policy
                            </Link>
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}