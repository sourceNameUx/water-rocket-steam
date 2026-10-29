import assert from "node:assert/strict";
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "../.site-tools/node_modules/playwright/index.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const review = path.join(
  root,
  ".impeccable/review",
  process.env.SITE_URL ? "published" : "",
);
fs.mkdirSync(review, { recursive: true });
const mime = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "text/javascript",
  ".webp": "image/webp",
  ".mp4": "video/mp4",
  ".vtt": "text/vtt",
  ".ttf": "font/ttf",
  ".svg": "image/svg+xml",
  ".pdf": "application/pdf",
  ".docx":
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
};
const noMedia = process.argv.includes("--layout-only");
const mediaOnly = process.argv.includes("--media-only");
const server = http.createServer((request, response) => {
  const pathname = decodeURIComponent(
    new URL(request.url, "http://localhost").pathname,
  );
  const file = path.resolve(
    root,
    "docs",
    "." + (pathname === "/" ? "/index.html" : pathname),
  );
  if (
    !file.startsWith(path.join(root, "docs") + path.sep) ||
    !fs.existsSync(file)
  ) {
    response.writeHead(404);
    response.end();
    return;
  }
  const size = fs.statSync(file).size;
  const range = request.headers.range?.match(/^bytes=(\d+)-(\d*)$/);
  const start = range ? Number(range[1]) : 0;
  const end =
    range && range[2] ? Math.min(Number(range[2]), size - 1) : size - 1;
  const headers = {
    "Content-Type": mime[path.extname(file)] || "application/octet-stream",
    "Accept-Ranges": "bytes",
    "Content-Length": end - start + 1,
  };
  if (range) headers["Content-Range"] = `bytes ${start}-${end}/${size}`;
  response.writeHead(range ? 206 : 200, headers);
  if (request.method === "HEAD") response.end();
  else fs.createReadStream(file, { start, end }).pipe(response);
});
await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const base =
  process.env.SITE_URL || `http://127.0.0.1:${server.address().port}/`;
