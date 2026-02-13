import { marked } from "marked";
import fs from "fs";
import path from "path";
import puppeteer from "puppeteer";
import hljs from "highlight.js";
import DOMPurify from "dompurify";
import { JSDOM } from "jsdom";

const window = new JSDOM("").window as any;
const purify = DOMPurify(window);
marked.use({
    renderer: {
      code(code, infoString) {
        const lang = infoString?.trim();
        let highlighted;
  
        if (lang && hljs.getLanguage(lang)) {
          highlighted = hljs.highlight(code, { language: lang }).value;
        } else {
          highlighted = hljs.highlightAuto(code).value;
        }
  
        return `<pre><code class="hljs language-${lang || ""}">${highlighted}</code></pre>`;
      },
    },
  });
  
  

/**
 * Generate HTML template with theme styling
 */
export async function exportToHTML(presentation: any): Promise<string> {
  const slides = presentation.content.split("---").filter((slide: string) => slide.trim());
  
  const theme = presentation.theme || {
    name: "Default",
    primaryColor: "#3b82f6",
    backgroundColor: "#ffffff",
    textColor: "#000000",
    fontFamily: "Inter, sans-serif",
  };

  const slideHTML = slides
    .map((slideContent: string, index: number) => {
        const rawHtml = marked.parse(slideContent.trim()) as string;
        const htmlContent = purify.sanitize(rawHtml);
        
      return `
        <div class="slide" data-slide="${index + 1}">
          <div class="slide-content">
            ${htmlContent}
          </div>
          <div class="slide-number">${index + 1} / ${slides.length}</div>
        </div>
      `;
    })
    .join("");

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${presentation.title}</title>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github-dark.min.css">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: ${theme.fontFamily};
      background-color: #1a1a1a;
      color: ${theme.textColor};
      overflow: hidden;
    }

    .presentation-container {
      width: 100vw;
      height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
    }

    .slide {
      display: none;
      width: 100%;
      max-width: 1200px;
      height: 100%;
      max-height: 675px; /* 16:9 aspect ratio */
      background: ${theme.backgroundColor};
      border-radius: 12px;
      padding: 4rem;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
      position: relative;
      overflow-y: auto;
    }

    .slide.active {
      display: flex;
      flex-direction: column;
      animation: slideIn 0.3s ease;
    }

    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateX(20px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }

    .slide-content {
      flex: 1;
      overflow-y: auto;
    }

    .slide-content h1 {
      font-size: 3.5rem;
      font-weight: 700;
      margin-bottom: 2rem;
      color: ${theme.primaryColor};
      line-height: 1.2;
    }

    .slide-content h2 {
      font-size: 2.5rem;
      font-weight: 600;
      margin-bottom: 1.5rem;
      color: ${theme.primaryColor};
      line-height: 1.3;
    }

    .slide-content h3 {
      font-size: 2rem;
      font-weight: 500;
      margin-bottom: 1rem;
      color: ${theme.textColor};
      opacity: 0.9;
    }

    .slide-content p {
      font-size: 1.5rem;
      line-height: 1.8;
      margin-bottom: 1.5rem;
      color: ${theme.textColor};
    }

    .slide-content ul, .slide-content ol {
      margin-left: 2rem;
      margin-bottom: 1.5rem;
    }

    .slide-content li {
      font-size: 1.5rem;
      line-height: 1.8;
      margin-bottom: 0.75rem;
      color: ${theme.textColor};
    }

    .slide-content pre {
      background: #1e293b;
      border-radius: 8px;
      padding: 1.5rem;
      margin-bottom: 1.5rem;
      overflow-x: auto;
      border-left: 4px solid ${theme.primaryColor};
    }

    .slide-content code {
      font-family: 'Fira Code', 'Courier New', monospace;
      font-size: 1.1rem;
    }

    .slide-content :not(pre) > code {
      background: rgba(0, 0, 0, 0.1);
      padding: 0.2rem 0.4rem;
      border-radius: 4px;
      font-size: 1.2rem;
      color: ${theme.primaryColor};
    }

    .slide-content blockquote {
      border-left: 4px solid ${theme.primaryColor};
      padding-left: 1.5rem;
      margin: 1.5rem 0;
      font-style: italic;
      opacity: 0.9;
    }

    .slide-content img {
      max-width: 100%;
      height: auto;
      border-radius: 8px;
      margin: 1.5rem 0;
    }

    .slide-content a {
      color: ${theme.primaryColor};
      text-decoration: none;
      border-bottom: 2px solid ${theme.primaryColor};
      transition: opacity 0.2s;
    }

    .slide-content a:hover {
      opacity: 0.7;
    }

    .slide-number {
      position: absolute;
      bottom: 2rem;
      right: 2rem;
      font-size: 1rem;
      opacity: 0.5;
      color: ${theme.textColor};
    }

    .controls {
      position: fixed;
      bottom: 2rem;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      gap: 1rem;
      z-index: 100;
    }

    .controls button {
      background: ${theme.primaryColor};
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      font-size: 1rem;
      cursor: pointer;
      transition: transform 0.2s, opacity 0.2s;
      font-family: ${theme.fontFamily};
    }

    .controls button:hover:not(:disabled) {
      transform: translateY(-2px);
      opacity: 0.9;
    }

    .controls button:disabled {
      opacity: 0.3;
      cursor: not-allowed;
    }

    @media print {
      .slide {
        page-break-after: always;
        display: flex !important;
        max-height: none;
        height: auto;
        box-shadow: none;
      }
      .controls {
        display: none;
      }
      .slide-number {
        display: none;
      }
    }
  </style>
