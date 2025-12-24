'use client';

export default function Error({ error, reset }) {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      background: '#1a1a1a',
      color: '#fff',
      padding: '20px',
      direction: 'rtl'
    }}>
      <div style={{
        maxWidth: '500px',
        textAlign: 'center'
      }}>
        <h1 style={{ fontSize: '48px', marginBottom: '20px' }}>❌ خطأ!</h1>
        
        <div style={{
          background: '#2a2a2a',
          padding: '20px',
          borderRadius: '8px',
          marginBottom: '20px',
          textAlign: 'left',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          maxHeight: '300px',
          overflow: 'auto',
          fontSize: '12px',
          fontFamily: 'monospace'
        }}>
          <strong style={{ color: '#ff6b6b' }}>الخطأ:</strong>
          {'\n'}
          {error?.message || 'حدث خطأ غير معروف'}
          {'\n\n'}
          <strong style={{ color: '#ffd93d' }}>التفاصيل:</strong>
          {'\n'}
          {error?.stack || 'لا توجد تفاصيل إضافية'}
        </div>

        <button
          onClick={() => reset()}
          style={{
            padding: '12px 24px',
            background: 'linear-gradient(135deg,#0d6efd,#7aa7ff)',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 'bold',
            marginRight: '10px'
          }}
        >
          حاول مرة أخرى
        </button>

        <a href="/debug" style={{
          padding: '12px 24px',
          background: '#ffd93d',
          color: '#000',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '16px',
          fontWeight: 'bold',
          textDecoration: 'none',
          display: 'inline-block'
        }}>
          🔍 صفحة التشخيص
        </a>
      </div>
    </div>
  );
}
