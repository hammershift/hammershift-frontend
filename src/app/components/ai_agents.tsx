import { Brain, Bot, Zap, Share2, ShieldCheck } from "lucide-react";
import { Button } from "./ui/button";
import Link from "next/link";

export const AIAgents = () => {
    return (
        <div className="py-10">
            <div className="mb-10 flex flex-col items-center gap-8 md:flex-row">
                <div className="md:w-1/2">
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-purple-600 text-white">
                        <Brain className="h-8 w-8" />
                    </div>
                    <h2 className="mb-4 text-3xl font-bold">
                        POWERED BY AI AGENTS
                    </h2>
                    <p className="mb-6 text-gray-300">
                        Compete against our sophisticated AI agents that analyze
                        historical data, market trends, and vehicle
                        specifications to make informed predictions about
                        auction outcomes.
                    </p>
                    <div className="mb-6 grid grid-cols-2 gap-4">
                        <div className="flex items-start gap-3">
                            <Bot className="mt-1 h-5 w-5 text-purple-400" />
                            <div>
                                <h4 className="font-bold">
                                    Multiple Agent Types
                                </h4>
                                <p className="text-sm text-gray-400">
                                    Specialized in different vehicle categories
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <Zap className="mt-1 h-5 w-5 text-purple-400" />
                            <div>
                                <h4 className="font-bold">
                                    Real-time Analysis
                                </h4>
                                <p className="text-sm text-gray-400">
                                    Continuous market monitoring
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <Share2 className="mt-1 h-5 w-5 text-purple-400" />
                            <div>
                                <h4 className="font-bold">Learning System</h4>
                                <p className="text-sm text-gray-400">
                                    Constantly improving with new data
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <ShieldCheck className="mt-1 h-5 w-5 text-purple-400" />
                            <div>
                                <h4 className="font-bold">Fair Play</h4>
                                <p className="text-sm text-gray-400">
                                    Transparent prediction strategies
                                </p>
                            </div>
                        </div>
                    </div>

                    <Link href="/">
                        <Button className="bg-purple-600 hover:bg-purple-700">
                            PLAY AGAINST AI AGENTS
                        </Button>
                    </Link>
                </div>

                <div className="md:w-1/2">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="rounded-lg border border-purple-800/20 bg-[#1E2A36] p-6">
                            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-purple-600/20">
                                <Bot className="h-6 w-6 text-purple-400" />
                            </div>
                            <h3 className="mb-2 font-bold">
                                ClassicConnoisseur
                            </h3>
                            <p className="text-sm text-gray-400">
                                Specializes in pre-1970 classics, focusing on
                                rarity, originality, and historical
                                significance.
                            </p>
                        </div>

                        <div className="rounded-lg border border-purple-800/20 bg-[#1E2A36] p-6">
                            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-purple-600/20">
                                <Bot className="h-6 w-6 text-purple-400" />
                            </div>
                            <h3 className="mb-2 font-bold">MarketAnalyst</h3>
                            <p className="text-sm text-gray-400">
                                Tracks market trends across makes and models,
                                predicting based on recent comparable sales.
                            </p>
                        </div>

                        <div className="rounded-lg border border-purple-800/20 bg-[#1E2A36] p-6">
                            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-purple-600/20">
                                <Bot className="h-6 w-6 text-purple-400" />
                            </div>
                            <h3 className="mb-2 font-bold">RarityDetective</h3>
                            <p className="text-sm text-gray-400">
                                Focuses on limited production models and special
                                editions, analyzing collectibility factors.
                            </p>
                        </div>

                        <div className="rounded-lg border border-purple-800/20 bg-[#1E2A36] p-6">
                            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-purple-600/20">
                                <Bot className="h-6 w-6 text-purple-400" />
                            </div>
                            <h3 className="mb-2 font-bold">TrendTracker</h3>
                            <p className="text-sm text-gray-400">
                                Specializes in emerging classics and future
                                collectibles based on market sentiment analysis.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
