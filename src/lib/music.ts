import quietArt from '@/assets/quiet-hours.jpg';
import morningArt from '@/assets/slow-mornings.jpg';
import nightArt from '@/assets/after-hours.jpg';
import quietAudio from '@/assets/quiet-hours.mp3.asset.json';
import morningAudio from '@/assets/weightless.mp3.asset.json';
import nightAudio from '@/assets/afterglow.mp3.asset.json';

export type Track = { id: string; title: string; artist: string; album: string; artwork: string; src: string; duration: number; imported?: boolean };
export const defaultTrack: Track = { id: 'quiet', title: 'Quiet Hours', artist: 'NocTune Sessions', album: 'A little stillness', artwork: quietArt, src: quietAudio.url, duration: 30 };
export const initialTracks: Track[] = [
  defaultTrack,
  { id: 'weightless', title: 'Weightless', artist: 'NocTune Sessions', album: 'Slow mornings', artwork: morningArt, src: morningAudio.url, duration: 30 },
  { id: 'afterglow', title: 'Afterglow', artist: 'NocTune Sessions', album: 'After hours', artwork: nightArt, src: nightAudio.url, duration: 30 },
];
export const playlists = [
  { title: 'Slow mornings', subtitle: 'A softer start', art: morningArt, id: 'weightless' },
  { title: 'Quiet moments', subtitle: 'Room to breathe', art: quietArt, id: 'quiet' },
  { title: 'After hours', subtitle: 'Into the night', art: nightArt, id: 'afterglow' },
];

function openMusicDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('melo-local-music', 1);
    request.onupgradeneeded = () => request.result.createObjectStore('tracks', { keyPath: 'id' });
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
export function probeDuration(src: string): Promise<number> {
  return new Promise(resolve => {
    const audio = new Audio();
    audio.preload = 'metadata';
    const done = (value: number) => {
      audio.onloadedmetadata = null;
      audio.onerror = null;
      resolve(Number.isFinite(value) && value > 0 ? Math.round(value) : 0);
    };
    audio.onloadedmetadata = () => done(audio.duration);
    audio.onerror = () => done(0);
    setTimeout(() => done(audio.duration), 10000);
    audio.src = src;
  });
}
export async function updateLocalTrackDuration(id: string, duration: number) {
  const db = await openMusicDB();
  return new Promise<void>((resolve, reject) => {
    const transaction = db.transaction('tracks', 'readwrite');
    const store = transaction.objectStore('tracks');
    const request = store.get(id);
    request.onsuccess = () => { if (request.result) store.put({ ...request.result, duration }); };
    transaction.oncomplete = () => { db.close(); resolve(); };
    transaction.onerror = () => { db.close(); reject(transaction.error); };
  });
}
export async function saveLocalTrack(track: Track, file: File) {
  const db = await openMusicDB();
  return new Promise<void>((resolve, reject) => {
    const transaction = db.transaction('tracks', 'readwrite');
    transaction.objectStore('tracks').put({ ...track, src: '', file });
    transaction.oncomplete = () => { db.close(); resolve(); };
    transaction.onerror = () => { db.close(); reject(transaction.error); };
  });
}
export async function loadLocalTracks(): Promise<Track[]> {
  const db = await openMusicDB();
  return new Promise((resolve, reject) => {
    const request = db.transaction('tracks').objectStore('tracks').getAll();
    request.onsuccess = () => { db.close(); resolve(request.result.map(({ file, ...track }: Track & { file: File }) => ({ ...track, src: URL.createObjectURL(file) }))); };
    request.onerror = () => { db.close(); reject(request.error); };
  });
}