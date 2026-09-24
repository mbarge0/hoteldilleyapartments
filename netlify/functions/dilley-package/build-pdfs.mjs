#!/usr/bin/env node
/**
 * Regenerate buyer-package PDFs from HTML sources (Playwright print).
 * Run from repo root: node netlify/functions/dilley-package/build-pdfs.mjs
 */
import { chromium } from "playwright";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "../../..");
const artifactsDir = path.join(repoRoot, "artifacts");

const sources = [
  { html: "pnl-summary.html", pdf: "pnl-summary.pdf" },
  { html: "financing-one-pager.html", pdf: "financing-one-pager.pdf" },
];

const browser = await chromium.launch();
const page = await browser.newPage();
for (const { html, pdf } of sources) {
  const fileUrl = "file://" + path.join(__dirname, html);
  await page.goto(fileUrl, { waitUntil: "networkidle" });
  const outPath = path.join(__dirname, pdf);
  await page.pdf({
    path: outPath,
    format: "Letter",
    printBackground: true,
    margin: { top: "0.45in", bottom: "0.45in", left: "0.5in", right: "0.5in" },
  });
  console.log("Wrote", pdf);

  fs.mkdirSync(artifactsDir, { recursive: true });
  const artifactName =
    pdf === "pnl-summary.pdf"
      ? "Hotel-Dilley-Grand-T12-PnL-summary.pdf"
      : "Hotel-Dilley-Grand-financing-one-pager.pdf";
  fs.copyFileSync(outPath, path.join(artifactsDir, artifactName));
  console.log("Copied to artifacts/", artifactName);
}
await browser.close();
