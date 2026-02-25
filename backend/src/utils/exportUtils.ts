import { marked } from "marked";
import fs from "fs";
import path from "path";
import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";
import hljs from "highlight.js";
import DOMPurify from "dompurify";
import { JSDOM } from "jsdom";
import { markedHighlight } from "marked-highlight";

// DOMPurify setup
const window = new JSDOM("").window as any;
const purify = DOMPurify(window);

// Configure marked with highlight.js
marked.use(
  markedHighlight({
    langPrefix: "hljs language-",
    highlight(code: string, lang: string) {
      if (lang && hljs.getLanguage(lang)) {
        try {
          return hljs.highlight(code, { language: lang }).value;
        } catch (err) {
          console.error("Highlight error:", err);
        }
      }
      return hljs.highlightAuto(code).value;
    },
  }),
);

marked.use({ breaks: true, gfm: true });

// ─────────────────────────────────────────────
// BROWSER LAUNCHER
// Uses @sparticuz/chromium on Render (production)
// Falls back to local Chrome for development
// ─────────────────────────────────────────────
async function getBrowser() {
  const isProduction = process.env.NODE_ENV === "production";

  if (isProduction) {
    console.log("🌐 Launching Chromium (production/@sparticuz)");
    try {
      const execPath = await chromium.executablePath();
      console.log("📍 Chromium path:", execPath);
      return await puppeteer.launch({
        args: chromium.args,
        executablePath: execPath,
        headless: true,
        defaultViewport: { width: 1920, height: 1080 },
      });
    } catch (err: any) {
      console.error("❌ Failed to launch production Chromium:", err.message);
      throw new Error("PDF generation unavailable: Chromium failed to launch");
    }
  }

  // ── Local development ──
  console.log("🖥️  Launching local Chrome (development)");
  const localPaths = [
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe", // Windows
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", // macOS
    "/usr/bin/google-chrome-stable", // Linux
    "/usr/bin/google-chrome",
    "/usr/bin/chromium-browser",
    "/usr/bin/chromium",
  ];

  let executablePath = "";
  for (const p of localPaths) {
    if (fs.existsSync(p)) {
      executablePath = p;
      console.log("✅ Found local Chrome:", p);
      break;
    }
  }

  if (!executablePath) {
    throw new Error(
      "Chrome not found locally. Install Google Chrome or set PUPPETEER_EXECUTABLE_PATH env var.",
    );
  }

  return await puppeteer.launch({
    executablePath,
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
    ],
  });
}