const browser = await chromium.launch({
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  headless: true,
});
const report = {
  base,
  layoutOnly: noMedia,
  mediaOnly,
  viewports: [],
  checks: [],
};
try {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
    reducedMotion: "reduce",
    acceptDownloads: true,
  });
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  if (noMedia)
    await page.route("**/rocket-documentary.mp4*", (route) => route.abort());
  await page.goto(base, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  assert.equal(await page.locator("html").getAttribute("lang"), "es");
  assert.equal(await page.locator("#process .process-steps li").count(), 3);
  assert.ok(await page.locator("#science .reaction").isVisible());
  assert.equal(await page.locator('a[href*="rocket-report"]').count(), 0);
  assert.ok(await page.locator("#conclusion").isVisible());
  assert.equal(await page.locator(".rubric").count(), 0);
  assert.equal(
    await page.locator('track[kind="captions"]').getAttribute("srclang"),
    "es",
  );
  report.checks.push(
    "Spanish construction history, scientific explanation and on-page conclusion",
    "No report download links in the website",
    "Teacher grading block removed and captions labeled Spanish",
  );
  if (!mediaOnly) {
    for (const [name, width, height] of [
      ["desktop", 1440, 1000],
      ["mobile", 390, 844],
      ["narrow", 320, 740],
      ["tablet", 768, 1024],
    ]) {
      await page.setViewportSize({ width, height });
      await page.evaluate(() => {
        document
          .querySelectorAll("img")
          .forEach((img) => (img.loading = "eager"));
        window.scrollTo(0, 0);
      });
      await page.waitForFunction(() =>
        [...document.images].every(
          (image) => image.complete && image.naturalWidth > 0,
        ),
      );
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      );
      assert.equal(overflow, false, `${name} horizontal overflow`);
      if (["desktop", "mobile"].includes(name)) {
        await page.screenshot({
          path: path.join(review, `${name}.png`),
          fullPage: true,
          animations: "disabled",
        });
        for (const section of ["process", "science", "conclusion"]) {
          await page
            .locator(`#${section}`)
            .evaluate((element) =>
              element.scrollIntoView({ block: "start", behavior: "instant" }),
            );
          await page.screenshot({
            path: path.join(review, `${name}-${section}.png`),
            animations: "disabled",
          });
        }
        if (name === "mobile") {
          await page
            .locator("#science .story-copy")
            .evaluate((element) =>
              element.scrollIntoView({ block: "start", behavior: "instant" }),
            );
          await page.screenshot({
            path: path.join(review, "mobile-science-copy.png"),
            animations: "disabled",
          });
        }
        await page.evaluate(() => window.scrollTo(0, 0));
      }
      if (name === "desktop")
        await page.screenshot({
          path: path.join(review, "desktop-first-viewport.png"),
          animations: "disabled",
        });
      report.viewports.push({ name, width, height, overflow });
    }
    for (const part of ["nose", "joints", "support", "fins"]) {
      await page.locator(`[data-part="${part}"]`).click();
      assert.equal(
        await page
          .locator(`[data-part="${part}"]`)
          .getAttribute("aria-pressed"),
        "true",
      );
      assert.equal(
        await page.locator('[data-part][aria-pressed="true"]').count(),
        1,
      );
    }
    await page.locator('[data-part="nose"]').focus();
    await page.keyboard.press("Enter");
    assert.match(
      await page.locator("#part-description").innerText(),
      /Facilitar el paso del aire/,
    );
    await page.locator("summary").click();
    assert.equal(await page.locator("details").getAttribute("open"), "");
    await page.goto(base);
    await page.keyboard.press("Tab");
    assert.equal(await page.locator(":focus").textContent(), "Ir al contenido");
    const anchors = await page
      .locator('a[href^="#"]')
      .evaluateAll((links) =>
        links.every((link) =>
          document.querySelector(link.getAttribute("href")),
        ),
      );
    assert.equal(anchors, true);
    report.checks.push(
      "Four responsive widths without horizontal overflow",
      "All images loaded",
      "Rocket part selection and keyboard activation",
      "Scientific explanation disclosure",
      "Skip link and section destinations",
    );
  }
  if (!noMedia) {
    await page.waitForFunction(
      () => document.querySelector("video").readyState >= 1,
      null,
      { timeout: 60000 },
    );
    const metadata = await page.locator("video").evaluate((video) => ({
      duration: video.duration,
      width: video.videoWidth,
      height: video.videoHeight,
    }));
    assert.ok(Math.abs(metadata.duration - 323.2) < 0.1);
    assert.equal(metadata.width, 1280);
    assert.equal(metadata.height, 720);
    await page.locator('[data-time="237.2"]').click();
    await page.waitForFunction(() => {
      const video = document.querySelector("video");
      return (
        !video.paused && video.currentTime >= 237.2 && video.currentTime < 243
      );
    });
    await page.locator('[data-time="237.2"][aria-current="true"]').waitFor();
    await page.locator("video").evaluate((video) => video.pause());
    await page.locator("video").evaluate((video) => {
      video.textTracks[0].mode = "showing";
    });
    await page.waitForFunction(
      () => document.querySelector("video").textTracks[0].cues?.length > 0,
    );
    const cues = await page.locator("video").evaluate((video) =>
      [...video.textTracks[0].cues].map((cue) => ({
        start: cue.startTime,
        end: cue.endTime,
        text: cue.text,
      })),
    );
    assert.ok(
      cues.every(
        (cue, index) =>
          cue.end > cue.start && (!index || cues[index - 1].end <= cue.start),
      ),
    );
    const expectedCaptionText = fs
      .readFileSync(path.join(root, "docs/assets/documentary.vtt"), "utf8")
      .trim()
      .split(/\r?\n\r?\n/)
      .slice(1)
      .map((block) => block.split(/\r?\n/).slice(2).join("\n"));
    assert.deepEqual(
      cues.map((cue) => cue.text),
      expectedCaptionText,
    );
    assert.equal(
      new URL(
        await page.locator("video").evaluate((video) => video.currentSrc),
      ).searchParams.get("v"),
      "8-es",
    );
    await page.locator("video").evaluate((video) => {
      video.currentTime = 316;
    });
    await page.waitForFunction(() => {
      const video = document.querySelector("video");
      return (
        !video.seeking &&
        video.readyState >= 2 &&
        video.currentTime === 316 &&
        video.textTracks[0].activeCues?.length > 0
      );
    });
    await page
      .locator("video")
      .screenshot({ path: path.join(review, "spanish-video-ending.png") });
    report.media = { ...metadata, captionCues: cues.length };
    report.checks.push(
      "Actual video metadata",
      "Final-launch chapter seeks and plays",
      "Timed WebVTT captions load without overlap",
      "Spanish caption text matches the release and the corrected ending is seekable",
    );
  }
  assert.deepEqual(errors, []);
  report.checks.push("No JavaScript runtime errors");
  fs.writeFileSync(
    path.join(
      review,
      mediaOnly ? "media-verification.json" : "browser-verification.json",
    ),
    JSON.stringify(report, null, 2),
  );
  console.log(JSON.stringify(report, null, 2));
} finally {
  await browser.close();
  await new Promise((resolve) => server.close(resolve));
}
