import { Link, useLocation } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { Activity, ArrowUpRight, Heart, House, Leaf, MessageCircle, Moon, NotebookPen, Sparkles, Sun, UserRound } from 'lucide-react';
import { useAccount } from '@/features/account/auth-state';
import { Button } from '@/components/ui/button';

const tabs = [
  { label: 'Home', to: '/', icon: House },
  { label: 'Log', to: '/log', icon: NotebookPen },
  { label: 'Vitals', to: '/vitals', icon: Activity },
  { label: 'Coach', to: '/coach', icon: MessageCircle },
  { label: 'Profile', to: '/profile', icon: UserRound },
] as const;

export function HeartLogo({ className = '' }: { className?: string }) {
  return <svg className={className} viewBox="0 0 100 90" fill="none" role="img" aria-label="MyVita heart with pulse line"><path d="M50 77C43 71 13 53 13 31C13 10 39 5 50 23C61 5 87 10 87 31C87 53 57 71 50 77Z" fill="currentColor"/><path d="M21 43H35L42 30L51 56L59 39L64 43H79" className="logo-pulse" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}

export function MyVitaShell({ children }: { children: React.ReactNode }) {
  const [dark, setDark] = useState(false);
  const [splash, setSplash] = useState(false);
  const { pathname } = useLocation();
  const { user } = useAccount();
  useEffect(() => {
    const saved = localStorage.getItem('myvita-theme');
    setDark(saved === 'dark');
    if (!sessionStorage.getItem('myvita-welcomed')) {
      setSplash(true);
      const timer = window.setTimeout(() => { setSplash(false); sessionStorage.setItem('myvita-welcomed', 'yes'); }, 2200);
      return () => window.clearTimeout(timer);
    }
    return undefined;
  }, []);
  useEffect(() => { document.documentElement.classList.toggle('dark', dark); }, [dark]);
  function toggleTheme() { setDark(previous => { localStorage.setItem('myvita-theme', previous ? 'light' : 'dark'); return !previous; }); }
  return <div className="app-shell">
    <header className="app-header">
      <Link to="/" className="brand" aria-label="MyVita home"><HeartLogo className="brand-heart"/><span>MyVita<span className="brand-dot">.</span></span></Link>
      <Button variant="ghost" size="icon" className="theme-toggle" onClick={toggleTheme} aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'} title={dark ? 'Switch to light mode' : 'Switch to dark mode'}>{dark ? <Sun/> : <Moon/>}</Button>
    </header>
    {children}
    <footer className="app-footer"><span className="footer-mark"><Heart size={12}/> A little care, every day.</span><p>MyVita gives guidance, not medical diagnosis.</p></footer>
    {user && pathname !== '/onboarding' && pathname !== '/auth' && <nav className="bottom-nav" aria-label="Main navigation">{tabs.map(({ label, to, icon: Icon }) => <Button key={to} asChild variant="ghost" className={`nav-tab ${pathname === to ? 'nav-active' : ''}`}><Link to={to} aria-current={pathname === to ? 'page' : undefined}><span className="nav-icon"><Icon size={22} strokeWidth={pathname === to ? 2.3 : 1.7}/></span><span>{label}</span></Link></Button>)}</nav>}
    {splash && <div className="splash" role="status" aria-label="Welcome to MyVita"><div className="splash-brand"><HeartLogo className="splash-heart"/><h1>MyVita<span>.</span></h1><p>Your health, understood.</p><span className="splash-byline">BY YASHICA SINGLA</span></div><p className="splash-disclaimer">MyVita gives guidance, not medical diagnosis.</p></div>}
  </div>;
}

export function PlaceholderPage({ page }: { page: typeof tabs[number]['label'] }) {
  const tab = tabs.find(tab => tab.label === page);
  const Icon = tab?.icon ?? House;
  return <main className="page-content">
    <div className="page-heading"><div><p className="eyebrow">YOUR WELLNESS SPACE</p><h1>{page === 'Home' ? 'A fresh start' : page}<span className="heading-dot">.</span></h1></div><span className="page-emblem"><Icon size={23} strokeWidth={1.5}/></span></div>
    <section className="welcome-space" aria-label={`${page} placeholder`}>
      <div className="welcome-art"><div className="heart-tile"><HeartLogo className="welcome-heart"/></div><span className="art-leaf"><Leaf size={27} strokeWidth={1.5}/></span><Sparkles className="art-spark" size={29} strokeWidth={1.4}/><Heart className="art-heart" size={17} fill="currentColor" strokeWidth={0}/></div>
      <span className="welcome-eyebrow">A LITTLE CARE. A LOT OF POSSIBILITY.</span>
      <h2>{page === 'Home' ? <>MyVita<span className="brand-dot">.</span></> : page}</h2>
      <p className="tagline">Your health, understood.</p>
      <div className="welcome-divider"><span/><Heart size={13}/><span/></div>
      <p className="welcome-note">Small steps.<br/><span>Better days.</span></p>
      <div className="space-label"><span className="status-dot"/> YOUR {page === 'Home' ? 'HEALTH' : page.toUpperCase()} JOURNEY <ArrowUpRight size={13}/></div>
    </section>
    <div className="creator"><span>THOUGHTFULLY CREATED BY</span><p>Yashica Singla <span>✦</span></p></div>
  </main>;
}

export function pageHead(page: string) {
  const title = `${page} · MyVita`;
  const description = `MyVita ${page.toLowerCase()} — Your health, understood. A personal health coach by Yashica Singla. Guidance, not medical diagnosis.`;
  return { meta: [{ title }, { name: 'description', content: description }, { property: 'og:title', content: title }, { property: 'og:description', content: description }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary_large_image' }] };
}