// ─────────────────────────────────────────────
// HTML EXPORT
// ─────────────────────────────────────────────
export async function exportToHTML(presentation: any): Promise<string> {
  console.log("=== EXPORT TO HTML ===");
  console.log("Title:", presentation.title);
  console.log("Theme:", presentation.theme?.name || "Default");

  const slides = presentation.content
    .split("---")
    .map((s: string) => s.trim())
    .filter((s: string) => s.length > 0);

  console.log("Slides count:", slides.length);

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
          <div class="slide-content">${htmlContent}</div>
          <div class="slide-number">${index + 1} / ${slides.length}</div>
        </div>
      `;
    })
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${presentation.title}</title>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github-dark.min.css">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: ${theme.fontFamily || "Inter, sans-serif"}; background-color: #1a1a1a; color: ${theme.textColor || "#000000"}; overflow: hidden; }
    .presentation-container { width: 100vw; height: 100vh; display: flex; align-items: center; justify-content: center; padding: 2rem; }
    .slide { display: none; width: 100%; max-width: 1200px; height: 100%; max-height: 675px; background: ${theme.backgroundColor || "#ffffff"}; border-radius: 12px; padding: 4rem; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5); position: relative; overflow-y: auto; }
    .slide.active { display: flex; flex-direction: column; animation: slideIn 0.3s ease; }
    @keyframes slideIn { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
    .slide-content { flex: 1; overflow-y: auto; }
    .slide-content h1 { font-size: 3.5rem; font-weight: 700; margin-bottom: 2rem; color: ${theme.primaryColor || "#3b82f6"}; line-height: 1.2; }
    .slide-content h2 { font-size: 2.5rem; font-weight: 600; margin-bottom: 1.5rem; color: ${theme.primaryColor || "#3b82f6"}; line-height: 1.3; }
    .slide-content h3 { font-size: 2rem; font-weight: 500; margin-bottom: 1rem; color: ${theme.textColor || "#000000"}; opacity: 0.9; }
    .slide-content p { font-size: 1.5rem; line-height: 1.8; margin-bottom: 1.5rem; color: ${theme.textColor || "#000000"}; }
    .slide-content ul, .slide-content ol { margin-left: 2rem; margin-bottom: 1.5rem; }
    .slide-content li { font-size: 1.5rem; line-height: 1.8; margin-bottom: 0.75rem; color: ${theme.textColor || "#000000"}; }
    .slide-content pre { background: #1e293b; border-radius: 8px; padding: 1.5rem; margin-bottom: 1.5rem; overflow-x: auto; border-left: 4px solid ${theme.primaryColor || "#3b82f6"}; }
    .slide-content code { font-family: 'Fira Code', 'Courier New', monospace; font-size: 1.1rem; }
    .slide-content :not(pre) > code { background: rgba(0,0,0,0.1); padding: 0.2rem 0.4rem; border-radius: 4px; font-size: 1.2rem; color: ${theme.primaryColor || "#3b82f6"}; }
    .slide-content blockquote { border-left: 4px solid ${theme.primaryColor || "#3b82f6"}; padding-left: 1.5rem; margin: 1.5rem 0; font-style: italic; opacity: 0.9; }
    .slide-content img { max-width: 100%; height: auto; border-radius: 8px; margin: 1.5rem 0; }
    .slide-content a { color: ${theme.primaryColor || "#3b82f6"}; text-decoration: none; border-bottom: 2px solid ${theme.primaryColor || "#3b82f6"}; }
    .slide-number { position: absolute; bottom: 2rem; right: 2rem; font-size: 1rem; opacity: 0.5; color: ${theme.textColor || "#000000"}; }
    .controls { position: fixed; bottom: 2rem; left: 50%; transform: translateX(-50%); display: flex; gap: 1rem; z-index: 100; }
    .controls button { background: ${theme.primaryColor || "#3b82f6"}; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 8px; font-size: 1rem; cursor: pointer; transition: transform 0.2s, opacity 0.2s; }
    .controls button:hover:not(:disabled) { transform: translateY(-2px); opacity: 0.9; }
    .controls button:disabled { opacity: 0.3; cursor: not-allowed; }
    @media print {
      body { background: white; overflow: visible; }
      .presentation-container { padding: 0; display: block; }
      .slide { display: flex !important; page-break-after: always; page-break-inside: avoid; max-height: none; height: 100vh; border-radius: 0; box-shadow: none; max-width: none; width: 100%; }
      .slide:last-child { page-break-after: auto; }
      .controls { display: none !important; }
      .slide-number { display: none !important; }
    }
  </style>
</head>
<body>
  <div class="presentation-container">${slideHTML}</div>
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
      slides.forEach(s => s.classList.remove('active'));
      currentSlide = Math.max(0, Math.min(n, slides.length - 1));
      slides[currentSlide].classList.add('active');
      prevBtn.disabled = currentSlide === 0;
      nextBtn.disabled = currentSlide === slides.length - 1;
    }
    prevBtn.addEventListener('click', () => showSlide(currentSlide - 1));
    nextBtn.addEventListener('click', () => showSlide(currentSlide + 1));
    fullscreenBtn.addEventListener('click', () => {
      if (!document.fullscreenElement) document.documentElement.requestFullscreen();
      else document.exitFullscreen();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') showSlide(currentSlide - 1);
      if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); showSlide(currentSlide + 1); }
      if (e.key === 'f') fullscreenBtn.click();
      if (e.key === 'Escape' && document.fullscreenElement) document.exitFullscreen();
    });
    showSlide(0);
  </script>
</body>
</html>`;
}

// ─────────────────────────────────────────────
// PDF EXPORT
// ─────────────────────────────────────────────
export async function exportToPDF(presentation: any): Promise<string> {
  console.log("=== EXPORT TO PDF START ===");
  console.log("Presentation ID:", presentation._id);
  console.log("Title:", presentation.title);

  const html = await exportToHTML(presentation);

  const tempDir = path.join(process.cwd(), "temp");
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
    console.log("Created temp directory:", tempDir);
  }

  const timestamp = Date.now();
  const tempHtmlPath = path.join(
    tempDir,
    `${presentation._id}_${timestamp}.html`,
  );
  const pdfPath = path.join(tempDir, `${presentation._id}_${timestamp}.pdf`);

  fs.writeFileSync(tempHtmlPath, html, "utf8");
  console.log("HTML written, size:", fs.statSync(tempHtmlPath).size, "bytes");

  let browser: any = null;

  try {
    browser = await getBrowser();
    console.log("✅ Browser launched");

    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });

    await page.goto(`file://${tempHtmlPath}`, {
      waitUntil: "networkidle0",
      timeout: 30000,
    });

    console.log("✅ Page loaded");
    await page.waitForSelector(".slide", { timeout: 5000 });
    await new Promise((resolve) => setTimeout(resolve, 1500));

    await page.pdf({
      path: pdfPath,
      width: "1920px",
      height: "1080px",
      printBackground: true,
      margin: { top: "0", right: "0", bottom: "0", left: "0" },
    });

    console.log("✅ PDF generated");

    if (!fs.existsSync(pdfPath)) throw new Error("PDF file was not created");

    const pdfSize = fs.statSync(pdfPath).size;
    console.log("PDF size:", pdfSize, "bytes");

    if (pdfSize < 1000) throw new Error("PDF file is too small, likely empty");

    try {
      fs.unlinkSync(tempHtmlPath);
    } catch (e) {
      console.warn("Could not delete temp HTML:", e);
    }

    console.log("=== EXPORT TO PDF SUCCESS ===");
    return pdfPath;
  } catch (error: any) {
    console.error("=== EXPORT TO PDF ERROR ===");
    console.error("Error:", error.message);
    try {
      if (fs.existsSync(tempHtmlPath)) fs.unlinkSync(tempHtmlPath);
    } catch {}
    throw new Error(`PDF generation failed: ${error.message}`);
  } finally {
    if (browser) {
      await browser.close();
      console.log("Browser closed");
    }
  }
}
