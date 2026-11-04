import { ChevronRight, Heart, ListMusic, Pause, Play, Repeat2, RotateCcw, RotateCw, Shuffle, SkipBack, SkipForward, Volume2, VolumeX } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useMusic } from './music-provider';
import { formatTime } from './player-helpers';

export function formatTime(value: number) { return `${Math.floor(value / 60)}:${String(Math.floor(value % 60)).padStart(2, '0')}`; }
export function Vinyl({ artwork, playing = false, small = false }: { artwork: string; playing?: boolean; small?: boolean }) {
  return <div className={`vinyl ${playing ? 'spinning' : ''} ${small ? 'vinyl-small' : ''}`}><img src={artwork} alt="Album artwork" width={1024} height={1024} /><span className="spindle" /></div>;
}
export function Player({ full = false }: { full?: boolean }) {
  const m = useMusic();
  const [queue, setQueue] = useState(true);
  const nextTrack = m.tracks[(m.tracks.findIndex(t => t.id === m.current.id) + 1) % m.tracks.length];
  return <section className={`player ${full ? 'player-full' : ''}`}>
    <div className="record-wrap"><Vinyl artwork={m.current.artwork} playing={m.playing} /></div>
    <div className="song-heading"><h1>{m.current.title}</h1><p>{m.current.artist}</p></div>
    <div className="track-meta"><span className="original-tag">{m.current.imported ? 'YOUR MUSIC' : 'NOCTUNE ORIGINAL'}</span><Button variant="ghost" size="icon" aria-label={m.likes.includes(m.current.id) ? 'Remove from favourites' : 'Add to favourites'} onClick={() => m.like(m.current.id)} className={m.likes.includes(m.current.id) ? 'is-liked' : ''}><Heart fill={m.likes.includes(m.current.id) ? 'currentColor' : 'none'} /></Button></div>
    <input className="range progress-range" type="range" aria-label="Track progress" min="0" max={m.duration || 1} step="0.1" value={Math.min(m.time, m.duration || 1)} onChange={e => m.seek(Number(e.target.value))} />
    <div className="time-labels"><span>{formatTime(m.time)}</span><span>{formatTime(m.duration)}</span></div>
    <div className="playback-controls"><Button variant="float" size="icon" aria-label="Previous track" onClick={() => m.next(-1)}><SkipBack fill="currentColor" /></Button><Button variant="ghost" size="icon" aria-label="Rewind 5 seconds" onClick={() => m.seek(Math.max(0, m.time - 5))}><span className="skip-icon" aria-hidden="true"><RotateCcw /><span className="skip-number">5</span></span></Button><Button variant="player" className="main-play" aria-label={m.playing ? 'Pause' : 'Play'} onClick={m.togglePlay}>{m.playing ? <Pause fill="currentColor" /> : <Play fill="currentColor" />}</Button><Button variant="ghost" size="icon" aria-label="Forward 5 seconds" onClick={() => m.seek(Math.min(m.duration, m.time + 5))}><span className="skip-icon" aria-hidden="true"><RotateCw /><span className="skip-number">5</span></span></Button><Button variant="float" size="icon" aria-label="Next track" onClick={() => m.next(1)}><SkipForward fill="currentColor" /></Button></div>
    <div className="secondary-controls"><Button variant="ghost" size="icon" aria-label="Shuffle" aria-pressed={m.shuffle} className={m.shuffle ? 'is-active' : ''} onClick={() => m.setShuffle(!m.shuffle)}><Shuffle /></Button><Button variant="ghost" className="speed-control" aria-label="Playback speed" onClick={() => m.setSpeed(m.speed === 1 ? 1.25 : m.speed === 1.25 ? 1.5 : m.speed === 1.5 ? 2 : 1)}>{m.speed}×</Button><Button variant="ghost" size="icon" aria-label="Repeat" aria-pressed={m.repeat} className={m.repeat ? 'is-active' : ''} onClick={() => m.setRepeat(!m.repeat)}><Repeat2 /></Button></div>
    <div className="volume-control"><Button variant="ghost" size="icon" aria-label={m.volume ? 'Mute' : 'Unmute'} onClick={() => m.setVolume(m.volume ? 0 : 70)}>{m.volume ? <Volume2 /> : <VolumeX />}</Button><input className="range" type="range" aria-label="Volume" min="0" max="100" value={m.volume} onChange={e => m.setVolume(Number(e.target.value))} /><span>{m.volume}%</span></div>
    {m.error && <p role="alert" className="playback-error">{m.error}</p>}
    <div className="up-next"><div className="section-heading"><h3>Up next</h3><Button variant="ghost" size="icon" aria-label="Toggle queue" onClick={() => setQueue(!queue)}><ListMusic /></Button></div>{queue && nextTrack && <Button variant="ghost" className="queue-track" onClick={() => m.select(nextTrack.id)}><img src={nextTrack.artwork} alt="" width={44} height={44} /><span className="queue-text"><strong>{nextTrack.title}</strong><small>{nextTrack.artist}</small></span><span className="queue-time">{formatTime(nextTrack.duration)}</span><ChevronRight size={16} /></Button>}</div>
  </section>;
}