</head>
<body>
  <div class="presentation-container">
    ${slideHTML}
  </div>

  <div class="controls">
    <button id="prevBtn">← Previous</button>
    <button id="nextBtn">Next →</button>
    <button id="fullscreenBtn">⛶ Fullscreen</button>
  </div>

  <script>
    let currentSlide = 0;
    const slides = document.querySelectorAll('.slide');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const fullscreenBtn = document.getElementById('fullscreenBtn');

    function showSlide(n) {
      slides.forEach(slide => slide.classList.remove('active'));
      currentSlide = Math.max(0, Math.min(n, slides.length - 1));
      slides[currentSlide].classList.add('active');
      
      prevBtn.disabled = currentSlide === 0;
      nextBtn.disabled = currentSlide === slides.length - 1;
    }

    prevBtn.addEventListener('click', () => showSlide(currentSlide - 1));
    nextBtn.addEventListener('click', () => showSlide(currentSlide + 1));
    
    fullscreenBtn.addEventListener('click', () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
      } else {
        document.exitFullscreen();
      }
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') showSlide(currentSlide - 1);
      if (e.key === 'ArrowRight') showSlide(currentSlide + 1);
      if (e.key === 'f') fullscreenBtn.click();
    });

    // Show first slide
    showSlide(0);
  </script>
</body>
</html>
  `;
}

/**
 * Export presentation to PDF with theme styling
 */
export async function exportToPDF(presentation: any): Promise<string> {
  const html = await exportToHTML(presentation);
  
  // Create temp directory if it doesn't exist
  const tempDir = path.join(process.cwd(), "temp");
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  const tempHtmlPath = path.join(tempDir, `${presentation._id}_temp.html`);
  const pdfPath = path.join(tempDir, `${presentation._id}.pdf`);

  // Write HTML to temp file
  fs.writeFileSync(tempHtmlPath, html);

  // Launch browser and generate PDF
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();
    await page.goto(`file://${tempHtmlPath}`, { waitUntil: "networkidle0" });

    // Generate PDF with proper slide dimensions
    await page.pdf({
        path: pdfPath,
        width: "1920px",
        height: "1080px",
        printBackground: true,
        margin: {
          top: "0",
          right: "0",
          bottom: "0",
          left: "0",
        },
      });
      

    // Clean up temp HTML
    fs.unlinkSync(tempHtmlPath);

    return pdfPath;
  } finally {
    await browser.close();
  }
}