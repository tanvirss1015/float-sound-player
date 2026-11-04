import { Capacitor } from '@capacitor/core';
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { defaultTrack, initialTracks, loadLocalTracks, saveLocalTrack, probeDuration, updateLocalTrackDuration, type Track } from '@/lib/music';
import { createEqualizer, equalizerPresets } from '@/lib/equalizer';

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
  const [eqEnabled, setEqEnabled] = useState(false);
  const [eqGains, setEqGains] = useState<number[]>(equalizerPresets['Flat'] ?? [0, 0, 0, 0, 0]);
  const equalizer = useRef<ReturnType<typeof createEqualizer> | null>(null);
  const audio = useRef<HTMLAudioElement>(null);
  const current = tracks.find(t => t.id === currentId) ?? defaultTrack;
  useEffect(() => {
    loadLocalTracks().then(async saved => {
      setTracks([...initialTracks, ...saved]);
      for (const track of saved.filter(t => !t.duration)) {
        const seconds = await probeDuration(track.src);
        if (seconds) {
          setTracks(previous => previous.map(t => (t.id === track.id ? { ...t, duration: seconds } : t)));
          try { await updateLocalTrackDuration(track.id, seconds); } catch {}
        }
      }
    }).catch(() => {});
    try { const saved = localStorage.getItem('melo-likes'); if (saved) setLikes(JSON.parse(saved)); setLight(localStorage.getItem('melo-theme') === 'light'); } catch {}
  }, []);
  useEffect(() => { document.documentElement.dataset['theme'] = light ? 'light' : 'dark'; localStorage.setItem('melo-theme', light ? 'light' : 'dark'); if (Capacitor.isNativePlatform()) (window as unknown as { Capacitor?: { Plugins?: { SystemBars?: { setStyle(options: { style: string }): Promise<void> } } } }).Capacitor?.Plugins?.SystemBars?.setStyle({ style: light ? 'LIGHT' : 'DARK' }).catch(() => {}); }, [light]);
  useEffect(() => { localStorage.setItem('melo-likes', JSON.stringify(likes)); }, [likes]);
  useEffect(() => { if (audio.current) { audio.current.volume = volume / 100; audio.current.playbackRate = speed; } }, [volume, speed]);
  useEffect(() => { equalizer.current?.update(eqGains, eqEnabled); }, [eqGains, eqEnabled]);
  useEffect(() => {
    if (!audio.current) return;
    setTime(0); setDuration(current.duration || 30); setError('');
    if (playing) audio.current.play().catch(() => { setPlaying(false); setError('Tap play to start your music.'); });
  }, [current.src]);
  useEffect(() => {
    if (!('mediaSession' in navigator)) return;
    navigator.mediaSession.metadata = new MediaMetadata({ title: current.title, artist: current.artist, album: current.album, artwork: [{ src: current.artwork, sizes: '1024x1024', type: 'image/jpeg' }] });
    navigator.mediaSession.setActionHandler('play', () => { playAudio(); });
    navigator.mediaSession.setActionHandler('pause', () => { audio.current?.pause(); setPlaying(false); });
    navigator.mediaSession.setActionHandler('nexttrack', () => next(1));
    navigator.mediaSession.setActionHandler('previoustrack', () => next(-1));
  }, [current, tracks, shuffle]);
  function activateEqualizer() {
    if (!audio.current) return;
    try {
      equalizer.current ??= createEqualizer(audio.current);
      equalizer.current.update(eqGains, eqEnabled);
      void equalizer.current.context.resume().catch(() => setError('Tap play to resume audio.'));
    } catch { setError('The equalizer is not supported on this device.'); }
  }
  function playAudio() {
    if (!audio.current) return;
    activateEqualizer();
    audio.current.play().then(() => { setPlaying(true); setError(''); }).catch(() => setError('Unable to play this file. Try importing another audio file.'));
  }
  function toggleEqualizer(value: boolean) { activateEqualizer(); setEqEnabled(value); }
  function togglePlay() {
    if (!audio.current) return;
    if (playing) { audio.current.pause(); setPlaying(false); }
    else playAudio();
  }
  function select(id: string) { activateEqualizer(); if (id === currentId) { if (!playing) togglePlay(); } else { setCurrentId(id); setPlaying(true); } }
  function next(direction: number) {
    const index = tracks.findIndex(t => t.id === currentId);
    const target = shuffle ? tracks.filter(t => t.id !== currentId)[Math.floor(Math.random() * Math.max(1, tracks.length - 1))] : tracks[(index + direction + tracks.length) % tracks.length];
    if (target) setCurrentId(target.id);
  }
  function seek(value: number) { if (audio.current) audio.current.currentTime = value; setTime(value); }
  function like(id: string) { setLikes(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]); }
  async function importFiles(files: FileList | File[] | null) {
    if (!files) return;
    for (const file of Array.from(files)) {
      if (!file.type.startsWith('audio/') && !/\.(mp3|wav|ogg|m4a|flac|aac)$/i.test(file.name)) { setError('Please choose an audio file.'); continue; }
      const src = URL.createObjectURL(file);
      const seconds = await probeDuration(src);
      const track: Track = { id: crypto.randomUUID(), title: file.name.replace(/\.[^.]+$/, ''), artist: 'Your music', album: 'Your uploads', artwork: defaultTrack.artwork, src, duration: seconds, imported: true };
      setTracks(prev => [...prev, track]);
      try { await saveLocalTrack(track, file); } catch { setError('Music is available this session, but could not be saved on this device.'); }
    }
  }
  async function pickDeviceAudio(): Promise<boolean> {
    if (!Capacitor.isNativePlatform()) return false;
    try {
      const { FilePicker } = await import('@capawesome/capacitor-file-picker');
      const picked = await FilePicker.pickFiles({ types: ['audio/*'], limit: 0, readData: false });
      const files: File[] = [];
      for (const pickedFile of picked.files) {
        try {
          const response = await fetch(pickedFile.webPath ?? '');
          const blob = await response.blob();
          files.push(new File([blob], pickedFile.name, { type: pickedFile.mimeType || blob.type || 'audio/mpeg' }));
        } catch { setError('Could not read that audio file.'); }
      }
      if (!files.length) return true;
      await importFiles(files);
      return true;
    } catch {
      return false;
    }
  }
  return { tracks, current, playing, time, duration, volume, likes, light, shuffle, repeat, speed, error, audio, eqEnabled, eqGains, toggleEqualizer, setEqGains, togglePlay, select, next, seek, like, importFiles, pickDeviceAudio, setVolume, setLight, setShuffle, setRepeat, setSpeed, setPlaying, setTime, setDuration };
}
type MusicState = ReturnType<typeof useMusicState>;
const MusicContext = createContext<MusicState | null>(null);
export function MusicProvider({ children }: { children: ReactNode }) {
  const state = useMusicState();
  return <MusicContext.Provider value={state}>{children}<audio ref={state.audio} crossOrigin="anonymous" src={state.current.src} preload="metadata" loop={state.repeat} onTimeUpdate={e => state.setTime(e.currentTarget.currentTime)} onLoadedMetadata={e => state.setDuration(Number.isFinite(e.currentTarget.duration) ? e.currentTarget.duration : 0)} onEnded={() => state.next(1)} onPlay={() => state.setPlaying(true)} onPause={() => state.setPlaying(false)} /></MusicContext.Provider>;
}
export function useMusic() { const value = useContext(MusicContext); if (!value) throw new Error('MusicProvider is required'); return value; }
