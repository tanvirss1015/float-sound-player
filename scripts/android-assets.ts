import { mkdir, copyFile, writeFile } from 'node:fs/promises';
import quiet from '../src/assets/quiet-hours.mp3.asset.json';
import weightless from '../src/assets/weightless.mp3.asset.json';
import afterglow from '../src/assets/afterglow.mp3.asset.json';

// Copy the existing hosted sample assets into the APK, preserving their URLs.
const origin = process.env['ANDROID_ASSET_ORIGIN'] ?? 'https://float-sound-player.lovable.app';
for (const asset of [quiet, weightless, afterglow]) {
  const response = await fetch(new URL(asset.url, origin));
  if (!response.ok) throw new Error(`Cannot bundle ${asset.original_filename}: ${response.status}`);
  const bytes = new Uint8Array(await response.arrayBuffer());
  if (bytes.length !== asset.size) throw new Error(`Invalid audio download: ${asset.original_filename}`);
  const target = `dist/android${asset.url}`;
  await mkdir(target.slice(0, target.lastIndexOf('/')), { recursive: true });
  await writeFile(target, bytes);
}
await copyFile('dist/android/index.html', 'dist/android/404.html');