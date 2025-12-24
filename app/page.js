export default function Home() {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>📸 معرض الشعبيات - PUBG Gallery</title>
        <style>
          {`
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              background: linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 100%);
              color: #fff;
              text-align: center;
              min-height: 100vh;
              padding: 20px;
            }
            h1 {
              margin: 30px 0 15px;
              font-size: 2.5rem;
              color: #ffd700;
              text-shadow: 0 0 20px rgba(255, 215, 0, 0.5);
            }
            .hint {
              opacity: 0.75;
              font-size: 1rem;
              margin: 15px 0 30px;
              color: #ccc;
            }
            #openGallery {
              background: linear-gradient(135deg, #ffd700, #ffed4e);
              color: #000;
              border: none;
              border-radius: 12px;
              padding: 16px 32px;
              font-size: 1.1rem;
              font-weight: bold;
              cursor: pointer;
              box-shadow: 0 4px 15px rgba(255, 215, 0, 0.4);
              transition: all 0.3s;
            }
            #openGallery:hover {
              transform: scale(1.08);
              box-shadow: 0 6px 25px rgba(255, 215, 0, 0.6);
            }
            #galleryModal {
              display: none;
              position: fixed;
              inset: 0;
              background: rgba(0, 0, 0, 0.95);
              backdrop-filter: blur(8px);
              justify-content: center;
              align-items: center;
              z-index: 1000;
            }
            .gallery-content {
              background: linear-gradient(135deg, #1a1a1a, #2a2a2a);
              padding: 20px;
              border-radius: 16px;
              width: 95%;
              max-width: 600px;
              max-height: 80vh;
              overflow-y: auto;
              border: 2px solid #ffd700;
              box-shadow: 0 0 40px rgba(255, 215, 0, 0.3);
            }
            .gallery-content img {
              width: 100%;
              border-radius: 12px;
              margin-bottom: 12px;
              transition: transform 0.3s, box-shadow 0.3s;
              cursor: pointer;
              border: 1px solid #333;
            }
            .gallery-content img:hover {
              transform: scale(1.05);
              box-shadow: 0 0 20px rgba(255, 215, 0, 0.3);
            }
            #closeGallery {
              background: linear-gradient(135deg, #0d6efd, #0099ff);
              border: none;
              color: #fff;
              border-radius: 8px;
              padding: 10px 20px;
              margin-bottom: 15px;
              cursor: pointer;
              font-weight: bold;
              font-size: 1rem;
              box-shadow: 0 4px 15px rgba(13, 110, 253, 0.4);
              transition: all 0.3s;
              width: 100%;
            }
            #closeGallery:hover {
              transform: scale(1.02);
              box-shadow: 0 6px 20px rgba(13, 110, 253, 0.6);
            }
            .gallery-content::-webkit-scrollbar {
              width: 8px;
            }
            .gallery-content::-webkit-scrollbar-track {
              background: #1a1a1a;
            }
            .gallery-content::-webkit-scrollbar-thumb {
              background: #ffd700;
              border-radius: 4px;
            }
            .gallery-content::-webkit-scrollbar-thumb:hover {
              background: #ffed4e;
            }
          `}
        </style>
      </head>
      <body>
        <h1>🎨 معرض الشعبيات PUBG</h1>
        <p className="hint">اضغط لفتح معرض الصور الحصري</p>
        <button id="openGallery">فتح المعرض 👉</button>

        <div id="galleryModal">
          <div className="gallery-content">
            <button id="closeGallery">✕ إغلاق</button>
            <div id="galleryImages"></div>
          </div>
        </div>

        <script dangerouslySetInnerHTML={{__html: `
          const topImages = [
            "https://i.ibb.co/9mXDcKrD/photo-5877268892239989707-x.jpg",
            "https://i.ibb.co/kV3VP0Jx/photo-5877268892239989702-x.jpg",
            "https://i.ibb.co/cS1wzpXz/photo-5877268892239989701-x.jpg",
            "https://i.ibb.co/P3GhdTz/photo-5877268892239989700-x.jpg",
            "https://i.ibb.co/k69cC84P/photo-5877268892239989699-x.jpg",
            "https://i.ibb.co/PG0WQ0FH/photo-5877268892239989698-x.jpg",
            "https://i.ibb.co/Z6R1YQhH/photo-5877268892239989697-x.jpg",
            "https://i.ibb.co/HTJkJ2qN/2025-11-17-020156.jpg",
            "https://i.ibb.co/KjYYkYPf/20251117014834.jpg",
            "https://i.ibb.co/bRLJ3z4G/20251116222702.jpg",
            "https://i.ibb.co/3mJZY47h/20251116212943.jpg",
            "https://i.ibb.co/jYpxHH4/6005647766816149053.jpg",
            "https://i.ibb.co/1tqYtHsy/6005647766816148934.jpg",
            "https://i.ibb.co/LDFHVZMm/6005647766816148927.jpg"
          ];

          const openBtn = document.getElementById('openGallery');
          const closeBtn = document.getElementById('closeGallery');
          const modal = document.getElementById('galleryModal');
          const box = document.getElementById('galleryImages');

          function fillGallery() {
            box.innerHTML = '';
            topImages.forEach(url => {
              const img = document.createElement('img');
              img.loading = 'lazy';
              img.referrerPolicy = 'no-referrer';
              img.src = url;
              box.appendChild(img);
            });
          }

          openBtn.addEventListener('click', () => {
            modal.style.display = 'flex';
            fillGallery();
          });

          closeBtn.addEventListener('click', () => modal.style.display = 'none');

          window.addEventListener('click', (e) => {
            if (e.target === modal) modal.style.display = 'none';
          });
        `}} />
      </body>
    </html>
  );
}
