import {
  VerifyEmailTemplate,
  ResetPasswordEmailTemplate,
} from "@/app/components/email-template";
import { Resend } from "resend";

if (!process.env.EMAIL_SERVER_PASSWORD) {
  throw new Error("RESEND_API_KEY is not defined");
}
const resend = new Resend(process.env.EMAIL_SERVER_PASSWORD);

interface EmailObject {
  from: string;
  to: string;
  subject: string;
  react: any;
}
export async function sendEmail(
  email: string,
  name: string,
  url: string,
  type: string
) {
  let emailObj: EmailObject = {
    from: "",
    to: "",
    subject: "",
    react: "",
  };
  if (!email) {
    return console.error("Email is required");
  }
  if (type === "verify") {
    emailObj = {
      from: process.env.EMAIL_FROM || "",
      to: email,
      subject: "Welcome to Velocity Markets!",
      react: VerifyEmailTemplate({ name, url }),
    };
  } else if (type === "reset") {
    emailObj = {
      from: process.env.EMAIL_FROM || "",
      to: email,
      subject: "Reset Password",
      react: ResetPasswordEmailTemplate({ url }),
    };
  }
  const { data, error } = await resend.emails.send({
    ...emailObj,
  });
  if (error) {
    return console.error({ error });
  }
  // if (type === "verify") {
  //   const { data, error } = await resend.emails.send({
  //     from: process.env.EMAIL_FROM || "",
  //     to: email,
  //     subject: "Welcome to Velocity Markets!",
  //     react: VerifyEmailTemplate({ username, url }),
  //   });

  //   if (error) {
  //     return console.error({ error });
  //   }
  // } else if (type === "reset") {
  //   const { data, error } = await resend.emails.send({
  //     from: process.env.EMAIL_FROM || "",
  //     to: email,
  //     subject: "Reset Password",
  //     react: VerifyEmailTemplate({ url }),
  //   });

  //   if (error) {
  //     return console.error({ error});
  //   }
  // }
}

// export async function sendResetPasswordEmail(email: string, url: string) {
//   const { data, error } = await resend.emails.send({
//     from: process.env.EMAIL_FROM || "",
//     to: email,
//     subject: "Reset Password",
//     react: VerifyEmailTemplate({ url }),
//   });

//   if (error) {
//     return console.error({ error });
//   }
// }
