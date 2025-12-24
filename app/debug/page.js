'use client';

export default function DebugPage() {
  const getSystemInfo = () => {
    const info = {
      'وقت الطلب': new Date().toLocaleString('ar-SA'),
      'المتصفح': typeof navigator !== 'undefined' ? navigator.userAgent : 'غير متاح',
      'اللغة': typeof navigator !== 'undefined' ? navigator.language : 'غير متاح',
      'البيئة': process.env.NODE_ENV || 'development',
      'الإصدار': process.version || 'Node.js',
      'Platform': typeof navigator !== 'undefined' ? navigator.platform : 'غير متاح',
      'الذاكرة': typeof performance !== 'undefined' ? Math.round(performance.memory?.usedJSHeapSize / 1048576) + ' MB' : 'غير متاح'
    };
    return info;
  };

  const systemInfo = getSystemInfo();

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
      padding: '40px 20px',
      direction: 'rtl',
      color: '#fff'
    }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '40px', color: '#ffd93d' }}>
          🔍 صفحة التشخيص
        </h1>

        {/* معلومات النظام */}
        <div style={{
          background: '#2a2a2a',
          padding: '20px',
          borderRadius: '12px',
          marginBottom: '20px',
          border: '1px solid #444'
        }}>
          <h2 style={{ marginBottom: '15px', color: '#7aa7ff' }}>📊 معلومات النظام</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            {Object.entries(systemInfo).map(([key, value]) => (
              <div key={key} style={{ padding: '10px', background: '#1a1a1a', borderRadius: '6px' }}>
                <strong style={{ color: '#ffd93d' }}>{key}:</strong>
                <div style={{ color: '#ccc', marginTop: '5px', fontSize: '12px', wordBreak: 'break-word' }}>
                  {String(value)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* متغيرات البيئة */}
        <div style={{
          background: '#2a2a2a',
          padding: '20px',
          borderRadius: '12px',
          marginBottom: '20px',
          border: '1px solid #444'
        }}>
          <h2 style={{ marginBottom: '15px', color: '#7aa7ff' }}>🔧 متغيرات البيئة</h2>
          <div style={{
            background: '#1a1a1a',
            padding: '15px',
            borderRadius: '6px',
            fontFamily: 'monospace',
            fontSize: '12px',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            maxHeight: '300px',
            overflow: 'auto'
          }}>
            {process.env.NODE_ENV ? (
              <>
                NODE_ENV = {process.env.NODE_ENV}
                {'\n'}
                NEXT_PUBLIC_* = متاحة
              </>
            ) : (
              'لا توجد متغيرات بيئة محددة'
            )}
          </div>
        </div>

        {/* قائمة الأخطاء الشائعة */}
        <div style={{
          background: '#2a2a2a',
          padding: '20px',
          borderRadius: '12px',
          marginBottom: '20px',
          border: '1px solid #444'
        }}>
          <h2 style={{ marginBottom: '15px', color: '#7aa7ff' }}>⚠️ أخطاء شائعة وحلولها</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {[
              {
                error: 'Build failed',
                solution: 'تحقق من package.json والمكتبات المثبتة'
              },
              {
                error: 'Cannot find module',
                solution: 'تأكد من تثبيت المكتبات: npm install'
              },
              {
                error: 'Port already in use',
                solution: 'غير المنفذ أو أغلق التطبيق السابق'
              },
              {
                error: 'Memory heap out of memory',
                solution: 'زيادة ذاكرة Node.js أو تحسين الكود'
              }
            ].map((item, idx) => (
              <div key={idx} style={{
                background: '#1a1a1a',
                padding: '12px',
                borderRadius: '6px',
                borderRight: '4px solid #ff6b6b'
              }}>
                <strong style={{ color: '#ff6b6b' }}>❌ {item.error}</strong>
                <div style={{ color: '#90ee90', marginTop: '8px', fontSize: '14px' }}>
                  ✅ {item.solution}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* روابط مفيدة */}
        <div style={{
          background: '#2a2a2a',
          padding: '20px',
          borderRadius: '12px',
          border: '1px solid #444'
        }}>
          <h2 style={{ marginBottom: '15px', color: '#7aa7ff' }}>🔗 روابط مفيدة</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <a href="/" style={{
              color: '#7aa7ff',
              textDecoration: 'none',
              padding: '10px',
              background: '#1a1a1a',
              borderRadius: '6px'
            }}>
              → الصفحة الرئيسية
            </a>
            <a href="/gallery" style={{
              color: '#7aa7ff',
              textDecoration: 'none',
              padding: '10px',
              background: '#1a1a1a',
              borderRadius: '6px'
            }}>
              → معرض الشعبيات
            </a>
            <a href="https://github.com/TRstor/bot-telg" style={{
              color: '#7aa7ff',
              textDecoration: 'none',
              padding: '10px',
              background: '#1a1a1a',
              borderRadius: '6px'
            }}>
              → GitHub Repository
            </a>
          </div>
        </div>

        {/* زر الرجوع */}
        <div style={{ textAlign: 'center', marginTop: '30px' }}>
          <button
            onClick={() => window.location.href = '/'}
            style={{
              padding: '12px 24px',
              background: 'linear-gradient(135deg,#0d6efd,#7aa7ff)',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold'
            }}
          >
            العودة للصفحة الرئيسية
          </button>
        </div>
      </div>
    </div>
  );
}
