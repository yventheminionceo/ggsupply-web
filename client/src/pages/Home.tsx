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
import { useSiteContent } from "@/hooks/useSiteContent";

const navigation = [
  { id: "home", label: "Home" },
  { id: "news", label: "News" },
  { id: "top-up", label: "Top Up" },
  { id: "coaching", label: "Coaching" },
  { id: "tournaments", label: "Tournaments" },
  { id: "guides", label: "Guides" },
  { id: "community", label: "Community" },
];

const marketIcons = { crosshair: Crosshair, sparkles: Sparkles, flame: Flame, calendar: CalendarDays, gift: ShoppingBag, target: Target };
const coachingIcons = { target: Target, search: Search, users: Users };
const guideIcons = [Zap, Target, Users];

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
  const content = useSiteContent();
  const featuredNews = content.news[0];
  const featuredTournament = content.tournaments[0];
  const topUpProducts = content.market.filter((product) => product.category === "CURRENCY").slice(0, 3);

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
          <div className="hero-art" aria-hidden="true">{content.artwork.homeHeroUrl && <img src={content.artwork.homeHeroUrl} alt="" />}</div>
          <div className="hero-grid-overlay" aria-hidden="true" />
          <div className="hero-content page-wrap">
            <div className="hero-copy">
              <div className="eyebrow"><span className="eyebrow-mark"><CircleDot size={13} /></span> THE GAMING SUPPLY DROP</div>
              <p className="hero-pretitle">{content.settings.tagline}</p>
              <h1>LOAD UP.<br /><span>LOCK IN.</span></h1>
              <p className="hero-description">{content.settings.heroDescription}</p>
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
                  {content.artwork.newsFeatureUrl && <img className="feature-art-image" src={content.artwork.newsFeatureUrl} alt="" />}
                  <div className="feature-art-lines" />
                  <div className="feature-badge"><Newspaper size={15} /> GG NEWSROOM</div>
                  <div className="feature-art-title"><span>STAY</span><strong>IN THE<br />GAME.</strong></div>
                  <div className="feature-art-index">GG—NEWS / 001</div>
                </div>
                <div className="news-feature-copy">
                  <div className="story-meta"><span>{featuredNews?.category ?? "GG NEWSROOM"}</span><span><Clock3 size={13} /> QUICK READS</span></div>
                  <h3>{featuredNews?.title ?? "The newsroom is ready."}</h3>
                  <p>{featuredNews?.summary ?? "Add the first GG SUPPLY news story from the admin panel."}</p>
                  <button className="text-link" onClick={() => setToast("Full article pages can be added when you're ready.")}>Explore the newsroom <ArrowRight size={16} /></button>
                </div>
              </article>
              <div className="news-stack">
                {content.news.slice(1, 3).map((post, index) => {
                  const Icon = index % 2 === 0 ? Zap : Trophy;
                  return <article className={`news-card ${index % 2 === 0 ? "news-card-cyan" : "news-card-violet"}`} key={post.id}>
                    {post.imageUrl && <img className="news-card-image" src={post.imageUrl} alt="" />}
                    <div className="news-card-top"><span>0{index + 1} / {post.category}</span><span className="news-icon"><Icon size={17} /></span></div>
                    <h3>{post.title}</h3><p>{post.summary}</p>
                    <button onClick={() => setToast("Full article pages can be added when you're ready.")} aria-label={`Open ${post.title}`}><ArrowUpRight size={17} /></button>
                  </article>;
                })}
                {content.news.length < 2 && <article className="news-card news-card-violet"><div className="news-card-top"><span>NEWSROOM</span><span className="news-icon"><Newspaper size={17} /></span></div><h3>One more story<br />starts here.</h3><p>Add another news post from the admin panel.</p></article>}
              </div>
            </div>
            <div className="preview-note"><span>GG NEWSROOM</span><i /> News and artwork can be updated from the admin panel.</div>
          </div>
        </section>

        <section className="content-section topup-section" id="top-up">
          <div className="section-wash" aria-hidden="true" />
          <div className="page-wrap">
            <SectionIntro index="02" eyebrow="THE SUPPLY CRATE" title={<>YOUR GAME.<br /><span>YOUR CURRENCY.</span></>} copy="A clear, game-first place to show top-up options. Pick a title to preview its product layout." />
            <div className="topup-toolbar"><div className="toolbar-chip"><ShoppingBag size={15} /> TOP-UP CATALOG <span>PREVIEW</span></div><p>Choose a game to see how its offer card opens.</p></div>
            <div className="game-cards">
              {topUpProducts.map((game, index) => {
                const Icon = marketIcons[game.icon];
                return (
                  <article className={`game-card game-${game.color}`} key={game.id}>
                    <div className="game-card-head"><span className="game-tag">{game.category}</span><span className="game-number">0{index + 1}</span></div>
                    <div className="game-art-symbol"><Icon size={38} strokeWidth={1.35} /></div>
                    <div className="game-card-copy"><h3>{game.game}</h3><p>{game.offer}</p></div>
                    <button className="game-card-action" onClick={() => setSelectedGame(game.game)}>View options <ArrowUpRight size={16} /></button>
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
              {content.coaching.map((option, index) => {
                const Icon = coachingIcons[option.icon];
                return (
                  <article className="coach-card" key={option.id}>
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
            {content.coaches.length > 0 && <div className="coach-profile-grid">{content.coaches.map((coach) => <article className="coach-profile-card" key={coach.id}>{coach.avatarUrl ? <img src={coach.avatarUrl} alt="" /> : <span className="coach-profile-mark"><Users size={21} /></span>}<div><small>{coach.game} / {coach.specialty}</small><h3>{coach.name}</h3><p>{coach.bio}</p><span>{coach.availability || "Availability to be announced"}</span></div></article>)}</div>}
          </div>
        </section>

        <section className="content-section tournament-section" id="tournaments">
          <div className="page-wrap tournament-wrap">
            <div className="tournament-copy">
              <div className="section-index"><span>04</span><i /> THE ARENA</div>
              <h2>PLAY FOR<br /><span>SOMETHING.</span></h2>
              <p>{featuredTournament?.description ?? "A home for GG SUPPLY community tournaments, brackets, match updates, and winner announcements."}</p>
              <a className="button button-accent" href="/tournaments">Explore tournaments <ArrowUpRight size={17} /></a>
            </div>
            <div className="tournament-card">
              <div className="tourney-orbit orbit-one" /><div className="tourney-orbit orbit-two" />
              <div className="tourney-topline"><span><Swords size={15} /> COMMUNITY MATCH</span><span>GG / 04</span></div>
              <div className="versus-mark"><span>GG</span><i>VS</i><span>YOU</span></div>
              <div className="tourney-info"><div><span>FORMAT</span><b>{featuredTournament?.format ?? "BOX TDM"}</b></div><div><span>PLAYER SLOTS</span><b>{featuredTournament?.playerCap ?? 8} PLAYERS</b></div></div>
              <div className="tourney-bottom"><span>BRACKET PREVIEW</span><ArrowUpRight size={16} /></div>
            </div>
          </div>
        </section>

        <section className="content-section guides-section" id="guides">
          <div className="page-wrap">
            <SectionIntro index="05" eyebrow="THE FIELD GUIDE" title={<>KNOW THE<br /><span>GAME PLAN.</span></>} copy="Short reads and practical notes built to help players learn, prepare, and improve." />
            <div className="guide-list">
              {content.guides.map((item, index) => {
                const Icon = guideIcons[index % guideIcons.length];
                return <button className="guide-row" key={item.id} onClick={() => setToast("Guide articles can be added when you're ready.")}><span className="guide-index">{String(index + 1).padStart(2, "0")}</span><span className="guide-icon"><Icon size={19} /></span><span className="guide-text"><small>{item.category}</small><b>{item.title}</b></span><span className="guide-arrow"><ArrowUpRight size={18} /></span></button>;
              })}
            </div>
          </div>
        </section>

        <section className="community-section" id="community">
          <div className="community-mist" aria-hidden="true" />
          <div className="page-wrap community-inner">
            <div className="community-icon"><Users size={25} /></div>
            <div className="community-copy"><span>06 / THE LOBBY</span><h2>GOOD GAMES.<br /><em>GOOD PEOPLE.</em></h2><p>{content.settings.communityMessage}</p></div>
            {content.settings.communityUrl ? <a className="button button-light" href={content.settings.communityUrl} target="_blank" rel="noreferrer">Join the community <ArrowUpRight size={17} /></a> : <button className="button button-light" onClick={() => setToast("Add a community invite link in Site Settings when you're ready.")}>Join the community <ArrowUpRight size={17} /></button>}
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
