'use client'
import React from 'react';
import { Button } from "@/app/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from 'next/navigation';
import { createPageUrl } from '@/app/components/utils';

export default function ComingSoon() {
    const router = useRouter();

    return (
        <div className="min-h-[80vh] flex items-center justify-center">
            <div className="text-center px-4">
                <h1 className="text-4xl md:text-6xl font-bold mb-6">CAREERS</h1>
                <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
                    {"We're growing our team! Check back soon for exciting career opportunities at Velocity Markets."}
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                    <Button
                        onClick={() => router.back()}
                        variant="outline"
                        className="border-[#E94560] text-[#E94560] hover:bg-[#E94560] hover:text-[#0C1924]"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Go Back
                    </Button>
                    <Button
                        onClick={() => router.push(createPageUrl("Contact"))}
                        className="bg-[#E94560] text-[#0C1924] hover:bg-[#E94560]/90"
                    >
                        Contact Us
                    </Button>
                </div>
            </div>
        </div>
    );
}