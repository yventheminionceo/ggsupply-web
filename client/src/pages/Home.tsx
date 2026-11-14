import { useEffect, useState, type ReactNode } from "react";
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  CalendarDays,
  Check,
  ChevronRight,
  CircleDot,
  Clock3,
  Crosshair,
  Flame,
  Newspaper,
  Search,
  Shield,
  ShoppingBag,
  Sparkles,
  Swords,
  Target,
  Trophy,
  Users,
  X,
  Zap,
} from "lucide-react";
import { SiteFooter, SiteHeader } from "@/components/GgSiteChrome";

const navigation = [
  { id: "home", label: "Home" },
  { id: "news", label: "News" },
  { id: "top-up", label: "Top Up" },
  { id: "coaching", label: "Coaching" },
  { id: "tournaments", label: "Tournaments" },
  { id: "guides", label: "Guides" },
  { id: "community", label: "Community" },
];

const topUpGames = [
  { name: "PUBG MOBILE", product: "UC top-up", tag: "BATTLE ROYALE", icon: Crosshair, color: "cyan" },
  { name: "MOBILE LEGENDS", product: "Diamond top-up", tag: "MOBA", icon: Sparkles, color: "violet" },
  { name: "FREE FIRE", product: "Diamond top-up", tag: "BATTLE ROYALE", icon: Flame, color: "coral" },
];

const coachingOptions = [
  { name: "1:1 SESSION", label: "Personal coaching", description: "A focused plan shaped around your game and goals.", icon: Target, note: "SOLO QUEUE", game: "Choose game", specialty: "Rank & mechanics", availability: "Add open slots" },
  { name: "REPLAY REVIEW", label: "See the turning point", description: "Review key decisions and take away clear next steps.", icon: Search, note: "VOD BREAKDOWN", game: "Choose game", specialty: "Replay analysis", availability: "Set review times" },
  { name: "SQUAD PRACTICE", label: "Move as one", description: "Build stronger calls, roles, and team habits together.", icon: Users, note: "TEAM PLAY", game: "Choose game", specialty: "Comms & roles", availability: "Add team slots" },
];

const guideItems = [
  { index: "01", category: "START HERE", title: "Build your warm-up routine", icon: Zap },
  { index: "02", category: "GET SMARTER", title: "Make every match count", icon: Target },
  { index: "03", category: "PLAY TOGETHER", title: "Communicate like a squad", icon: Users },
];

function SectionIntro({ eyebrow, title, copy, index }: { eyebrow: string; title: ReactNode; copy: string; index: string }) {
  return (
    <div className="section-intro">
      <div className="section-index"><span>{index}</span><i />{eyebrow}</div>
      <div className="section-heading-row">
        <h2>{title}</h2>
        <p>{copy}</p>
      </div>
    </div>
  );
}

