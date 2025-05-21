import { EmailTemplate } from "@/app/components/email-template";
import { Resend } from "resend";

if (!process.env.RESEND_API_KEY) {
  throw new Error("RESEND_API_KEY is not defined");
}
const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail(email: string, username: string, url: string) {
  const { data, error } = await resend.emails.send({
    from: process.env.EMAIL_FROM || "",
    to: email,
    subject: "Welcome to Velocity Markets!",
    react: EmailTemplate({ username, url }),
  });

  if (error) {
    return console.error({ error });
  }
}
