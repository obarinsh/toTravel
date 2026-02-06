'use client';

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#FAFAF8',
          fontFamily: 'system-ui, sans-serif',
        }}>
          <div style={{ textAlign: 'center', padding: '24px' }}>
            <h2 style={{
              fontSize: '24px',
              fontWeight: 600,
              color: '#1a1a1a',
              marginBottom: '16px',
            }}>
              Something went wrong
            </h2>
            <p style={{
              color: '#666',
              marginBottom: '24px',
            }}>
              A critical error occurred. Please try again.
            </p>
            <button
              onClick={() => reset()}
              style={{
                padding: '12px 24px',
                backgroundColor: '#5C6B4A',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '16px',
              }}
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
