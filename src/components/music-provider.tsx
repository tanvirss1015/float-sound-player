import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { initialTracks, loadLocalTracks, saveLocalTrack, type Track } from '@/lib/music';

function useMusicState() {
  const [tracks, setTracks] = useState(initialTracks);
  const [currentId, setCurrentId] = useState('quiet');
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(30);
  const [volume, setVolume] = useState(70);
  const [likes, setLikes] = useState<string[]>(['quiet']);
  const [light, setLight] = useState(false);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [error, setError] = useState('');
  const audio = useRef<HTMLAudioElement>(null);
  const current = tracks.find(t => t.id === currentId) ?? initialTracks[0];
  useEffect(() => {
    loadLocalTracks().then(saved => setTracks([...initialTracks, ...saved])).catch(() => {});
    try { const saved = localStorage.getItem('melo-likes'); if (saved) setLikes(JSON.parse(saved)); setLight(localStorage.getItem('melo-theme') === 'light'); } catch {}
  }, []);
  useEffect(() => { document.documentElement.dataset.theme = light ? 'light' : 'dark'; localStorage.setItem('melo-theme', light ? 'light' : 'dark'); }, [light]);
  useEffect(() => { localStorage.setItem('melo-likes', JSON.stringify(likes)); }, [likes]);
  useEffect(() => { if (audio.current) { audio.current.volume = volume / 100; audio.current.playbackRate = speed; } }, [volume, speed]);
  useEffect(() => {
    if (!audio.current) return;
    setTime(0); setDuration(current.duration); setError('');
    if (playing) audio.current.play().catch(() => { setPlaying(false); setError('Tap play to start your music.'); });
  }, [current.src]);
  useEffect(() => {
    if (!('mediaSession' in navigator)) return;
    navigator.mediaSession.metadata = new MediaMetadata({ title: current.title, artist: current.artist, album: current.album, artwork: [{ src: current.artwork, sizes: '1024x1024', type: 'image/jpeg' }] });
    navigator.mediaSession.setActionHandler('play', () => { audio.current?.play().then(() => setPlaying(true)).catch(() => setError('This track could not be played.')); });
    navigator.mediaSession.setActionHandler('pause', () => { audio.current?.pause(); setPlaying(false); });
    navigator.mediaSession.setActionHandler('nexttrack', () => next(1));
    navigator.mediaSession.setActionHandler('previoustrack', () => next(-1));
  }, [current, tracks, shuffle]);
  function togglePlay() {
    if (!audio.current) return;
    if (playing) { audio.current.pause(); setPlaying(false); }
    else audio.current.play().then(() => { setPlaying(true); setError(''); }).catch(() => setError('Unable to play this file. Try importing another audio file.'));
  }
  function select(id: string) { if (id === currentId) { if (!playing) togglePlay(); } else { setCurrentId(id); setPlaying(true); } }
  function next(direction: number) {
    const index = tracks.findIndex(t => t.id === currentId);
    const target = shuffle ? tracks.filter(t => t.id !== currentId)[Math.floor(Math.random() * Math.max(1, tracks.length - 1))] : tracks[(index + direction + tracks.length) % tracks.length];
    if (target) setCurrentId(target.id);
  }
  function seek(value: number) { if (audio.current) audio.current.currentTime = value; setTime(value); }
  function like(id: string) { setLikes(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]); }
  async function importFiles(files: FileList | null) {
    if (!files) return;
    for (const file of Array.from(files)) {
      if (!file.type.startsWith('audio/') && !/\.(mp3|wav|ogg|m4a|flac|aac)$/i.test(file.name)) { setError('Please choose an audio file.'); continue; }
      const track: Track = { id: crypto.randomUUID(), title: file.name.replace(/\.[^.]+$/, ''), artist: 'Your music', album: 'Your uploads', artwork: initialTracks[0].artwork, src: URL.createObjectURL(file), duration: 0, imported: true };
      setTracks(prev => [...prev, track]);
      try { await saveLocalTrack(track, file); } catch { setError('Music is available this session, but could not be saved on this device.'); }
    }
  }
  return { tracks, current, playing, time, duration, volume, likes, light, shuffle, repeat, speed, error, audio, togglePlay, select, next, seek, like, importFiles, setVolume, setLight, setShuffle, setRepeat, setSpeed, setPlaying, setTime, setDuration };
}
type MusicState = ReturnType<typeof useMusicState>;
const MusicContext = createContext<MusicState | null>(null);
export function MusicProvider({ children }: { children: ReactNode }) {
  const state = useMusicState();
  return <MusicContext.Provider value={state}>{children}<audio ref={state.audio} src={state.current.src} preload="metadata" loop={state.repeat} onTimeUpdate={e => state.setTime(e.currentTarget.currentTime)} onLoadedMetadata={e => state.setDuration(Number.isFinite(e.currentTarget.duration) ? e.currentTarget.duration : 0)} onEnded={() => state.next(1)} onPlay={() => state.setPlaying(true)} onPause={() => state.setPlaying(false)} /></MusicContext.Provider>;
}
export function useMusic() { const value = useContext(MusicContext); if (!value) throw new Error('MusicProvider is required'); return value; }