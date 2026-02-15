import { marked } from "marked";
import fs from "fs";
import path from "path";
import puppeteer from "puppeteer";
import hljs from "highlight.js";
import { markedHighlight } from 'marked-highlight';
// Configure marked with highlight.js using the new API
marked.use(markedHighlight({
    langPrefix: 'hljs language-',
    highlight(code, lang) {
        if (lang && hljs.getLanguage(lang)) {
            try {
                return hljs.highlight(code, { language: lang }).value;
            }
            catch (err) {
                console.error("Highlight error:", err);
            }
        }
        return hljs.highlightAuto(code).value;
    }
}));
// Set other marked options
marked.use({
    breaks: true,
    gfm: true,
});
/**
 * Generate HTML with proper theme support
 */
export async function exportToHTML(presentation) {
    console.log("=== EXPORT TO HTML ===");
    console.log("Presentation:", presentation.title);
    console.log("Theme:", presentation.theme);
    const slides = presentation.content
        .split("---")
        .map((s) => s.trim())
        .filter((s) => s.length > 0);
    console.log("Slides count:", slides.length);
    // Get theme with proper defaults
    const theme = presentation.theme || {
        name: "Default",
        primaryColor: "#3b82f6",
        backgroundColor: "#ffffff",
        textColor: "#1e293b",
        fontFamily: "system-ui, -apple-system, sans-serif",
    };
    console.log("Using theme:", theme.name || "Default");
    // Generate slide HTML
    const slideHTML = slides
        .map((slideContent, index) => {
        const html = marked.parse(slideContent);
        return `
        <div class="slide" data-slide="${index + 1}">
          <div class="slide-content">
            ${html}
          </div>
          <div class="slide-number">${index + 1} / ${slides.length}</div>
        </div>
      `;
    })
        .join("\n");
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
      font-family: ${theme.fontFamily || 'system-ui, sans-serif'};
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      overflow: hidden;
    }

    .presentation-container {
      width: 100vw;
      height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 40px;
    }

    .slide {
      display: none;
      width: 1600px;
      height: 900px;
      background: ${theme.backgroundColor || '#ffffff'};
      border-radius: 20px;
      padding: 80px 100px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
      position: relative;
      overflow: auto;
    }

    .slide.active {
      display: block;
    }

    .slide-content {
      width: 100%;
      height: 100%;
      overflow-y: auto;
    }

    .slide-content h1 {
      font-size: 4rem;
      font-weight: 700;
      margin-bottom: 2rem;
      color: ${theme.primaryColor || '#3b82f6'};
      line-height: 1.2;
    }

    .slide-content h2 {
      font-size: 3rem;
      font-weight: 600;
      margin-bottom: 1.5rem;
      color: ${theme.primaryColor || '#3b82f6'};
      line-height: 1.3;
    }

    .slide-content h3 {
      font-size: 2.5rem;
      font-weight: 500;
      margin-bottom: 1rem;
      color: ${theme.textColor || '#1e293b'};
    }

    .slide-content p {
      font-size: 1.8rem;
      line-height: 1.8;
      margin-bottom: 1.5rem;
      color: ${theme.textColor || '#1e293b'};
    }

    .slide-content ul, .slide-content ol {
      margin-left: 3rem;
      margin-bottom: 2rem;
    }

    .slide-content li {
      font-size: 1.8rem;
      line-height: 1.8;
      margin-bottom: 1rem;
      color: ${theme.textColor || '#1e293b'};
    }

    .slide-content pre {
      background: #1e293b;
      border-radius: 8px;
      padding: 2rem;
      margin-bottom: 2rem;
      overflow-x: auto;
    }

    .slide-content code {
      font-family: 'Courier New', monospace;
      font-size: 1.4rem;
    }

    .slide-number {
      position: absolute;
      bottom: 40px;
      right: 60px;
      font-size: 1.2rem;
      opacity: 0.5;
      color: ${theme.textColor || '#1e293b'};
    }

    .controls {
      position: fixed;
      bottom: 40px;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      gap: 1rem;
      z-index: 100;
      background: rgba(0, 0, 0, 0.7);
      padding: 1rem;
      border-radius: 12px;
    }

    .controls button {
      background: ${theme.primaryColor || '#3b82f6'};
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 8px;
      font-size: 1rem;
      cursor: pointer;
      font-weight: 600;
    }

    .controls button:disabled {
      opacity: 0.3;
    }

    @media print {
      @page {
        size: 1920px 1080px;
        margin: 0;
      }

      body {
        background: white;
      }

      .presentation-container {
        padding: 0;
      }

      .slide {
        display: block !important;
        page-break-after: always;
        page-break-inside: avoid;
        width: 1920px;
        height: 1080px;
        border-radius: 0;
        margin: 0;
        box-shadow: none;
      }

      .slide:last-child {
        page-break-after: auto;
      }

      .controls, .slide-number {
        display: none !important;
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
    <button id="fullscreenBtn">Fullscreen</button>
  </div>

  <script>
    let currentSlide = 0;
    const slides = document.querySelectorAll('.slide');

    function showSlide(n) {
      slides.forEach(s => s.classList.remove('active'));
      currentSlide = Math.max(0, Math.min(n, slides.length - 1));
      slides[currentSlide].classList.add('active');
      
      document.getElementById('prevBtn').disabled = currentSlide === 0;
      document.getElementById('nextBtn').disabled = currentSlide === slides.length - 1;
    }

    document.getElementById('prevBtn').addEventListener('click', () => showSlide(currentSlide - 1));
    document.getElementById('nextBtn').addEventListener('click', () => showSlide(currentSlide + 1));
    document.getElementById('fullscreenBtn').addEventListener('click', () => {
      document.documentElement.requestFullscreen();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') showSlide(currentSlide - 1);
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        showSlide(currentSlide + 1);
      }
    });

    showSlide(0);
  </script>
</body>
</html>
  `;
}
/**
 * Export to PDF with proper theme support - COMPLETELY REWRITTEN
 */
export async function exportToPDF(presentation) {
    console.log("=== EXPORT TO PDF START ===");
    console.log("Presentation ID:", presentation._id);
    console.log("Title:", presentation.title);
    console.log("Theme:", presentation.theme);
    // Generate HTML first
    const html = await exportToHTML(presentation);
    // Create temp directory
    const tempDir = path.join(process.cwd(), "temp");
    if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
        console.log("Created temp directory:", tempDir);
    }
    const timestamp = Date.now();
    const tempHtmlPath = path.join(tempDir, `${presentation._id}_${timestamp}.html`);
    const pdfPath = path.join(tempDir, `${presentation._id}_${timestamp}.pdf`);
    // Write HTML to temp file
    fs.writeFileSync(tempHtmlPath, html, 'utf8');
    console.log("HTML written to:", tempHtmlPath);
    console.log("HTML size:", fs.statSync(tempHtmlPath).size, "bytes");
    let browser;
    try {
        console.log("Launching Puppeteer...");
        browser = await puppeteer.launch({
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-web-security',
            ],
        });
        console.log("Browser launched");
        const page = await browser.newPage();
        console.log("New page created");
        await page.setViewport({
            width: 1920,
            height: 1080,
        });
        const fileUrl = `file://${tempHtmlPath}`;
        console.log("Loading URL:", fileUrl);
        await page.goto(fileUrl, {
            waitUntil: "networkidle0",
            timeout: 30000,
        });
        console.log("Page loaded successfully");
        // Wait for content to render
        await page.waitForSelector('.slide', { timeout: 5000 });
        console.log("Slides found on page");
        // Small delay for fonts
        await new Promise(resolve => setTimeout(resolve, 2000));
        console.log("Generating PDF...");
        await page.pdf({
            path: pdfPath,
            width: '1920px',
            height: '1080px',
            printBackground: true,
            preferCSSPageSize: true,
            margin: {
                top: '0',
                right: '0',
                bottom: '0',
                left: '0',
            },
        });
        console.log("PDF generated at:", pdfPath);
        // Verify PDF exists and has content
        if (!fs.existsSync(pdfPath)) {
            throw new Error("PDF file was not created");
        }
        const pdfSize = fs.statSync(pdfPath).size;
        console.log("PDF size:", pdfSize, "bytes");
        if (pdfSize < 1000) {
            throw new Error("PDF file is too small, probably empty");
        }
        // Clean up temp HTML
        try {
            fs.unlinkSync(tempHtmlPath);
            console.log("Temp HTML cleaned up");
        }
        catch (err) {
            console.error("Failed to clean HTML:", err);
        }
        console.log("=== EXPORT TO PDF SUCCESS ===");
        return pdfPath;
    }
    catch (error) {
        console.error("=== EXPORT TO PDF ERROR ===");
        console.error("Error:", error);
        console.error("Stack:", error.stack);
        // Clean up on error
        if (fs.existsSync(tempHtmlPath)) {
            fs.unlinkSync(tempHtmlPath);
        }
        throw new Error(`PDF generation failed: ${error.message}`);
    }
    finally {
        if (browser) {
            await browser.close();
            console.log("Browser closed");
        }
    }
}
