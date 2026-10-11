import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const webDir = path.resolve('dist/client');
await readFile(path.join(webDir, 'index.html')); // Fail rather than package an empty app.
const replacements = [];
await mkdir(path.join(webDir, 'audio'), { recursive: true });
for (const name of ['quiet-hours', 'weightless', 'afterglow']) {
  const asset = JSON.parse(await readFile(`src/assets/${name}.mp3.asset.json`, 'utf8'));
  const source = new URL(asset.url, 'https://float-sound-player.lovable.app');
  const response = await fetch(source);
  if (!response.ok) throw new Error(`Unable to bundle ${name}: ${response.status}`);
  const bytes = new Uint8Array(await response.arrayBuffer());
  if (!response.headers.get('content-type')?.startsWith('audio/') || bytes.length < 1000) throw new Error(`Invalid audio for ${name}`);
  await writeFile(path.join(webDir, 'audio', `${name}.mp3`), bytes);
  replacements.push([asset.url, `/audio/${name}.mp3`]);
}
async function rewrite(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) await rewrite(file);
    else if (/\.(js|html|json)$/.test(entry.name)) {
      let text = await readFile(file, 'utf8');
      for (const [before, after] of replacements) text = text.split(before).join(after);
      await writeFile(file, text);
    }
  }
}
await rewrite(webDir);
console.log('NocTune Android assets ready, including all three offline audio samples.');