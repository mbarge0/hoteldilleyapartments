#!/usr/bin/env node
/**
 * Regenerate buyer-package PDFs from HTML sources (Playwright print).
 * Run from repo root: node netlify/functions/dilley-package/build-pdfs.mjs
 */
import { chromium } from "playwright";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const sources = [
  { html: "pnl-summary.html", pdf: "pnl-summary.pdf" },
  { html: "financing-one-pager.html", pdf: "financing-one-pager.pdf" },
];

const browser = await chromium.launch();
const page = await browser.newPage();
for (const { html, pdf } of sources) {
  const fileUrl = "file://" + path.join(__dirname, html);
  await page.goto(fileUrl, { waitUntil: "networkidle" });
  await page.pdf({
    path: path.join(__dirname, pdf),
    format: "Letter",
    printBackground: true,
    margin: { top: "0.45in", bottom: "0.45in", left: "0.5in", right: "0.5in" },
  });
  console.log("Wrote", pdf);
}
await browser.close();
