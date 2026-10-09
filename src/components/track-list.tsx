import { AudioLines, Clock3, Heart, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useMusic } from './music-provider';
import { formatTime } from './player';
import type { Track } from '@/lib/music';

export function TrackList({ tracks }: { tracks: Track[] }) {
  const m = useMusic();
  return <div className="track-list"><div className="track-table-heading"><span /><span>TRACK</span><span className="track-album">ALBUM</span><Clock3 size={13} /><span /></div>{tracks.map((t, i) => <div key={t.id} className={`track-row ${m.current.id === t.id ? 'current-track' : ''}`}><Button variant="ghost" size="icon" aria-label={`Play ${t.title}`} onClick={() => m.select(t.id)}>{m.current.id === t.id ? <AudioLines /> : <><span className="track-number">{String(i + 1).padStart(2, '0')}</span><Play className="track-hover-play" /></>}</Button><Button variant="ghost" className="track-title" onClick={() => m.select(t.id)}><img src={t.artwork} alt="" width={40} height={40} /><span><strong>{t.title}</strong><small>{t.artist}</small></span></Button><span className="track-album">{t.album}</span><span className="track-duration">{formatTime(t.duration)}</span><Button variant="ghost" size="icon" className={m.likes.includes(t.id) ? 'is-liked' : ''} aria-label={`${m.likes.includes(t.id) ? 'Unfavourite' : 'Favourite'} ${t.title}`} onClick={() => m.like(t.id)}><Heart fill={m.likes.includes(t.id) ? 'currentColor' : 'none'} /></Button></div>)}</div>;
}