import { createFileRoute, Link } from '@tanstack/react-router';
import { ArrowUpRight, Play } from 'lucide-react';
import { Player } from '@/components/player';
import { Button } from '@/components/ui/button';
import { useMusic } from '@/components/music-provider';
import { playlists } from '@/lib/music';

export const Route = createFileRoute('/')({
  head: () => ({ meta: [{ title: 'NocTune — Your music, your moment' }, { name: 'description', content: 'A little stillness. Listen to your music with NocTune, your personal audio player.' }, { property: 'og:title', content: 'NocTune — Your music, your moment' }, { property: 'og:description', content: 'Your personal audio player. A little more you, a little more music.' }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary_large_image' }] }),
  component: Index,
});
function Index() {
  const m = useMusic();
  return <div className="player-page"><div className="player-intro"><span className="eyebrow">SETTLE IN. PRESS PLAY.</span><h2>Your music.<br />A little breathing room.</h2><div className="player-playlists"><div className="section-heading"><h3>Made for your moment</h3><Button variant="ghost" size="icon" asChild title="Your library"><Link to="/library"><ArrowUpRight /></Link></Button></div>{playlists.map(p => <Button variant="ghost" className={`moment-row ${m.current.id === p.id ? 'moment-selected' : ''}`} key={p.id} onClick={() => m.select(p.id)}><img src={p.art} alt="" width={64} height={64} /><span><strong>{p.title}</strong><small>{p.subtitle}</small></span><span className="moment-play"><Play fill="currentColor" /></span></Button>)}</div><div className="intro-footer"><span className="eyebrow">GOOD MUSIC. NOTHING ELSE.</span><span className="fine-line" /></div></div><Player full /></div>;
}
