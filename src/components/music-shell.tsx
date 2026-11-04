import { Link, Outlet, useLocation } from '@tanstack/react-router';
import { AudioLines, Heart, Library, ListMusic, Menu, Moon, Music2, Plus, Sun, Upload, X } from 'lucide-react';
import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useMusic } from './music-provider';
import { Player } from './player';
import { EqualizerPanel } from './equalizer-panel';
import { playlists } from '@/lib/music';
import brandLogo from '@/assets/noctune-logo.png.asset.json';

function importFromDevice(m: ReturnType<typeof useMusic>, fileInput: React.RefObject<HTMLInputElement | null>) {
  m.pickDeviceAudio().then(handled => { if (!handled) fileInput.current?.click(); });
}

export function MusicShell() {
  const m = useMusic();
  const location = useLocation();
  const [menu, setMenu] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const isPlayer = location.pathname === '/';
  const nav = <><span className="eyebrow nav-label">YOUR SPACE</span><Button variant="ghost" asChild className={`nav-link ${isPlayer ? 'selected' : ''}`}><Link to="/" onClick={() => setMenu(false)}><AudioLines />Player</Link></Button><Button variant="ghost" asChild className={`nav-link ${location.pathname === '/library' ? 'selected' : ''}`}><Link to="/library" onClick={() => setMenu(false)}><Library />Your library</Link></Button><Button variant="ghost" asChild className={`nav-link ${location.pathname === '/favourites' ? 'selected' : ''}`}><Link to="/favourites" onClick={() => setMenu(false)}><Heart />Favourites<span className="nav-count">{m.likes.length}</span></Link></Button><div className="playlist-nav-title"><span className="eyebrow">PLAYLISTS</span><Button variant="ghost" size="icon" title="Import music" aria-label="Import music" onClick={() => importFromDevice(m, fileInput)}><Plus /></Button></div>{playlists.map(p => <Button key={p.id} variant="ghost" className="nav-link" onClick={() => { m.select(p.id); setMenu(false); }}><ListMusic />{p.title}</Button>)}<Button variant="ghost" className="nav-link upload-nav" onClick={() => importFromDevice(m, fileInput)}><Upload />Your uploads</Button></>;
  const brand = <><img src={brandLogo.url} alt="NocTune logo" width={30} height={30} className="brand-mark" />NocTune<span>.</span></>;
  return <div className="app-shell"><input ref={fileInput} type="file" accept="audio/*,.flac,.m4a" multiple hidden onChange={e => { m.importFiles(e.target.files); e.target.value = ''; }} />
    <aside className="sidebar"><Link to="/" className="brand">{brand}</Link><nav>{nav}</nav><div className="sidebar-footer"><span className="little-note"><Music2 size={18} /><span>A little more you.<small>A little more music.</small></span></span><span className="version-label">NOCTUNE PLAYER · 01</span></div></aside>
    <main className={`main-content ${isPlayer ? 'is-player-page' : ''}`}><header className="main-header"><span className="eyebrow desktop-tagline">YOUR MUSIC, YOUR MOMENT</span><Link to="/" className="brand mobile-brand">{brand}</Link><div className="header-actions"><Button variant="float" size="icon" aria-label={m.light ? 'Switch to dark mode' : 'Switch to light mode'} title={m.light ? 'Dark mode' : 'Light mode'} onClick={() => m.setLight(!m.light)}>{m.light ? <Moon /> : <Sun />}</Button><Button variant="float" size="icon" aria-label="Open menu" onClick={() => setMenu(!menu)}><Menu /></Button></div></header><Outlet /></main>
    {!isPlayer && <aside className="side-player"><Player /></aside>}
    <nav className="mobile-nav"><Button variant="ghost" asChild className={isPlayer ? 'is-active' : ''}><Link to="/"><AudioLines /><span>Player</span></Link></Button><Button variant="ghost" asChild className={location.pathname === '/library' ? 'is-active' : ''}><Link to="/library"><Library /><span>Library</span></Link></Button><Button variant="ghost" asChild className={location.pathname === '/favourites' ? 'is-active' : ''}><Link to="/favourites"><Heart /><span>Favourites</span></Link></Button><Button variant="ghost" onClick={() => setMenu(!menu)}><Menu /><span>Menu</span></Button></nav>
    {menu && <><div className="menu-backdrop" onClick={() => setMenu(false)} /><aside className="menu-drawer" aria-label="Menu"><div className="drawer-heading"><span className="brand">{brand}</span><Button variant="ghost" size="icon" aria-label="Close menu" onClick={() => setMenu(false)}><X /></Button></div><nav>{nav}</nav><EqualizerPanel /><div className="menu-theme"><span>Appearance</span><Button variant="float" onClick={() => m.setLight(!m.light)}>{m.light ? <Moon /> : <Sun />}{m.light ? 'Dark' : 'Light'}</Button></div></aside></>}
  </div>;
}