export default function Home() {
  const [activeId, setActiveId] = useState("home");
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const [toast, setToast] = useState("");

  useEffect(() => {
    const sections = navigation.map(({ id }) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActiveId(visible.target.id);
      },
      { rootMargin: "-28% 0px -62% 0px", threshold: [0, 0.12, 0.35] },
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 3200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    if (!selectedGame) return;
    const onKeyDown = (event: KeyboardEvent) => event.key === "Escape" && setSelectedGame(null);
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selectedGame]);

  const goTo = (id: string) => {
    setActiveId(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="site-shell">
      <SiteHeader activeSection={activeId} />

      <main>
        <section className="hero" id="home">
          <div className="hero-art" aria-hidden="true" />
          <div className="hero-grid-overlay" aria-hidden="true" />
          <div className="hero-content page-wrap">
            <div className="hero-copy">
              <div className="eyebrow"><span className="eyebrow-mark"><CircleDot size={13} /></span> THE GAMING SUPPLY DROP</div>
              <p className="hero-pretitle">GAME SMART. PLAY HARD.</p>
              <h1>LOAD UP.<br /><span>LOCK IN.</span></h1>
              <p className="hero-description">Gaming news, in-game top-ups, and coaching—your next move starts with GG SUPPLY.</p>
              <div className="hero-buttons">
                <button className="button button-accent" onClick={() => goTo("top-up")}>Explore top ups <ArrowUpRight size={17} /></button>
                <button className="button button-ghost" onClick={() => goTo("news")}>Latest news <ArrowDownRight size={17} /></button>
              </div>
              <div className="hero-proofline"><span><Check size={14} /> Built for players</span><i /><span>NEWS <b>·</b> TOP UPS <b>·</b> COACHING</span></div>
            </div>
            <aside className="hero-panel" aria-label="GG Supply categories">
              <div className="panel-top"><span><span className="panel-dot" /> GG / PLAYER HUB</span><span>01—04</span></div>
              <div className="panel-title">ONE PLACE.<br /><em>MORE PLAY.</em></div>
              <div className="panel-items">
                <button onClick={() => goTo("news")}><span className="panel-icon cyan"><Newspaper size={17} /></span><span><b>News</b><small>Stay in the know</small></span><ChevronRight size={16} /></button>
                <button onClick={() => goTo("top-up")}><span className="panel-icon coral"><ShoppingBag size={17} /></span><span><b>Top Up</b><small>Browse game currency</small></span><ChevronRight size={16} /></button>
                <button onClick={() => goTo("coaching")}><span className="panel-icon violet"><Target size={17} /></span><span><b>Coaching</b><small>Make your next move</small></span><ChevronRight size={16} /></button>
              </div>
              <div className="panel-bottom"><span>READY WHEN YOU ARE</span><Sparkles size={15} /></div>
            </aside>
          </div>
          <div className="hero-foot page-wrap"><span>GGS / 001</span><span>THE PLACE FOR YOUR NEXT PLAY</span><a href="#news" onClick={(event) => { event.preventDefault(); goTo("news"); }}>SCROLL TO EXPLORE <ArrowDownRight size={14} /></a></div>
        </section>

        <div className="category-ribbon" aria-label="Browse categories">
          <div className="ribbon-label"><span className="live-dot" /> PICK YOUR LANE</div>
          {navigation.slice(1).map((item, index) => (
            <a key={item.id} href={`#${item.id}`} onClick={(event) => { event.preventDefault(); goTo(item.id); }}><span>0{index + 1}</span>{item.label}<ArrowUpRight size={14} /></a>
          ))}
        </div>

        <section className="content-section news-section" id="news">
          <div className="page-wrap">
            <SectionIntro index="01" eyebrow="THE SIGNAL" title={<>LATEST<br /><span>INTEL.</span></>} copy="Game updates, tournament moments, and the stories players are talking about." />
            <div className="news-layout">
              <article className="news-feature">
                <div className="feature-art feature-art-main">
                  <div className="feature-art-lines" />
                  <div className="feature-badge"><Newspaper size={15} /> GG NEWSROOM</div>
                  <div className="feature-art-title"><span>STAY</span><strong>IN THE<br />GAME.</strong></div>
                  <div className="feature-art-index">GG—NEWS / 001</div>
                </div>
                <div className="news-feature-copy">
                  <div className="story-meta"><span>THE LATEST DROP</span><span><Clock3 size={13} /> QUICK READS</span></div>
                  <h3>Game news, without the noise.</h3>
                  <p>A home for esports results, update roundups, and community stories.</p>
                  <button className="text-link" onClick={() => setToast("News cards are a layout preview. Add your stories to make this section live.")}>Explore the newsroom <ArrowRight size={16} /></button>
                </div>
              </article>
              <div className="news-stack">
                <article className="news-card news-card-cyan">
                  <div className="news-card-top"><span>01 / GAME UPDATE</span><span className="news-icon"><Zap size={17} /></span></div>
                  <h3>Patch notes,<br />made player-ready.</h3>
                  <p>Clear recaps for your next session.</p>
                  <button onClick={() => setToast("This sample story card is ready for your first news post.")} aria-label="Preview the patch notes story"><ArrowUpRight size={17} /></button>
                </article>
                <article className="news-card news-card-violet">
                  <div className="news-card-top"><span>02 / COMPETITIVE</span><span className="news-icon"><Trophy size={17} /></span></div>
                  <h3>Big moments.<br />Bigger plays.</h3>
                  <p>Tournament stories from the scene.</p>
                  <button onClick={() => goTo("tournaments")} aria-label="Go to tournaments"><ArrowUpRight size={17} /></button>
                </article>
              </div>
            </div>
            <div className="preview-note"><span>SAMPLE LAYOUT</span><i /> Replace these preview cards with your published GG SUPPLY stories.</div>
          </div>
        </section>

        <section className="content-section topup-section" id="top-up">
          <div className="section-wash" aria-hidden="true" />
          <div className="page-wrap">
            <SectionIntro index="02" eyebrow="THE SUPPLY CRATE" title={<>YOUR GAME.<br /><span>YOUR CURRENCY.</span></>} copy="A clear, game-first place to show top-up options. Pick a title to preview its product layout." />
            <div className="topup-toolbar"><div className="toolbar-chip"><ShoppingBag size={15} /> TOP-UP CATALOG <span>PREVIEW</span></div><p>Choose a game to see how its offer card opens.</p></div>
            <div className="game-cards">
              {topUpGames.map((game, index) => {
                const Icon = game.icon;
                return (
                  <article className={`game-card game-${game.color}`} key={game.name}>
                    <div className="game-card-head"><span className="game-tag">{game.tag}</span><span className="game-number">0{index + 1}</span></div>
                    <div className="game-art-symbol"><Icon size={38} strokeWidth={1.35} /></div>
                    <div className="game-card-copy"><h3>{game.name}</h3><p>{game.product}</p></div>
                    <button className="game-card-action" onClick={() => setSelectedGame(game.name)}>View options <ArrowUpRight size={16} /></button>
                  </article>
                );
              })}
              <article className="game-card game-more">
                <div className="more-symbol"><Sparkles size={31} /></div>
                <span className="game-tag">MORE GAMES</span>
                <h3>Your main game<br />could be next.</h3>
                <button className="game-card-action" onClick={() => setToast("Tell GG SUPPLY which game you want to see in the catalog.")}>Request a game <ArrowRight size={16} /></button>
              </article>
            </div>
            <div className="catalog-footnote"><Shield size={16} /><span>Layout concept only — connect your real product list and checkout when you're ready.</span><span className="footnote-signal">GG / 02</span></div>
          </div>
        </section>

        <section className="content-section coaching-section" id="coaching">
          <div className="page-wrap">
            <SectionIntro index="03" eyebrow="THE TRAINING ROOM" title={<>PLAY WITH<br /><span>INTENTION.</span></>} copy="Give players a clear path to find focused practice, honest feedback, and stronger team play." />
            <div className="coaching-grid">
              {coachingOptions.map((option, index) => {
                const Icon = option.icon;
                return (
                  <article className="coach-card" key={option.name}>
                    <div className="coach-card-top"><span className="coach-count">0{index + 1}</span><span className="coach-icon"><Icon size={20} /></span></div>
                    <span className="coach-note">{option.note}</span>
                    <h3>{option.label}</h3>
                    <p>{option.description}</p>
                    <div className="coach-details">
                      <div><span>GAME</span><b>{option.game}</b></div>
                      <div><span>SPECIALTY</span><b>{option.specialty}</b></div>
                      <div><span>AVAILABILITY</span><b>{option.availability}</b></div>
                    </div>
                    <button className="coach-link" onClick={() => setToast("Coaching cards are a layout preview. Add coach profiles and session details when ready.")}>Explore coaching <ArrowUpRight size={16} /></button>
                  </article>
                );
              })}
            </div>
            <div className="coach-banner"><div className="coach-banner-icon"><Crosshair size={22} /></div><div><span>COACHING, YOUR WAY</span><p>Add your games, coaches, specialties, and available slots here.</p></div><button onClick={() => setToast("Your coach profiles can be added to this section next.")}>Set up coaching <ArrowRight size={16} /></button></div>
          </div>
        </section>

        <section className="content-section tournament-section" id="tournaments">
          <div className="page-wrap tournament-wrap">
            <div className="tournament-copy">
              <div className="section-index"><span>04</span><i /> THE ARENA</div>
              <h2>PLAY FOR<br /><span>SOMETHING.</span></h2>
              <p>A home for GG SUPPLY community tournaments, brackets, match updates, and winner announcements.</p>
              <button className="button button-accent" onClick={() => setToast("Tournament information can be posted here when registration is open.")}>Explore tournaments <ArrowUpRight size={17} /></button>
            </div>
            <div className="tournament-card">
              <div className="tourney-orbit orbit-one" /><div className="tourney-orbit orbit-two" />
              <div className="tourney-topline"><span><Swords size={15} /> COMMUNITY MATCH</span><span>GG / 04</span></div>
              <div className="versus-mark"><span>GG</span><i>VS</i><span>YOU</span></div>
              <div className="tourney-info"><div><span>FORMAT</span><b>BOX TDM</b></div><div><span>PLAYER SLOTS</span><b>8 PLAYERS</b></div></div>
              <div className="tourney-bottom"><span>BRACKET PREVIEW</span><ArrowUpRight size={16} /></div>
            </div>
          </div>
        </section>

        <section className="content-section guides-section" id="guides">
          <div className="page-wrap">
            <SectionIntro index="05" eyebrow="THE FIELD GUIDE" title={<>KNOW THE<br /><span>GAME PLAN.</span></>} copy="Short reads and practical notes built to help players learn, prepare, and improve." />
            <div className="guide-list">
              {guideItems.map((item) => {
                const Icon = item.icon;
                return <button className="guide-row" key={item.index} onClick={() => setToast("This guide is a sample card. Add your own player tips and walkthroughs.")}><span className="guide-index">{item.index}</span><span className="guide-icon"><Icon size={19} /></span><span className="guide-text"><small>{item.category}</small><b>{item.title}</b></span><span className="guide-arrow"><ArrowUpRight size={18} /></span></button>;
              })}
            </div>
          </div>
        </section>

        <section className="community-section" id="community">
          <div className="community-mist" aria-hidden="true" />
          <div className="page-wrap community-inner">
            <div className="community-icon"><Users size={25} /></div>
            <div className="community-copy"><span>06 / THE LOBBY</span><h2>GOOD GAMES.<br /><em>GOOD PEOPLE.</em></h2><p>Make room for your community links, announcements, and player highlights.</p></div>
            <button className="button button-light" onClick={() => setToast("Add your community invite link here when you're ready.")}>Join the community <ArrowUpRight size={17} /></button>
            <div className="community-orbit" aria-hidden="true"><div /><div /><div /></div>
          </div>
        </section>

        <SiteFooter />
      </main>

      {selectedGame && (
        <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedGame(null); }}>
          <section className="product-modal" role="dialog" aria-modal="true" aria-labelledby="product-modal-title">
            <button className="modal-close" onClick={() => setSelectedGame(null)} aria-label="Close product preview"><X size={20} /></button>
            <span className="modal-kicker"><ShoppingBag size={14} /> CATALOG LAYOUT PREVIEW</span>
            <h2 id="product-modal-title">{selectedGame}</h2>
            <p>This is where the live product packs, region notes, delivery details, and checkout button can go.</p>
            <div className="pack-options" aria-label="Sample top-up options">
              {["STARTER PACK", "POPULAR PACK", "BIG DROP"].map((pack, index) => <button key={pack} onClick={() => setToast("Sample pack only — add your real amount and price before enabling checkout.")}><span><i>0{index + 1}</i><b>{pack}</b></span><small>Set amount &amp; price</small><ArrowUpRight size={15} /></button>)}
            </div>
            <p className="modal-note">Preview only — add real pack details and availability before checkout.</p>
            <button className="button button-accent modal-done" onClick={() => setSelectedGame(null)}>Got it <Check size={16} /></button>
          </section>
        </div>
      )}
      {toast && <div className="preview-toast" role="status"><Sparkles size={16} />{toast}<button onClick={() => setToast("")} aria-label="Dismiss"><X size={16} /></button></div>}
    </div>
  );
}
