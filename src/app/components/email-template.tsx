interface EmailTemplateProps {
  username: string;
  url: string;
}

export const EmailTemplate = ({ username, url }: EmailTemplateProps) => (
  <div>
    <h1>Welcome to Velocity Markets, {username}!</h1>
    <p>Click the link to verify your email: {url}</p>
  </div>
);
