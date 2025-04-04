'use client'
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/group/text_card';
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { TextArea } from "@/app/components/ui/textarea";
import { Send, MapPin, Mail } from "lucide-react";

export default function Contact() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: ''
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleChange = (e: { target: { name: any; value: any; }; }) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e: { preventDefault: () => void; }) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Simulate API call
        setTimeout(() => {
            setIsSubmitting(false);
            setSubmitted(true);
            setFormData({ name: '', email: '', message: '' });
        }, 1500);
    };

    return (
        <div className="container mx-auto px-4 py-12">
            <h1 className="text-3xl font-bold text-center mb-12">CONTACT US</h1>

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                <div>
                    <Card className="bg-[#13202D] border-[#1E2A36] h-full">
                        <CardHeader>
                            <CardTitle>GET IN TOUCH</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <p className="text-gray-300">
                                {"Have questions, feedback, or need assistance? Our team is here to help. Fill out the form and we'll get back to you as soon as possible."}
                            </p>

                            <div className="space-y-4">
                                <div className="flex items-start gap-4">
                                    <MapPin className="w-5 h-5 text-[#F2CA16] mt-1" />
                                    <div>
                                        <h3 className="font-medium">Location</h3>
                                        <p className="text-gray-400">San Francisco, CA</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <Mail className="w-5 h-5 text-[#F2CA16] mt-1" />
                                    <div>
                                        <h3 className="font-medium">Email</h3>
                                        <p className="text-gray-400">rick@hammershift.com</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div>
                    <Card className="bg-[#13202D] border-[#1E2A36]">
                        <CardHeader>
                            <CardTitle>SEND A MESSAGE</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {submitted ? (
                                <div className="text-center py-8">
                                    <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Send className="w-8 h-8 text-green-500" />
                                    </div>
                                    <h3 className="text-xl font-bold mb-2">Message Sent!</h3>
                                    <p className="text-gray-400">
                                        {"Thank you for reaching out. We'll get back to you soon."}
                                    </p>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="space-y-2">
                                        <label htmlFor="name" className="text-sm font-medium">
                                            Name
                                        </label>
                                        <Input
                                            id="name"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            required
                                            className="bg-[#1E2A36] border-[#1E2A36]"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label htmlFor="email" className="text-sm font-medium">
                                            Email
                                        </label>
                                        <Input
                                            id="email"
                                            name="email"
                                            type="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                            className="bg-[#1E2A36] border-[#1E2A36]"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label htmlFor="message" className="text-sm font-medium">
                                            Message
                                        </label>
                                        <TextArea
                                            id="message"
                                            name="message"
                                            value={formData.message}
                                            onChange={handleChange}
                                            required
                                            rows={5}
                                            className="bg-[#1E2A36] border-[#1E2A36]"
                                        />
                                    </div>

                                    <Button
                                        type="submit"
                                        className="w-full bg-[#F2CA16] text-[#0C1924] hover:bg-[#F2CA16]/90"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin mr-2"></div>
                                                Sending...
                                            </>
                                        ) : (
                                            <>
                                                <Send className="w-4 h-4 mr-2" />
                                                Send Message
                                            </>
                                        )}
                                    </Button>
                                </form>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}