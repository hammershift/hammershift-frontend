import React from 'react';
import { BadgeInfo, Trophy, Users, BarChart3, Heart, Shield } from "lucide-react";

export default function HowItWorks() {
    const steps = [
        {
            icon: <Users className="w-6 h-6" />,
            step: "01",
            title: "JOINING VELOCITY MARKETS",
            description: "To get started, simply visit our website and sign up. Registration is quick and allows you immediate access to our auction prediction platform. Once registered, you're ready to dive into the world of auction predictions."
        },
        {
            icon: <BadgeInfo className="w-6 h-6" />,
            step: "02",
            title: "UNDERSTANDING THE AUCTIONS",
            description: "Velocity Markets features live auction data from platforms like Bring a Trailer (BaT), giving you real-time feeds of active listings. Browse through ongoing auctions to select the ones you find most intriguing or where your knowledge gives you an edge."
        },
        {
            icon: <BarChart3 className="w-6 h-6" />,
            step: "03",
            title: "MAKING PREDICTIONS",
            description: "Once you've selected an auction, it's time to place your prediction on the outcome. Forecast the final selling price based on your understanding of the car's value, market trends, and past auction results."
        },
        {
            icon: <Trophy className="w-6 h-6" />,
            step: "04",
            title: "SCORING AND REWARDS",
            description: "After the auction concludes, predictions are tallied and winners are determined based on the accuracy of their forecasts. Points are awarded not just for accuracy but also for the insight shown in your predictions."
        }
    ];

    return (
        <div className="min-h-screen bg-[#0A0A1A]">
            <div className="container mx-auto px-4 py-16 max-w-4xl">

                {/* Header */}
                <div className="text-center mb-16">
                    <p className="text-[#E94560] text-sm font-mono font-semibold tracking-widest uppercase mb-3">
                        Platform Guide
                    </p>
                    <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-5">
                        How It Works
                    </h1>
                    <p className="text-gray-400 text-lg leading-relaxed max-w-2xl mx-auto">
                        Welcome to Velocity Markets, where the excitement of car auctions meets the thrill of strategic prediction. All users must be 18 or older to use our platform, and 21 or older to participate in paid games.
                    </p>
                </div>

                {/* Steps */}
                <div className="space-y-6 mb-12">
                    {steps.map((step, index) => (
                        <div
                            key={index}
                            className="bg-[#16181f] border border-white/[0.08] rounded-xl p-6 md:p-8 flex gap-6 items-start hover:border-white/[0.14] transition-colors duration-200"
                        >
                            {/* Step number + icon */}
                            <div className="flex-shrink-0 flex flex-col items-center gap-2">
                                <div className="w-12 h-12 rounded-xl bg-[#E94560]/10 border border-[#E94560]/20 text-[#E94560] flex items-center justify-center">
                                    {step.icon}
                                </div>
                                <span className="font-mono text-xs text-white/30 font-semibold tracking-widest">
                                    {step.step}
                                </span>
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <h3 className="text-base font-bold text-white tracking-widest mb-2 uppercase">
                                    {step.title}
                                </h3>
                                <p className="text-gray-400 leading-relaxed text-sm md:text-base">
                                    {step.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Info cards grid */}
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <div className="bg-[#16181f] border border-white/[0.08] rounded-xl p-6 hover:border-white/[0.14] transition-colors duration-200">
                        <h3 className="flex items-center gap-2.5 text-base font-bold text-white uppercase tracking-widest mb-4">
                            <BadgeInfo className="w-5 h-5 text-[#FFB547] flex-shrink-0" />
                            Fees and Charges
                        </h3>
                        <p className="text-gray-400 text-sm leading-relaxed">
                            There are no fees to join Velocity Markets. Users can participate in a certain number of free predictions monthly. For more avid users, premium subscriptions are available, offering additional predictions, advanced analytical tools, and exclusive community features.
                        </p>
                    </div>

                    <div className="bg-[#16181f] border border-white/[0.08] rounded-xl p-6 hover:border-white/[0.14] transition-colors duration-200">
                        <h3 className="flex items-center gap-2.5 text-base font-bold text-white uppercase tracking-widest mb-4">
                            <Heart className="w-5 h-5 text-[#E94560] flex-shrink-0" />
                            Customer Support
                        </h3>
                        <p className="text-gray-400 text-sm leading-relaxed">
                            {"Our dedicated support team is available to help with any questions or issues you may encounter. Whether you need help with your account, predictions, or just want to give feedback, we're here to assist you."}
                        </p>
                    </div>
                </div>

                {/* Privacy & Security */}
                <div className="bg-[#16181f] border border-white/[0.08] rounded-xl p-6 md:p-8 mb-6 hover:border-white/[0.14] transition-colors duration-200">
                    <h3 className="flex items-center gap-2.5 text-base font-bold text-white uppercase tracking-widest mb-4">
                        <Shield className="w-5 h-5 text-[#00D4AA] flex-shrink-0" />
                        Privacy and Security
                    </h3>
                    <p className="text-gray-400 text-sm leading-relaxed">
                        At Velocity Markets, we prioritize your privacy and security. All personal information is securely stored and protected. We adhere to strict data protection requirements to ensure that your information is safe with us.
                    </p>
                </div>

                {/* CTA Banner */}
                <div className="relative bg-[#16181f] border border-white/[0.08] rounded-xl p-8 md:p-10 text-center overflow-hidden">
                    {/* Subtle accent glow */}
                    <div className="absolute inset-0 bg-gradient-to-br from-[#E94560]/5 via-transparent to-[#00D4AA]/5 pointer-events-none" />

                    <div className="relative">
                        <Trophy className="w-8 h-8 text-[#E94560] mx-auto mb-4" />
                        <h3 className="text-2xl md:text-3xl font-bold text-white mb-4 tracking-tight">
                            Join the Revolution
                        </h3>
                        <p className="text-gray-400 max-w-2xl mx-auto leading-relaxed text-sm md:text-base">
                            {"Velocity Markets offers a unique blend of excitement, competition, and learning. Whether you're a seasoned car enthusiast or new to the world of auctions, our platform lets you test your skills, compete with peers, and enjoy the thrill of the auction from anywhere. Get ready to experience the future of car auctions — where your predictions power your success."}
                        </p>
                    </div>
                </div>

            </div>
        </div>
    );
}
