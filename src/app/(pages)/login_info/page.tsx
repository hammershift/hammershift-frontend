"use client"
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function LogoInfo() {
    const { data: session } = useSession();
    const router = useRouter();

    useEffect(() => {

        const handleSession = async () => {
            if (!session || !session.user) {
                return;
            }
            else {
                router.push("/authenticated");
            }
        }

        const checkSession = async () => {
            await handleSession();
        };

        checkSession();
    }, [session]);

    return (
        <div className="container mx-auto px-4 py-12">
            <div className="flex justify-between items-center justify-center mt-6">
                <div className="flex justify-center items-center w-full">
                    <div className="text-2xl font-bold mb-1">Sent sign-in link to email. Please check your mail for the link to sign-in.</div>
                </div>
            </div>
        </div>
    );
};
