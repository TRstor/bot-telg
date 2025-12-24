import fs from 'fs';
import path from 'path';

// 🤖 تشغيل البوت عند بدء الخادم
if (typeof window === 'undefined') {
  try {
    const { startBotPolling } = require('../server-bot.js');
    startBotPolling().catch(console.error);
  } catch (err) {
    console.warn('⚠️ البوت غير متفعل:', err.message);
  }
}

export default function Home() {
  const htmlPath = path.join(process.cwd(), 'public', 'index.html');
  const htmlContent = fs.readFileSync(htmlPath, 'utf-8');
  
  return (
    <>
      {/* HTML content injected */}
      <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
    </>
  );
}
