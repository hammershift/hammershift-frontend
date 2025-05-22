"use client";
import { Alert, AlertDescription } from "@/app/components/ui/alert";
import { Button } from "@/app/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/app/components/ui/tabs";
import { TextArea } from "@/app/components/ui/textarea";
import { AlertCircle, CheckCircle2, UserRound } from "lucide-react";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { SetStateAction, useEffect, useState } from "react";

export default function Settings() {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [about, setAbout] = useState("");
  const [message, setMessage] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const { data } = useSession();
  const router = useRouter();

  const getUserInfo = async (email: string) => {
    const res = await fetch(`/api/userInfo?email=${email}`, {
      method: "GET",
    });
    if (!res.ok) {
      throw new Error("Unable to fetch user transactions");
    }
    const result = await res.json();
    setAbout(result.user.about);
    setLoading(false);
  };

  useEffect(() => {
    console.log(data);
    if (data) {
      setName(data?.user.name);
      setUsername(data?.user.username!);
      getUserInfo(data?.user.email);
    } else {
      router.push("/login_page");
    }
  }, [data]);

  const handleProfileUpdate = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });
    setIsLoading(true);
    try {
      const response = await fetch("/api/userInfo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          about: about,
        }),
      });
      if (!response.ok) {
        const data = await response.json();
        //TODO: Error
        if (data.message === "Username already used") {
          setMessage({
            type: "error",
            text: "Username is already in use. Try a different one.",
          });
        }
        setIsLoading(false);
        return;
      }
      setMessage({
        type: "success",
        text: "Profile updated successfully!",
      });
      setIsLoading(false);
      setTimeout(() => {
        router.push("profile");
      }, 2000);
    } catch (error) {
      console.error("Error updating profile:", error);
      setMessage({
        type: "error",
        text: "Failed to update profile. Please try again.",
      });
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-b-transparent border-l-transparent border-r-transparent border-t-[#F2CA16]"></div>
            <p className="text-xl">Loading account settings...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="mb-8 text-3xl font-bold">Account Settings</h1>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="mb-6 bg-[#1E2A36]">
          <TabsTrigger
            value="profile"
            className="flex items-center gap-2 data-[state=active]:bg-[#F2CA16] data-[state=active]:text-[#0C1924]"
          >
            <UserRound className="h-4 w-4" />
            Profile
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card className="border-[#1E2A36] bg-[#13202D]">
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileUpdate} className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      Email Address
                    </label>
                    <Input
                      value={data ? data.user.email : ""}
                      disabled
                      className="border-[#1E2A36] bg-[#1E2A36] opacity-70"
                    />
                    <p className="mt-1 text-sm text-gray-400">
                      Your email address cannot be changed.
                    </p>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      Full Name
                    </label>
                    <Input
                      value={name}
                      disabled
                      className="border-[#1E2A36] bg-[#1E2A36] opacity-70"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      Username
                    </label>
                    <Input
                      value={username}
                      disabled
                      className="border-[#1E2A36] bg-[#1E2A36]"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      About
                    </label>
                    <TextArea
                      value={about}
                      onChange={(e: {
                        target: { value: SetStateAction<string> };
                      }) => setAbout(e.target.value)}
                      placeholder="Tell others about yourself"
                      className="border-[#1E2A36] bg-[#1E2A36]"
                      rows={3}
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className={`bg-[#F2CA16] text-[#0C1924] hover:bg-[#F2CA16]/90 ${isLoading ? "pointer-events-none opacity-50" : ""}`}
                >
                  {isLoading ? "Saving" : "Save Changes"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {message.text && (
        <Alert
          className={`mb-6 ${
            message.type === "error"
              ? "border-red-600 bg-red-900/20 text-red-500"
              : "border-green-600 bg-green-900/20 text-green-500"
          }`}
        >
          {message.type === "error" ? (
            <AlertCircle className="h-4 w-4" />
          ) : (
            <CheckCircle2 className="h-4 w-4" />
          )}
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
