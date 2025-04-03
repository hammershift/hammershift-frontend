
import React, { useState, useEffect } from 'react';

export default function PriceIsRight() {
    return (
        <div className="container mx-auto px-4 py-12">
            <div className="bg-gradient-to-r from-[#399645] to-[#287A34] -mx-4 px-4 py-10 mb-8">
                <div className="container mx-auto">
                    <h1 className="text-3xl font-bold mb-2 text-white">GUESS THE HAMMER</h1>
                    <p className="text-green-100">Test your knowledge with real money predictions</p>
                </div>
            </div>

            <div className="bg-green-900/20 border border-green-800/30 rounded-md p-4 mb-8">
                <p className="text-green-400">
                    <strong>Important:</strong> All wagering activities on Velocity Markets involve financial risk.
                    A 12% platform fee is applied to winnings. You should not wager with funds you cannot afford to lose.
                    Predictions are based solely on your opinion, and Velocity Markets makes no guarantees regarding accuracy or outcomes.
                </p>
            </div>

            <div className="flex justify-between items-center justify-center mb-6">
                <div className="flex justify-center items-center w-full">
                    <div className="text-5xl font-bold mb-1">COMING SOON</div>
                </div>
            </div>
        </div>
    );
};
