interface EmailTemplateProps {
  name?: string;
  url?: string;
}

export const VerifyEmailTemplate = ({ name, url }: EmailTemplateProps) => (
  <div style={{ fontFamily: 'Arial, sans-serif', backgroundColor: '#13202D', color: '#FFFFFF', padding: '20px' }}>
    <div style={{ textAlign: 'center', marginBottom: '30px' }}>
      <img
        src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/08c277_VelocityMarketsLogo-White.png"
        alt="Velocity Markets"
        style={{ maxWidth: '200px', height: 'auto' }}
      />
    </div>
    <h1 style={{ color: '#FFFFFF', fontSize: '24px' }}>
      {`Welcome to Velocity Markets, ${name}!`}
    </h1>
    <p style={{ color: '#FFFFFF', fontSize: '16px', lineHeight: '1.5' }}>
      {"We're excited to have you on board."}
    </p>
    <p style={{ color: '#FFFFFF', fontSize: '16px', lineHeight: '1.5' }}>
      Please verify your email address by clicking the button below:
    </p>
    <div style={{ margin: '30px 0' }}>
      <a
        href={url}
        style={{
          backgroundColor: '#F2CA16',
          color: '#0C1924',
          padding: '12px 24px',
          textDecoration: 'none',
          borderRadius: '6px',
          display: 'inline-block',
          fontWeight: 'bold',
        }}
      >
        Verify Email
      </a>
    </div>
    <p style={{ color: '#AAAAAA', fontSize: '14px' }}>
      {"If the button doesn't work, click or copy & paste the following link into your browser:"}
    </p>

    <div>
      <a href={url} style={{ color: '#3B82F6' }}>{url}</a>
    </div>
  </div>
);

export const ResetPasswordEmailTemplate = ({ url }: EmailTemplateProps) => (
  <div style={{ fontFamily: 'Arial, sans-serif', backgroundColor: '#13202D', color: '#FFFFFF', padding: '20px' }}>
    <div style={{ textAlign: 'center', marginBottom: '30px' }}>
      <img
        src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/08c277_VelocityMarketsLogo-White.png"
        alt="Velocity Markets"
        style={{ maxWidth: '200px', height: 'auto' }}
      />
    </div>

    <h1 style={{ color: '#FFFFFF', fontSize: '24px' }}>
      Reset Your Password
    </h1>

    <p style={{ color: '#FFFFFF', fontSize: '16px', lineHeight: '1.5' }}>
      You recently requested to reset your password. Click the button below to proceed.
    </p>

    <div style={{ margin: '30px 0' }}>
      <a
        href={url}
        style={{
          backgroundColor: '#F2CA16',
          color: '#0C1924',
          padding: '12px 24px',
          textDecoration: 'none',
          borderRadius: '6px',
          display: 'inline-block',
          fontWeight: 'bold',
        }}
      >
        Reset Password
      </a>
    </div>

    <p style={{ color: '#AAAAAA', fontSize: '14px' }}>
      {"If the button doesn't work, click or copy & paste the following link into your browser:"}
    </p>

    <div>
      <a href={url} style={{ color: '#3B82F6' }}>{url}</a>
    </div>

    <p style={{ color: '#AAAAAA', fontSize: '12px', marginTop: '20px' }}>
      {"If you didn't request a password reset, you can safely ignore this email."}
    </p>
  </div>
);

