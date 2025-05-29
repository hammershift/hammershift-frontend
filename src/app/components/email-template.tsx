interface EmailTemplateProps {
  name?: string;
  url?: string;
}

export const VerifyEmailTemplate = ({ name, url }: EmailTemplateProps) => (
  <div style={{ padding: '40px 20px', fontFamily: "'Segoe UI', 'Helvetica Neue', 'Helvetica', 'Arial', sans-serif" }}>
    <div
      style={{
        backgroundColor: '#1A2A3C',
        color: '#FFFFFF',
        maxWidth: '600px',
        margin: '0 auto',
        padding: '40px 30px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
        lineHeight: '1.6',
      }}
    >
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <img
          src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/08c277_VelocityMarketsLogo-White.png"
          alt="Velocity Markets Logo"
          style={{ maxWidth: '180px', height: 'auto' }}
        />
      </div>

      <h1 style={{ color: '#FFFFFF', fontSize: '26px', fontWeight: 'bold', marginBottom: '16px', textAlign: 'center' }}>
        {`Welcome to Velocity Markets, ${name}!`}
      </h1>
      <p style={{ color: '#FFFFFF', fontSize: '16px', textAlign: 'center', marginBottom: '24px' }}>
        Please verify your email address by clicking the button below.
      </p>
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <a
          href={url}
          style={{
            backgroundColor: '#F2CA16',
            color: '#0C1924',
            padding: '14px 28px',
            textDecoration: 'none',
            borderRadius: '8px',
            fontWeight: 'bold',
            fontSize: '16px',
            display: 'inline-block',
          }}
        >
          Verify Email
        </a>
      </div>

      <p style={{ fontSize: '14px', color: '#BBBBBB', textAlign: 'center', marginBottom: '8px' }}>
        {"If the button doesn't work, copy and paste this link into your browser:"}
      </p>
      <div style={{ textAlign: 'center', wordBreak: 'break-word' }}>
        <a href={url} style={{ color: '#3B82F6', fontSize: '14px' }}>{url}</a>
      </div>
    </div>
  </div>
);

export const ResetPasswordEmailTemplate = ({ url }: EmailTemplateProps) => (
  <div style={{ padding: '40px 20px', fontFamily: 'Arial, sans-serif' }}>
    <div
      style={{
        backgroundColor: '#1A2A3C',
        color: '#FFFFFF',
        maxWidth: '600px',
        margin: '0 auto',
        padding: '40px 30px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
        lineHeight: '1.6',
      }}
    >
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <img
          src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/08c277_VelocityMarketsLogo-White.png"
          alt="Velocity Markets Logo"
          style={{ maxWidth: '180px', height: 'auto' }}
        />
      </div>

      <h1 style={{ color: '#FFFFFF', fontSize: '26px', fontWeight: 'bold', marginBottom: '16px', textAlign: 'center' }}>
        Reset Your Password
      </h1>
      <p style={{ color: '#FFFFFF', fontSize: '16px', marginBottom: '24px', textAlign: 'center' }}>
        Click the button below to reset your password.
      </p>

      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <a
          href={url}
          style={{
            backgroundColor: '#F2CA16',
            color: '#0C1924',
            padding: '14px 28px',
            textDecoration: 'none',
            borderRadius: '8px',
            fontWeight: 'bold',
            fontSize: '16px',
            display: 'inline-block',
          }}
        >
          Reset Password
        </a>
      </div>

      <p style={{ fontSize: '14px', color: '#BBBBBB', textAlign: 'center', marginBottom: '8px' }}>
        {"If the button above doesn't work, copy and paste this link into your browser:"}
      </p>
      <div style={{ textAlign: 'center', wordBreak: 'break-word' }}>
        <a href={url} style={{ color: '#3B82F6', fontSize: '14px' }}>{url}</a>
      </div>

      <p style={{ fontSize: '12px', color: '#888888', textAlign: 'center', marginTop: '32px' }}>
        {"If you didn't request a password reset, you can safely ignore this email."}
      </p>
    </div>
  </div>
);