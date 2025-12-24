import fs from 'fs';
import path from 'path';

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
