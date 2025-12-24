export default function Home() {
  return (
    <main style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      color: '#fff',
      direction: 'rtl'
    }}>
      <div style={{
        textAlign: 'center',
        maxWidth: '500px',
        padding: '20px'
      }}>
        <h1 style={{ fontSize: '48px', marginBottom: '20px' }}>🎨 معرض الشعبيات</h1>
        <p style={{ fontSize: '18px', marginBottom: '30px', opacity: '0.8' }}>
          استمتع بأجمل صور الشعبيات من لعبة PUBG
        </p>
        
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href="/gallery" style={{
            padding: '12px 24px',
            background: 'linear-gradient(135deg,#0d6efd,#7aa7ff)',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 'bold',
            textDecoration: 'none',
            transition: 'transform 0.2s'
          }}>
            فتح المعرض 👉
          </a>
        </div>

        <div style={{
          marginTop: '50px',
          padding: '20px',
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '12px',
          textAlign: 'right'
        }}>
          <h3>✨ المميزات:</h3>
          <ul style={{ listStyle: 'none', padding: 0, textAlign: 'right' }}>
            <li>📸 معاينة صور بجودة عالية</li>
            <li>♥ حفظ المفضلة محلياً</li>
            <li>🔍 بحث سريع</li>
            <li>📊 إحصائيات المشاهدات</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
