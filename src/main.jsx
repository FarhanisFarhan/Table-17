import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { motion, AnimatePresence } from 'framer-motion';
import Lenis from 'lenis';
import {
  Home,
  Search,
  Library,
  ListMusic,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  Plus,
  Menu,
  X,
  Sparkles,
} from 'lucide-react';
import './styles.css';

const playlists = [
  {
    title: 'Velvet Room',
    subtitle: 'Late-night RnB, chrome synths, slow lights',
    gradient: 'linear-gradient(135deg, #3525ff, #8b5cf6 48%, #ff4ecd)',
    songs: '42 tracks',
  },
  {
    title: 'Soft Launch',
    subtitle: 'Indie pop and glossy bedroom hooks',
    gradient: 'linear-gradient(135deg, #11d97c, #1db954 42%, #b7ff51)',
    songs: '28 tracks',
  },
  {
    title: 'Afterglow Drive',
    subtitle: 'Night-drive edits with cinematic bass',
    gradient: 'linear-gradient(135deg, #ff7a1a, #ef4444 50%, #f9a8d4)',
    songs: '35 tracks',
  },
];

const recentSongs = [
  { title: 'Glass Ceiling', artist: 'Mira Vale', duration: '3:18', color: '#7c3aed' },
  { title: 'Pixel Hearts', artist: 'Noah K', duration: '2:54', color: '#06b6d4' },
  { title: 'Moon Parking', artist: 'The Lanes', duration: '4:05', color: '#f97316' },
  { title: 'Neon Tides', artist: 'Ari Sol', duration: '3:42', color: '#22c55e' },
];

const albums = [
  { title: 'Chrome Diary', artist: 'Eli North', color: '#e879f9' },
  { title: 'Sunday Voltage', artist: 'Koa Club', color: '#60a5fa' },
  { title: 'Low Orbit', artist: 'Sable', color: '#34d399' },
  { title: 'Polaroid Motion', artist: 'June West', color: '#fb7185' },
];

const navItems = [
  { label: 'Home', icon: Home },
  { label: 'Search', icon: Search },
  { label: 'Library', icon: Library },
  { label: 'Playlists', icon: ListMusic },
];

