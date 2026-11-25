// Link-preview image (Open Graph), 1200×630, for WhatsApp / LinkedIn / etc.
//
//   npm run og
//
// Renders the card below in the Edge already installed on Windows (Playwright channel
// "msedge") and writes public/og.png. Re-run it if the name or role changes.
import { chromium } from '@playwright/test';
import { fileURLToPath } from 'node:url';

const OUT = fileURLToPath(new URL('../public/og.png', import.meta.url));

const html = `<!doctype html>
<html><head>
<link href="https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@600;700&family=Inter:wght@400;600&display=block" rel="stylesheet">
<style>
  * { box-sizing: border-box; margin: 0; }
  body {
    width: 1200px; height: 630px; overflow: hidden; position: relative;
    font-family: Inter, sans-serif; color: #ede6df;
    background:
      radial-gradient(700px 420px at 85% 15%, rgb(209 59 47 / 0.35), transparent 65%),
      radial-gradient(520px 320px at 5% 100%, rgb(230 180 76 / 0.16), transparent 70%),
      #0c0a0b;
    padding: 84px 96px;
  }
  body::after {
    content: ''; position: absolute; inset: 0;
    background: repeating-linear-gradient(to bottom, rgb(255 255 255 / 0.025) 0 1px, transparent 1px 3px);
  }
  .frame {
    position: absolute; inset: 28px; border: 2px solid #4a3a3c;
    clip-path: polygon(0 0, calc(100% - 48px) 0, 100% 48px, 100% 100%, 48px 100%, 0 calc(100% - 48px));
  }
  .eyebrow { font: 600 26px 'Chakra Petch'; letter-spacing: .3em; color: #d13b2f; text-transform: uppercase; }
  .nick { margin-top: 28px; font: 700 34px 'Chakra Petch'; letter-spacing: .4em; color: #e6b44c; }
  h1 { margin-top: 6px; font: 700 124px/1 'Chakra Petch'; text-transform: uppercase; letter-spacing: .01em; }
  .role { display: inline-block; margin-top: 30px; padding: 6px 20px; background: #d13b2f; color: #fff;
          font: 700 34px 'Chakra Petch'; letter-spacing: .08em; text-transform: uppercase; }
  .loc { display: inline-block; margin-left: 22px; font: 600 30px 'Chakra Petch'; letter-spacing: .08em; color: #a99f97; text-transform: uppercase; }
  .stat { position: absolute; right: 96px; top: 150px; text-align: right; }
  .stat b { display: block; font: 700 64px 'Chakra Petch'; color: #e6b44c; }
  .stat span { font: 600 22px 'Chakra Petch'; letter-spacing: .14em; color: #a99f97; text-transform: uppercase; }
</style></head>
<body>
  <div class="frame"></div>
  <p class="eyebrow">Player Profile · Portfolio</p>
  <p class="nick">STINGTAW</p>
  <h1>Kanta<br>Khanigara</h1>
  <p><span class="role">Infra + Web Developer</span><span class="loc">Bandung, Indonesia</span></p>
  <div class="stat"><b>99.95%</b><span>High availability · 3 nodes</span></div>
</body></html>`;

const browser = await chromium.launch({ channel: 'msedge' });
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
await page.setContent(html, { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);
await page.screenshot({ path: OUT, type: 'png' });
await browser.close();
console.log('saved', OUT);
