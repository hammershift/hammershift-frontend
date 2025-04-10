
import React from 'react';
import { Card } from '@/app/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/app/components/ui/accordion';

export default function FAQ() {
    return (
        <div className="container mx-auto px-4 py-12">
            <h1 className="text-3xl font-bold text-center mb-12">FREQUENTLY ASKED QUESTIONS</h1>

            <div className="max-w-3xl mx-auto">
                <Card className="bg-[#13202D] border-[#1E2A36] mb-8">
                    <div className="p-6">
                        <h2 className="text-xl font-bold mb-4">GENERAL QUESTIONS</h2>
                        <Accordion type="single" collapsible className="w-full">
                            <AccordionItem value="item-1" className="border-[#1E2A36]">
                                <AccordionTrigger className="text-left">HOW DO I PLAY?</AccordionTrigger>
                                <AccordionContent className="text-gray-300">
                                    {"Sign up for a Velocity Markets account, browse our selection of ongoing car auctions, select one that interests you, and predict what you think the final hammer price will be. It's that simple!"}
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="item-2" className="border-[#1E2A36]">
                                <AccordionTrigger className="text-left">IS THIS GAMBLING?</AccordionTrigger>
                                <AccordionContent className="text-gray-300">
                                    Velocity Markets is a skill-based prediction platform. Your success depends on your knowledge of classic cars, auction history, and market trends, not on chance. Our Free Play mode allows you to practice without any financial risk.
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="item-3" className="border-[#1E2A36]">
                                <AccordionTrigger className="text-left">DO I NEED AN ACCOUNT TO PLAY?</AccordionTrigger>
                                <AccordionContent className="text-gray-300">
                                    Yes, you need to create an account to play on Velocity Markets. This ensures fair play and allows us to track your predictions and rewards. Registration is free and only takes a minute.
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </div>
                </Card>

                <Card className="bg-[#13202D] border-[#1E2A36] mb-8">
                    <div className="p-6">
                        <h2 className="text-xl font-bold mb-4">GAME MODES</h2>
                        <Accordion type="single" collapsible className="w-full">
                            <AccordionItem value="mode-1" className="border-[#1E2A36]">
                                <AccordionTrigger className="text-left">WHAT IS A TOURNAMENT?</AccordionTrigger>
                                <AccordionContent className="text-gray-300">
                                    A tournament is a paid competition featuring 5-10 curated cars. Players predict the final hammer price for each car, and the player whose predictions are closest to the actual hammer prices wins. Tournaments have entry fees and prize pools, with the top 3 players receiving a portion of the prize money.
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="mode-2" className="border-[#1E2A36]">
                                <AccordionTrigger className="text-left">{"WHAT'S THE DIFFERENCE BETWEEN FREE PLAY AND PRICE IS RIGHT?"}</AccordionTrigger>
                                <AccordionContent className="text-gray-300">
                                    Free Play allows you to make predictions without spending any money, earning points for our leaderboard. Price is Right involves real-money wagering, where you can win cash prizes based on the accuracy of your predictions.
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="mode-3" className="border-[#1E2A36]">
                                <AccordionTrigger className="text-left">HOW MUCH CAN I WIN?</AccordionTrigger>
                                <AccordionContent className="text-gray-300">
                                    {"In tournaments, prize pools vary based on the number of participants and entry fees. Top prizes can range from hundreds to thousands of dollars. In Price is Right mode, winnings depend on your prediction accuracy and the specific terms of each auction's contest."}
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </div>
                </Card>

                <Card className="bg-[#13202D] border-[#1E2A36] mb-8">
                    <div className="p-6">
                        <h2 className="text-xl font-bold mb-4">ACCOUNT & PAYMENTS</h2>
                        <Accordion type="single" collapsible className="w-full">
                            <AccordionItem value="account-1" className="border-[#1E2A36]">
                                <AccordionTrigger className="text-left">HOW DO I ADD FUNDS TO MY ACCOUNT?</AccordionTrigger>
                                <AccordionContent className="text-gray-300">
                                    {"Once logged in, navigate to your profile and select the \"Add Funds\" option. We accept major credit cards, PayPal, and selected cryptocurrency payments. All transactions are secure and encrypted."}
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="account-2" className="border-[#1E2A36]">
                                <AccordionTrigger className="text-left">HOW DO I WITHDRAW MY WINNINGS?</AccordionTrigger>
                                <AccordionContent className="text-gray-300">
                                    {"To withdraw your winnings, go to your profile, select \"Withdraw,\" and choose your preferred withdrawal method. Withdrawals are typically processed within 1-3 business days, depending on your payment method."}
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="account-3" className="border-[#1E2A36]">
                                <AccordionTrigger className="text-left">IS MY PERSONAL INFORMATION SAFE?</AccordionTrigger>
                                <AccordionContent className="text-gray-300">
                                    Absolutely. Velocity Markets employs industry-standard security measures to protect your personal and financial information. We use SSL encryption for all transactions and never share your data with third parties without your consent.
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </div>
                </Card>

                <div className="mb-6">
                    <h3 className="text-xl font-bold mb-2">What fees does Velocity Markets charge?</h3>
                    <p className="text-gray-300">
                        Velocity Markets charges a 12% platform fee on tournaments and Guess the Hammer games. This fee helps us maintain
                        and improve the platform, ensure fair play, and provide customer support. The fee is automatically deducted from
                        winnings and prize pools. Free Play mode has no fees.
                    </p>
                </div>
            </div>
        </div>
    );
}