function App() {
  const [playing, setPlaying] = useState(true);
  const [trackIndex, setTrackIndex] = useState(0);
  const [progress, setProgress] = useState(38);
  const [volume, setVolume] = useState(68);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [premium, setPremium] = useState(true);
  const [isDesktop, setIsDesktop] = useState(() => window.matchMedia('(min-width: 901px)').matches);

  const activeTrack = recentSongs[trackIndex];

  useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 901px)');
    const syncViewport = () => setIsDesktop(mediaQuery.matches);
    syncViewport();
    mediaQuery.addEventListener('change', syncViewport);
    return () => mediaQuery.removeEventListener('change', syncViewport);
  }, []);

  useEffect(() => {
    const lenis = new Lenis({ lerp: 0.08, wheelMultiplier: 0.9, smoothWheel: true });
    let rafId;
    function raf(time) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);
    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);

  useEffect(() => {
    if (!playing) return undefined;
    const timer = setInterval(() => {
      setProgress((value) => (value >= 99 ? 0 : value + 1));
    }, 900);
    return () => clearInterval(timer);
  }, [playing]);

  const levelBars = useMemo(
    () => Array.from({ length: 18 }, (_, index) => 18 + ((index * 17 + progress + volume) % 64)),
    [progress, volume],
  );

  const nextTrack = () => setTrackIndex((index) => (index + 1) % recentSongs.length);
  const previousTrack = () => setTrackIndex((index) => (index - 1 + recentSongs.length) % recentSongs.length);

  return (
    <div className={`app-shell ${premium ? 'premium' : 'classic'}`}>
      <CursorGlow />
      <AuroraBackground />
      <button className="mobile-menu" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
        <Menu size={22} />
      </button>

      <AnimatePresence>
        {(sidebarOpen || isDesktop) && (
          <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        )}
      </AnimatePresence>

      <main className="content-frame">
        <motion.nav
          className="topbar glass-panel"
          initial={{ y: -24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <div>
            <span className="eyebrow">Premium soundboard</span>
            <h1>Make every scroll feel like a set.</h1>
          </div>
          <div className="topbar-actions">
            <label className="premium-toggle">
              <input type="checkbox" checked={premium} onChange={() => setPremium((value) => !value)} />
              <span>Dark Premium UI</span>
            </label>
            <MagneticButton>Create playlist</MagneticButton>
          </div>
        </motion.nav>

        <HeroSection playing={playing} setPlaying={setPlaying} />

        <section className="section-block" id="playlists">
          <SectionHeader kicker="Curate" title="Create your own playlists" action="Start a mix" />
          <div className="playlist-grid">
            {playlists.map((playlist, index) => (
              <SpotlightCard key={playlist.title} delay={index * 0.08}>
                <div className="playlist-cover" style={{ background: playlist.gradient }}>
                  <button className="floating-play" aria-label={`Play ${playlist.title}`}>
                    <Play size={18} fill="currentColor" />
                  </button>
                </div>
                <div className="card-copy">
                  <h3>{playlist.title}</h3>
                  <p>{playlist.subtitle}</p>
                  <span>{playlist.songs}</span>
                </div>
              </SpotlightCard>
            ))}
          </div>
        </section>

        <section className="section-block split-layout">
          <div>
            <SectionHeader kicker="Replay" title="Recently played songs" />
            <div className="song-list glass-panel">
              {recentSongs.map((song, index) => (
                <motion.button
                  className={`song-row ${index === trackIndex ? 'active' : ''}`}
                  key={song.title}
                  onClick={() => setTrackIndex(index)}
                  whileHover={{ x: 8, scale: 1.01 }}
                  transition={{ type: 'spring', stiffness: 280, damping: 22 }}
                >
                  <span className="song-art" style={{ background: song.color }} />
                  <span>
                    <strong>{song.title}</strong>
                    <small>{song.artist}</small>
                  </span>
                  <em>{song.duration}</em>
                </motion.button>
              ))}
            </div>
          </div>

          <div>
            <SectionHeader kicker="Albums" title="Recommended albums" />
            <div className="album-stack">
              {albums.map((album, index) => (
                <motion.article
                  className="album-card glass-panel"
                  key={album.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{ delay: index * 0.08 }}
                  whileHover={{ y: -10, rotate: index % 2 ? 1.5 : -1.5 }}
                >
                  <div className="album-art" style={{ '--album-color': album.color }} />
                  <h3>{album.title}</h3>
                  <p>{album.artist}</p>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        <InfiniteAlbumStrip />
      </main>

      <MusicPlayer
        activeTrack={activeTrack}
        playing={playing}
        setPlaying={setPlaying}
        progress={progress}
        setProgress={setProgress}
        volume={volume}
        setVolume={setVolume}
        levelBars={levelBars}
        nextTrack={nextTrack}
        previousTrack={previousTrack}
      />
    </div>
  );
}

function Sidebar({ onClose }) {
  return (
    <motion.aside
      className="sidebar glass-panel"
      initial={{ x: -320, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -320, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 130, damping: 20 }}
    >
      <div className="brand-row">
        <div className="brand-mark">S</div>
        <div>
          <strong>Spotify</strong>
          <span>Frontend</span>
        </div>
        <button className="close-sidebar" onClick={onClose} aria-label="Close menu">
          <X size={18} />
        </button>
      </div>
      <nav className="nav-list">
        {navItems.map(({ label, icon: Icon }) => (
          <a href={`#${label.toLowerCase()}`} key={label}>
            <Icon size={20} />
            {label}
          </a>
        ))}
      </nav>
      <div className="library-card">
        <Plus size={18} />
        <span>Drop a vibe, build a playlist, keep it moving.</span>
      </div>
    </motion.aside>
  );
}

function HeroSection({ playing, setPlaying }) {
  return (
    <section className="hero-grid">
      <motion.div
        className="hero-copy"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.75, ease: 'easeOut' }}
      >
        <span className="eyebrow">Glass UI for daily listening</span>
        <h2>Spotify energy, premium motion, fully responsive.</h2>
        <p>
          A sleek React frontend with playlist discovery, dynamic cards, an interactive player, smooth Lenis scroll,
          and motion.dev style transitions built for desktop and mobile.
        </p>
        <div className="hero-actions">
          <MagneticButton onClick={() => setPlaying(!playing)}>{playing ? 'Pause session' : 'Play session'}</MagneticButton>
          <a href="#playlists" className="ghost-link">Explore playlists</a>
        </div>
      </motion.div>
      <motion.div
        className="now-card glass-panel"
        initial={{ opacity: 0, scale: 0.9, rotate: -3 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        transition={{ duration: 0.7, delay: 0.1 }}
      >
        <div className="vinyl-orb" />
        <Sparkles className="spark" size={26} />
        <h3>Pinterest-grade moodboard listening</h3>
        <p>Glass layers, glossy gradients, hover reveals, and iOS-inspired spacing.</p>
      </motion.div>
    </section>
  );
}

function MusicPlayer({ activeTrack, playing, setPlaying, progress, setProgress, volume, setVolume, levelBars, nextTrack, previousTrack }) {
  return (
    <motion.footer
      className="music-player glass-panel"
      initial={{ y: 120, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 120, damping: 18, delay: 0.25 }}
    >
      <div className="track-meta">
        <div className="player-art" style={{ background: activeTrack.color }} />
        <div>
          <strong>{activeTrack.title}</strong>
          <span>{activeTrack.artist}</span>
        </div>
      </div>
      <div className="player-center">
        <div className="player-controls">
          <button onClick={previousTrack} aria-label="Previous track"><SkipBack size={20} /></button>
          <button className="play-core" onClick={() => setPlaying(!playing)} aria-label="Play or pause">
            {playing ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
          </button>
          <button onClick={nextTrack} aria-label="Next track"><SkipForward size={20} /></button>
        </div>
        <input className="progress-range" type="range" min="0" max="100" value={progress} onChange={(event) => setProgress(Number(event.target.value))} aria-label="Song progress" />
      </div>
      <div className="volume-module">
        <Volume2 size={19} />
        <div className="level-bars" aria-hidden="true">
          {levelBars.map((height, index) => (
            <span key={index} style={{ height: `${height}%`, animationDelay: `${index * 0.04}s` }} />
          ))}
        </div>
        <input className="volume-range" type="range" min="0" max="100" value={volume} onChange={(event) => setVolume(Number(event.target.value))} aria-label="Volume" />
      </div>
    </motion.footer>
  );
}

function SectionHeader({ kicker, title, action }) {
  return (
    <div className="section-header">
      <div>
        <span className="eyebrow">{kicker}</span>
        <h2>{title}</h2>
      </div>
      {action && <button>{action}</button>}
    </div>
  );
}

function SpotlightCard({ children, delay = 0 }) {
  const moveSpotlight = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty('--x', `${event.clientX - rect.left}px`);
    event.currentTarget.style.setProperty('--y', `${event.clientY - rect.top}px`);
  };

  return (
    <motion.article
      className="spotlight-card glass-panel"
      onMouseMove={moveSpotlight}
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.55, delay }}
      whileHover={{ scale: 1.035, y: -8 }}
    >
      {children}
    </motion.article>
  );
}

function MagneticButton({ children, onClick }) {
  return (
    <motion.button
      className="magnetic-button"
      onClick={onClick}
      whileHover={{ scale: 1.05, boxShadow: '0 0 34px rgba(29, 185, 84, 0.48)' }}
      whileTap={{ scale: 0.96 }}
    >
      {children}
    </motion.button>
  );
}

function InfiniteAlbumStrip() {
  const strip = [...albums, ...playlists, ...albums];
  return (
    <section className="ticker-section glass-panel">
      <span className="eyebrow">For you</span>
      <motion.div className="ticker-track" animate={{ x: ['0%', '-45%'] }} transition={{ repeat: Infinity, duration: 24, ease: 'linear' }}>
        {strip.map((item, index) => (
          <span key={`${item.title}-${index}`}>{item.title}</span>
        ))}
      </motion.div>
    </section>
  );
}

function AuroraBackground() {
  return <div className="aurora-bg" aria-hidden="true"><span /><span /><span /></div>;
}

function CursorGlow() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const move = (event) => setPosition({ x: event.clientX, y: event.clientY });
    window.addEventListener('pointermove', move);
    return () => window.removeEventListener('pointermove', move);
  }, []);
  return <motion.div className="cursor-glow" animate={{ x: position.x - 180, y: position.y - 180 }} transition={{ type: 'spring', stiffness: 60, damping: 20 }} />;
}

createRoot(document.getElementById('root')).render(<App />);
