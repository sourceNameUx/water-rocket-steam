import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {bundle} from '@remotion/bundler';
import {openBrowser, selectComposition, renderMedia, renderStill} from '@remotion/renderer';

const root = path.dirname(fileURLToPath(import.meta.url));
const browserExecutable = path.join(os.homedir(), '.local/share/opencode/video-tools/remotion/node_modules/.remotion/chrome-headless-shell/win64/chrome-headless-shell-win64/chrome-headless-shell.exe');
const review = process.argv.includes('--review');
const sample = process.argv.includes('--sample');
const preview = process.argv.includes('--preview');
const design = process.argv.includes('--design');
const tail = process.argv.includes('--tail');
const output = path.join(root, 'out');
fs.mkdirSync(path.join(output, 'review'), {recursive: true});
console.log('Bundling the editable documentary project.');
const serveUrl = await bundle({entryPoint: path.join(root, 'src/index.tsx'), publicDir: path.join(root, 'public')});
const browser = await openBrowser('chrome', {browserExecutable, chromiumOptions: {gl: 'angle'}});
try {
  const composition = await selectComposition({serveUrl, id: design ? 'NewDesign' : 'RocketBody', puppeteerInstance: browser});
  const shared = {serveUrl, composition, puppeteerInstance: browser, timeoutInMilliseconds: 90000};
  if (review) {
    const selectedFrames = process.argv.find(argument => argument.startsWith('--frames='));
    const frames = selectedFrames ? selectedFrames.slice(9).split(',').map(Number) : design ? [75, 270, 400, 570, 680, 820, 1050, 1360, 1560, 1800, 1980] : [5020, 5151, 5346, 5646, 5896, 6126, 6436, 6876, 7056];
    for (const frame of frames) {
      const outputLocation = path.join(output, 'review', `${design ? 'design' : 'frame'}-${String(frame).padStart(5, '0')}.png`);
      await renderStill({...shared, frame, output: outputLocation, imageFormat: 'png', overwrite: true});
      console.log(`Reviewed frame ${frame} (${(frame / 30).toFixed(2)}s).`);
    }
    console.log('Review stills ready.');
  }
  if (!review || preview) {
    const outputLocation = path.join(output, tail ? 'results-picture.mp4' : design ? 'design-picture.mp4' : preview ? 'style-preview-raw.mp4' : sample ? 'animation-sample.mp4' : 'picture.mp4');
    if (fs.existsSync(outputLocation)) throw new Error(`Output already exists: ${outputLocation}`);
    let previous = -1;
    await renderMedia({...shared, codec: 'h264', outputLocation, concurrency: 1, muted: !preview,
      crf: 18, pixelFormat: 'yuv420p', colorSpace: 'bt709', jpegQuality: 93, x264Preset: 'medium',
      ...(sample ? {frameRange: [750, 929]} : {}),
      ...(tail ? {frameRange: [7116, 9695]} : {}),
      ...(preview ? {frameRange: [[0, 209], [390, 569], [2130, 2339], [4806, 5075]]} : {}),
      onProgress: ({progress}) => {
        const percent = Math.floor(progress * 100);
        if (percent !== previous && percent % 5 === 0) {
          console.log(`Picture render: ${percent}%`);
          previous = percent;
        }
      }});
    fs.writeFileSync(path.join(output, design ? 'design-render.json' : preview ? 'preview-render.json' : sample ? 'sample-render.json' : 'picture-render.json'), JSON.stringify({output: outputLocation,
      duration: tail ? 86 : preview ? 29 : sample ? 6 : composition.durationInFrames / composition.fps, width: composition.width, height: composition.height,
      fps: composition.fps, concurrency: 1, endingPending: false}, null, 2));
    console.log(`Picture ready: ${outputLocation}`);
  }
} finally {
  await browser.close({silent: true});
}
