interface EmailTemplateProps {
  name?: string;
  url?: string;
}

export const VerifyEmailTemplate = ({ name, url }: EmailTemplateProps) => (
  <div>
    <h1>Welcome to Velocity Markets, {name}!</h1>
    <p>Click the link to verify your email: {url}</p>
  </div>
);

export const ResetPasswordEmailTemplate = ({ url }: EmailTemplateProps) => (
  <div>
    <h1>Reset Password</h1>
    <p>Click the link to reset your password: {url}</p>
  </div>
);
