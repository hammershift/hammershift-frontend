import React from "react";
import Link from "next/link";
import { Button } from "./ui/button";
import { Card, CardContent } from "./card_component";
import { Search, Target, Trophy, BadgeInfo, AlertTriangle } from "lucide-react";

export const HowItWorks = () => {
    const steps = [
        {
            icon: <Search />,
            title: "SELECT AN AUCTION",
            description:
                "Browse through our curated selection of classic car auctions",
        },
        {
            icon: <Target />,
            title: "PLACE YOUR PREDICTION",
            description:
                "Analyze the details and predict the final hammer price",
        },
        {
            icon: <Trophy />,
            title: "WIN POINTS OR PRIZES",
            description: "Earn rewards based on your prediction accuracy",
        },
    ];

    return (
        <div className="text-center">
            <h2 className="mb-12 text-center text-3xl font-bold">
                HOW IT WORKS
            </h2>

            <div className="mx-auto mb-12 grid max-w-4xl grid-cols-1 gap-6 md:grid-cols-3">
                {steps.map((step, index) => (
                    <div
                        key={index}
                        className="relative rounded-lg border border-[#1E2A36] bg-[#13202D] p-6"
                    >
                        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#F2CA16] text-[#0C1924]">
                            {step.icon}
                        </div>
                        <h3 className="mb-2 text-xl font-bold">{step.title}</h3>
                        <p className="text-gray-300">{step.description}</p>
                    </div>
                ))}
            </div>

            <div className="mx-auto mb-8 max-w-3xl rounded-md border border-orange-800/30 bg-orange-900/20 p-4">
                <div className="flex gap-3">
                    <AlertTriangle className="mt-1 flex-shrink-0 text-orange-500" />
                    <p className="text-left text-sm text-orange-400">
                        <strong>Risk Disclosure:</strong> Velocity Markets is
                        intended for entertainment purposes. While we offer paid
                        games with real prizes, these involve financial risk.
                        Users should be aware that all predictions are
                        speculative in nature and we make no guarantees
                        regarding outcomes. Never participate with money you
                        cannot afford to lose, and remember that all activities
                        on our platform are subject to our Terms of Service.
                    </p>
                </div>
            </div>

            <div className="mt-8 flex justify-center">
                <Link
                    href="/how_it_works"
                    className="flex items-center text-[#F2CA16] hover:underline"
                >
                    Learn More
                    <BadgeInfo className="ml-2 h-4 w-4" />
                </Link>
            </div>
        </div>
    );
};
