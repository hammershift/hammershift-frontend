import React from 'react';
import { BadgeInfo, Trophy, Users, BarChart3, Heart, Shield } from "lucide-react";

export default function HowItWorks() {
    const steps = [
        {
            icon: <Users className="w-6 h-6" />,
            title: "JOINING VELOCITY MARKETS",
            description: "To get started, simply visit our website and sign up. Registration is quick and allows you immediate access to our auction prediction platform. Once registered, you're ready to dive into the world of auction predictions."
        },
        {
            icon: <BadgeInfo className="w-6 h-6" />,
            title: "UNDERSTANDING THE AUCTIONS",
            description: "Velocity Markets collaborates with Bring a Trailer (BaT) to bring you live auction feeds. Users can browse through ongoing auctions to select the ones they find most intriguing or where they believe their knowledge will give them an edge in predictions."
        },
        {
            icon: <BarChart3 className="w-6 h-6" />,
            title: "MAKING PREDICTIONS",
            description: "Once you've selected an auction, it's time to place your wager on the outcome. Predict the final selling price based on your understanding of the car's value, market trends, and past auction results."
        },
        {
            icon: <Trophy className="w-6 h-6" />,
            title: "SCORING AND REWARDS",
            description: "After the auction concludes, predictions are tallied and winners are determined based on the accuracy of their predictions. Points are awarded not just for accuracy but also for the insight shown in your predictions."
        }
    ];

    return (
        <div className="container mx-auto px-4 py-12">
            <h1 className="text-4xl font-bold text-center mb-12">HOW IT WORKS: VELOCITY MARKETS</h1>

            <div className="max-w-3xl mx-auto space-y-16">
                <div className="text-gray-300 text-lg leading-relaxed">
                    Welcome to Velocity Markets, where the excitement of car auctions meets the thrill of strategic prediction. Please note that all users must be 18 or older to use our platform, and 21 or older to participate in paid games.
                </div>

                <div className="space-y-12">
                    {steps.map((step, index) => (
                        <div key={index} className="flex gap-6">
                            <div className="flex-shrink-0">
                                <div className="w-12 h-12 rounded-full bg-[#FFD700] text-black flex items-center justify-center">
                                    {step.icon}
                                </div>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-[#FFD700] mb-2">{step.title}</h3>
                                <p className="text-gray-300">{step.description}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="grid md:grid-cols-2 gap-8 pt-8">
                    <div className="bg-[#2C2C2C] p-6 rounded-lg">
                        <h3 className="flex items-center gap-2 text-xl font-bold mb-4">
                            <BadgeInfo className="text-[#FFD700]" />
                            FEES AND CHARGES
                        </h3>
                        <p className="text-gray-300">
                            There are no fees to join Velocity Markets. Users can participate in a certain number of free predictions monthly. For more avid users, premium subscriptions are available, offering additional predictions, advanced analytical tools, and exclusive community features.
                        </p>
                    </div>

                    <div className="bg-[#2C2C2C] p-6 rounded-lg">
                        <h3 className="flex items-center gap-2 text-xl font-bold mb-4">
                            <Heart className="text-[#FFD700]" />
                            CUSTOMER SUPPORT
                        </h3>
                        <p className="text-gray-300">
                            {"Our dedicated support team is available to help with any questions or issues you may encounter. Whether you need help with your account, predictions, or just want to give feedback, we're here to assist you."}
                        </p>
                    </div>
                </div>

                <div className="bg-[#2C2C2C] p-8 rounded-lg">
                    <h3 className="flex items-center gap-2 text-xl font-bold mb-4">
                        <Shield className="text-[#FFD700]" />
                        PRIVACY AND SECURITY
                    </h3>
                    <p className="text-gray-300">
                        At Velocity Markets, we prioritize your privacy and security. All personal information is securely stored and protected. We adhere to strict data protection requirements to ensure that your information is safe with us.
                    </p>
                </div>

                <div className="text-center bg-gradient-to-r from-[#2C2C2C] to-[#1A1A1A] p-8 rounded-lg">
                    <h3 className="text-2xl font-bold mb-4">JOIN THE REVOLUTION</h3>
                    <p className="text-gray-300 max-w-2xl mx-auto">
                        {"Velocity Markets offers a unique blend of excitement, competition, and learning. Whether you're a seasoned car enthusiast or new to the world of auctions, Velocity Markets provides a platform to test your skills, compete with peers, and enjoy the thrill of the auction from anywhere. Get ready to experience the future of car auctions with Velocity Markets—where your predictions power your success. Join us today and place yourself in the driver's seat of auction prediction!"}
                    </p>
                </div>
            </div>
        </div>
    );
}