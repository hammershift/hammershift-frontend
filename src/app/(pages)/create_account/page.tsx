
'use client'
import React, { useState } from 'react';
import { AlertCircle } from "lucide-react";
import { useRouter } from 'next/navigation';
import { createPageUrl } from '@/app/components/utils';
import { Card } from '@/app/components/ui/card';
import { Input } from '@/app/components/ui/input';
import { Button } from '@/app/components/ui/button';
import { Alert, AlertDescription } from '@/app/components/ui/alert';
import { Checkbox } from '@/app/components/ui/checkbox';
import { signIn } from 'next-auth/react';

export default function CustomSignupPage() {
    const router = useRouter();
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [formData, setFormData] = useState({
        username: "",
        fullName: "",
        email: "",
        agreeToTerms: false,
        isOver18: false,
    });

    const handleChange = (e: { target: any; }) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e: { preventDefault: () => void; }) => {
        console.log("hello");
        e.preventDefault();
        setError("");
        setIsLoading(true);

        if (!formData.agreeToTerms || !formData.isOver18) {
            setError("You must agree to the terms and confirm you are over 18 to continue.");
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch('/api/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: formData.email,
                    username: formData.username,
                    fullName: formData.fullName,
                    provider: 'credentials',
                }),
            });
            if (!response.ok) {
                const data = await response.json();
                if (data.message === 'Username already used') {
                    setError("Username is already in use. Try a different one.");
                }
                else if (data.message === 'Email already used') {
                    setError("Email is already in use. Try a different one.");
                }
                else if (data.message === 'Invalid email') {
                    setError("Invalid email. Try a different one.");
                }
                else {
                    console.log(data);
                    setError("Error. Please try again.");
                }
                setIsLoading(false);
                return;
            }

            const signInResponse = await signIn('credentials', {
                redirect: false,
                email: formData.email,
            });

            if (signInResponse?.error) {
                setError('Sign-up successful but auto sign-in failed. Redirecting to home page.');
                setTimeout(() => {
                    router.push('/');
                }, 2000);
            }
            else {
                router.push("/");
            }
        } catch (error) {
            setError("Failed to create account. Please try again.");
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <Card className="w-full max-w-md bg-[#13202D] border-[#1E2A36] p-6">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold mb-2">Create Your Account</h1>
                    <p className="text-gray-400">Join Velocity Markets and start predicting</p>
                </div>

                {error && (
                    <Alert variant="destructive" className="mb-6 text-red-500">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Username
                        </label>
                        <Input
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            required
                            className="bg-[#1E2A36] border-[#1E2A36]"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Full Name
                        </label>
                        <Input
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleChange}
                            required
                            className="bg-[#1E2A36] border-[#1E2A36]"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Email
                        </label>
                        <Input
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="bg-[#1E2A36] border-[#1E2A36]"
                        />
                    </div>

                    <div className="space-y-4 pt-4">
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="isOver18"
                                name="isOver18"
                                checked={formData.isOver18}
                                onCheckedChange={(checked: any) => handleChange({
                                    target: { name: 'isOver18', type: 'checkbox', checked }
                                })}
                            />
                            <label
                                htmlFor="isOver18"
                                className="text-sm leading-none"
                            >
                                I confirm that I am at least 18 years old
                            </label>
                        </div>

                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="agreeToTerms"
                                name="agreeToTerms"
                                checked={formData.agreeToTerms}
                                onCheckedChange={(checked: any) => handleChange({
                                    target: { name: 'agreeToTerms', type: 'checkbox', checked }
                                })}
                            />
                            <label
                                htmlFor="agreeToTerms"
                                className="text-sm leading-none"
                            >
                                I agree to the Terms of Service and Privacy Policy
                            </label>
                        </div>
                    </div>

                    <Button
                        type="submit"
                        className={`w-full bg-[#F2CA16] text-[#0C1924] hover:bg-[#F2CA16]/90 ${isLoading ? 'pointer-events-none opacity-50' : ''}`}
                        aria-disabled={isLoading}
                    >
                        Create Account
                    </Button>

                    <p className="text-center text-sm text-gray-400">
                        Already have an account?{" "}
                        <Button
                            type="button"
                            variant="link"
                            className="text-[#F2CA16] p-0"
                            onClick={() => router.push("/login_page")}
                        >
                            Log in
                        </Button>
                    </p>
                </form>
            </Card>
        </div>
    );
}
