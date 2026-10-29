import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {bundle} from '@remotion/bundler';
import {openBrowser, selectComposition, renderMedia, renderStill} from '@remotion/renderer';

const root = path.dirname(fileURLToPath(import.meta.url));
const output = path.join(root, 'out');
fs.mkdirSync(path.join(output, 'review'), {recursive: true});
const serveUrl = await bundle({entryPoint: path.join(root, 'src/index.tsx'), publicDir: path.join(root, '../revision-v6/public')});
const browserExecutable = path.join(os.homedir(), '.local/share/opencode/video-tools/remotion/node_modules/.remotion/chrome-headless-shell/win64/chrome-headless-shell-win64/chrome-headless-shell.exe');
const browser = await openBrowser('chrome', {browserExecutable, chromiumOptions: {gl: 'angle'}});
try {
  const composition = await selectComposition({serveUrl, id: 'SpanishEnding', puppeteerInstance: browser});
  const shared = {serveUrl, composition, puppeteerInstance: browser, timeoutInMilliseconds: 90000};
  if (process.argv.includes('--review')) {
    for (const frame of [60, 270, 720, 1200, 1740, 1980, 2370]) {
      await renderStill({...shared, frame, output: path.join(output, 'review', `frame-${frame}.png`), imageFormat: 'png'});
      console.log(`Reviewed ending frame ${frame}.`);
    }
  } else {
    const outputLocation = path.join(output, 'ending-picture.mp4');
    if (fs.existsSync(outputLocation)) throw new Error(`Output already exists: ${outputLocation}`);
    let previous = -1;
    await renderMedia({...shared, outputLocation, codec: 'h264', concurrency: 1, muted: true,
      crf: 18, pixelFormat: 'yuv420p', colorSpace: 'bt709', jpegQuality: 93, x264Preset: 'medium',
      onProgress: ({progress}) => {
        const percent = Math.floor(progress * 100);
        if (percent !== previous && percent % 10 === 0) {
          console.log(`Spanish ending render: ${percent}%`);
          previous = percent;
        }
      }});
    console.log(`Completed ${outputLocation}`);
  }
} finally {
  await browser.close({silent: true});
}
