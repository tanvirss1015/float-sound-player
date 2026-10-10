import { createFileRoute } from '@tanstack/react-router';
import { Plus, Search, Play } from 'lucide-react';
import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useMusic } from '@/components/music-provider';
import { TrackList } from '@/components/track-list';
import { playlists } from '@/lib/music';

export const Route = createFileRoute('/library')({ head: () => ({ meta: [{ title: 'Your library — Melo' }, { name: 'description', content: 'Your playlists and personal music collection in Melo.' }, { property: 'og:title', content: 'Your library — Melo' }, { property: 'og:description', content: 'Your favourite moments, collected in music.' }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary_large_image' }] }), component: Library });
function Library() {
  const m = useMusic();
  const [query, setQuery] = useState('');
  const input = useRef<HTMLInputElement>(null);
  const tracks = m.tracks.filter(t => `${t.title} ${t.artist} ${t.album}`.toLowerCase().includes(query.toLowerCase()));
  return <div className="collection-page"><div className="collection-title"><div><span className="eyebrow">A PLACE FOR YOUR MUSIC</span><h1>Your library.</h1><p>Good music. A little breathing room.</p></div><Button variant="float" onClick={() => input.current?.click()}><Plus />Import music</Button><input ref={input} hidden type="file" accept="audio/*,.flac,.m4a" multiple onChange={e => { m.importFiles(e.target.files); e.target.value = ''; }} /></div><div className="section-heading"><h2>Your playlists</h2><span className="subtle">3 moments</span></div><div className="playlist-grid">{playlists.map(p => <div className="playlist-card" key={p.id}><Button variant="ghost" className="playlist-art" onClick={() => m.select(p.id)} aria-label={`Play ${p.title}`}><img src={p.art} alt={p.title} width={1024} height={1024} /><span>1 track</span></Button><div className="playlist-card-bottom"><div><h3>{p.title}</h3><p>{p.subtitle}</p></div><Button variant="float" size="icon" aria-label={`Play ${p.title} playlist`} onClick={() => m.select(p.id)}><Play fill="currentColor" /></Button></div></div>)}</div><div className="section-heading rotation-heading"><h2>On your rotation</h2><span className="subtle">{m.tracks.length} tracks</span></div><label className="music-search"><Search size={16} /><input aria-label="Search your music" placeholder="Search your music" value={query} onChange={e => setQuery(e.target.value)} /></label><TrackList tracks={tracks} />{tracks.length === 0 && <p className="empty-state">No tracks found for “{query}”.</p>}</div>;
}