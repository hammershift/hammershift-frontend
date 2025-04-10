
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import React from 'react';

export default function Rules() {
    return (
        <div className="container mx-auto px-4 py-12">
            <h1 className="text-3xl font-bold text-center mb-12">PLATFORM RULES</h1>

            <div className="max-w-3xl mx-auto">
                <Card className="bg-[#2C2C2C] border-[#333333] mb-8">
                    <CardHeader>
                        <CardTitle>GENERAL RULES</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 text-gray-300">
                        <p>
                            Welcome to Velocity Markets. To ensure fair play and a positive environment for all users, please adhere to the following rules:
                        </p>

                        <ol className="list-decimal pl-5 space-y-2">
                            <li>Users must be at least 18 years of age to use the platform, and 21 years or older to participate in paid games.</li>
                            <li>Each user is permitted only one account. Multiple accounts from the same user will result in account termination.</li>
                            <li>Users are prohibited from sharing account information or allowing others to access their accounts.</li>
                            <li>Any form of collusion between users to manipulate outcomes is strictly forbidden.</li>
                            <li>Velocity Markets reserves the right to verify user identities and locations before processing withdrawals.</li>
                            <li>Abusive language, harassment, or any form of inappropriate behavior toward other users or staff will not be tolerated.</li>
                            <li>The use of automated systems, bots, or scripts to interact with the platform is prohibited.</li>
                        </ol>
                    </CardContent>
                </Card>

                <Card className="bg-[#2C2C2C] border-[#333333] mb-8">
                    <CardHeader>
                        <CardTitle>PREDICTION RULES</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 text-gray-300">
                        <p>The following rules apply to all predictions made on Velocity Markets:</p>

                        <ul className="list-disc pl-5 space-y-2">
                            <li>{"All predictions must be submitted before the auction's deadline."}</li>
                            <li>Once submitted, predictions cannot be changed or withdrawn.</li>
                            <li>In Free Play mode, predictions earn points based on their accuracy relative to the final hammer price.</li>
                            <li>In Price is Right mode, predictions that are closest to the actual hammer price without going over will win.</li>
                            <li>In Tournament mode, the player with the most accurate predictions across all included auctions will win.</li>
                            <li>In case of a tie, the prize will be split equally among the tied participants.</li>
                            <li>{"Velocity Markets' determination of winners is final."}</li>
                        </ul>
                    </CardContent>
                </Card>

                <Card className="bg-[#2C2C2C] border-[#333333] mb-8">
                    <CardHeader>
                        <CardTitle>PAYMENT RULES</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 text-gray-300">
                        <p>The following rules apply to all financial transactions on Velocity Markets:</p>

                        <ul className="list-disc pl-5 space-y-2">
                            <li>Minimum deposit: $10</li>
                            <li>Minimum withdrawal: $20</li>
                            <li>All withdrawals are subject to identity verification.</li>
                            <li>Winnings will be credited to user accounts within 24 hours of auction completion.</li>
                            <li>Users may be required to provide documentation for withdrawals exceeding $1,000.</li>
                            <li>Velocity Markets charges no fees for deposits or withdrawals, though payment processors may apply their own fees.</li>
                            <li>Users are responsible for any taxes applicable to their winnings in their jurisdiction.</li>
                        </ul>
                    </CardContent>
                </Card>

                <Card className="bg-[#2C2C2C] border-[#333333]">
                    <CardHeader>
                        <CardTitle>RULE ENFORCEMENT</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 text-gray-300">
                        <p>Velocity Markets takes rule enforcement seriously to maintain platform integrity:</p>

                        <ul className="list-disc pl-5 space-y-2">
                            <li>Rule violations may result in warnings, temporary suspensions, or permanent account termination.</li>
                            <li>Velocity Markets reserves the right to withhold funds from accounts found to be in violation of our rules.</li>
                            <li>Appeals regarding rule enforcement can be submitted to our support team for review.</li>
                            <li>Velocity Markets reserves the right to modify these rules at any time, with notification to users.</li>
                            <li>By using the platform, you agree to abide by all current and future rules.</li>
                        </ul>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}