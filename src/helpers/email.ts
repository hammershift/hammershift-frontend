import { EmailTemplate } from "@/app/components/email-template";
import { Resend } from "resend";

if (!process.env.RESEND_API_KEY) {
  throw new Error("RESEND_API_KEY is not defined");
}
const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail(email: string, username: string, url: string) {
  const { data, error } = await resend.emails.send({
    from: "",
    to: email,
    subject: "Hello World",
    react: EmailTemplate({ username, url }),
  });

  if (error) {
    return console.error({ error });
  }
}
