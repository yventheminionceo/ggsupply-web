import { useState } from "react";
import { ArrowUpRight, Menu, ShoppingBag, X } from "lucide-react";
import { Link, useLocation } from "wouter";

const navItems = [
  { id: "home", label: "Home", href: "/#home", section: "home" },
  { id: "news", label: "News", href: "/#news", section: "news" },
  { id: "top-up", label: "Top Up", href: "/#top-up", section: "top-up" },
  { id: "market", label: "Gaming Market", href: "/market", route: true },
  { id: "coaching", label: "Coaching", href: "/#coaching", section: "coaching" },
  { id: "tournaments", label: "Tournaments", href: "/tournaments", route: true },
  { id: "guides", label: "Guides", href: "/#guides", section: "guides" },
  { id: "community", label: "Community", href: "/#community", section: "community" },
] as const;

export function Brand() {
  return (
    <Link className="brand-lockup" href="/" aria-label="GG SUPPLY home">
      <span className="brand-glyph" aria-hidden="true"><span>G</span><span>G</span></span>
      <span className="brand-words">GG <b>SUPPLY</b><small>GAME SMART. PLAY HARD.</small></span>
    </Link>
  );
}

export function SiteHeader({ activeSection = "home" }: { activeSection?: string }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [location] = useLocation();
  const currentPath = location.split("?")[0].split("#")[0] || "/";
  const isHome = currentPath === "/";

  return (
    <>
      <div className="announcement-bar">
        <div className="announcement-inner">
          <span className="announce-left"><span className="live-dot" /> YOUR NEXT LEVEL STARTS HERE</span>
          <span className="announce-right">GG SUPPLY <i /> GAME SMART. PLAY HARD.</span>
        </div>
      </div>
      <header className="site-header">
        <div className="header-inner">
          <Brand />
          <button className="mobile-menu-button" onClick={() => setMobileOpen((open) => !open)} aria-label={mobileOpen ? "Close navigation" : "Open navigation"} aria-expanded={mobileOpen}>
            {mobileOpen ? <X size={21} /> : <Menu size={21} />}
          </button>
          <nav className={`primary-nav${mobileOpen ? " is-open" : ""}`} aria-label="Main categories">
            {navItems.map((item) => {
              const active = "route" in item ? currentPath === item.href : isHome && activeSection === item.section;
              const className = active ? "nav-link active" : "nav-link";
              if ("route" in item) {
                return <Link key={item.id} className={className} href={item.href} aria-current={active ? "page" : undefined} onClick={() => setMobileOpen(false)}>{item.label}</Link>;
              }
              return (
                <a key={item.id} className={className} href={item.href} aria-current={active ? "page" : undefined} onClick={(event) => {
                  setMobileOpen(false);
                  if (isHome) {
                    event.preventDefault();
                    document.getElementById(item.section)?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }
                }}>{item.label}</a>
              );
            })}
          </nav>
          <div className="header-actions">
            <Link className="topup-header-button" href="/market" onClick={() => setMobileOpen(false)}>
              <ShoppingBag size={15} strokeWidth={2.2} /> <span>Open Market</span><ArrowUpRight size={15} />
            </Link>
          </div>
        </div>
      </header>
    </>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="page-wrap footer-main">
        <Brand />
        <p>Game smart.<br /><span>Play hard.</span></p>
        <div className="footer-links">
          <span>EXPLORE GG SUPPLY</span>
          <div>
            <a href="/#news">News</a><a href="/market">Gaming Market</a><a href="/#coaching">Coaching</a><a href="/tournaments">Tournaments</a>
          </div>
        </div>
        <a className="back-top" href="/#home" aria-label="Back to top"><ArrowUpRight size={18} /></a>
      </div>
      <div className="footer-bottom page-wrap">
        <span>© GG SUPPLY — GAME SMART. PLAY HARD.</span><span>GAMING MARKET &amp; COMMUNITY</span><span>BUILT FOR PLAYERS</span>
      </div>
    </footer>
  );
}
