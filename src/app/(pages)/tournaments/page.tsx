import React from 'react';
import { AlertTriangle } from "lucide-react";



export default function Tournaments() {

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold mb-1">TOURNAMENTS</h1>
                    <p className="text-gray-400">Compete against others for real prizes</p>
                </div>
            </div>

            <div className="bg-orange-900/20 border border-orange-800/30 rounded-md p-4 mb-8">
                <div className="flex gap-3">
                    <AlertTriangle className="text-orange-500 flex-shrink-0 mt-1" />
                    <div>
                        <p className="text-orange-400 text-sm">
                            <strong>Risk Disclosure:</strong> Velocity Markets is intended for entertainment purposes.
                            While we offer paid games with real prizes, these involve financial risk. A 12% platform fee
                            is applied to tournament entries. Never participate with money you cannot afford to lose.
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex justify-between items-center justify-center mb-6">
                <div className="flex justify-center items-center w-full">
                    <div className="text-5xl font-bold mb-1">COMING SOON</div>
                </div>
            </div>
        </div>
    );
};
