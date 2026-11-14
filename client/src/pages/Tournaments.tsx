import { ArrowRight, ArrowUpRight, CalendarDays, Check, Crown, Shield, Swords, Trophy, Users } from "lucide-react";
import { SiteFooter, SiteHeader } from "@/components/GgSiteChrome";

const firstRound = [
  { id: "M1", players: ["PLAYER SLOT 01", "PLAYER SLOT 02"] },
  { id: "M2", players: ["PLAYER SLOT 03", "PLAYER SLOT 04"] },
  { id: "M3", players: ["PLAYER SLOT 05", "PLAYER SLOT 06"] },
  { id: "M4", players: ["PLAYER SLOT 07", "PLAYER SLOT 08"] },
];

export default function Tournaments() {
  return (
    <div className="site-shell">
      <SiteHeader activeSection="tournaments" />
      <main className="tournaments-page">
        <section className="page-hero tournament-page-hero">
          <div className="page-wrap page-hero-inner">
            <div className="page-hero-copy">
              <div className="eyebrow"><span className="eyebrow-mark"><Trophy size={13} /></span> GG SUPPLY / TOURNAMENT DESK</div>
              <p className="hero-pretitle">8 PLAYERS. ONE CHAMPION.</p>
              <h1>TDM BOX.<br /><span>LOCK IN.</span></h1>
              <p className="page-hero-description">The PUBG MOBILE TDM (BOX) tournament layout for GG SUPPLY. Add your player names, schedule, and registration contact when those details are ready.</p>
              <div className="hero-buttons">
                <a className="button button-accent" href="#bracket">View the bracket <ArrowDownIcon /></a>
                <a className="button button-ghost" href="#event-details">Event details <ArrowRight size={16} /></a>
              </div>
              <div className="hero-proofline"><span><Check size={14} /> 8-player bracket</span><i /><span>NO PLAYER NAMES OR SCHEDULE ADDED</span></div>
            </div>
            <aside className="tournament-hero-card">
              <div className="tournament-card-topline"><span><span className="panel-dot" /> PUBG MOBILE</span><span>TDM / BOX</span></div>
              <div className="tournament-hero-mark"><Swords size={38} strokeWidth={1.1} /><span>GG / TDM</span></div>
              <div className="tournament-hero-stat"><small>PLAYER CAP</small><b>08 <span>PLAYERS</span></b></div>
              <div className="tournament-hero-stat"><small>REGISTRATION FEE</small><b>2,000 <span>MMK</span></b></div>
              <div className="tournament-hero-stat champion-stat"><small>CHAMPION PRIZE</small><b>15,000 <span>MMK</span></b></div>
              <div className="tournament-card-foot"><span>EVENT INFO PREVIEW</span><span>GG SUPPLY</span></div>
            </aside>
          </div>
          <div className="page-wrap page-hero-foot"><span>GG / TOURNAMENTS</span><span>PUBG MOBILE TDM (BOX)</span><a href="#bracket">SCROLL TO BRACKET <ArrowRight size={14} /></a></div>
        </section>

        <section className="tournament-event content-section" id="event-details">
          <div className="page-wrap">
            <div className="section-index"><span>01</span><i /> EVENT DETAILS</div>
            <div className="tournament-event-heading"><div><h2>THE NEXT<br /><span>ROUND STARTS HERE.</span></h2><p>Use this page to share the tournament format and prize details without implying a start date or open registration.</p></div><span className="event-status-chip"><CalendarDays size={15} /> SCHEDULE NOT SET</span></div>
            <div className="tournament-facts">
              <article className="tournament-fact"><span className="tournament-fact-icon cyan"><Users size={19} /></span><small>PLAYER CAP</small><b>8 players</b><p>Exactly eight slots in the bracket.</p></article>
              <article className="tournament-fact"><span className="tournament-fact-icon violet"><Shield size={19} /></span><small>REGISTRATION FEE</small><b>2,000 MMK</b><p>Fee shared in the event announcement.</p></article>
              <article className="tournament-fact"><span className="tournament-fact-icon gold"><Crown size={19} /></span><small>CHAMPION PRIZE</small><b>15,000 MMK</b><p>Prize for the tournament champion.</p></article>
            </div>
          </div>
        </section>

        <section className="tournament-bracket-section content-section" id="bracket">
          <div className="page-wrap">
            <div className="section-index"><span>02</span><i /> MATCH FLOW</div>
            <div className="tournament-event-heading"><div><h2>PLAY LEFT<br /><span>TO RIGHT.</span></h2><p>Eight player slots progress from the opening round through semifinals and the grand final.</p></div><div className="bracket-round-count"><span>4</span> MATCHES <i /> <span>2</span> SEMIFINALS <i /> <span>1</span> FINAL</div></div>
            <div className="bracket-scroll">
              <div className="bracket-rail">
                <section className="bracket-column bracket-round-one"><h3>ROUND 1 <small>8 PLAYERS</small></h3><div className="bracket-match-stack">{firstRound.map((match) => <article className="bracket-match" key={match.id}><div className="bracket-match-title">{match.id} <span>ROUND 1</span></div>{match.players.map((player) => <div className="bracket-player" key={player}>{player}<i /></div>)}</article>)}</div></section>
                <section className="bracket-column bracket-semifinals"><h3>SEMIFINALS <small>4 WINNERS</small></h3><div className="bracket-match-stack">{["SF1", "SF2"].map((match, index) => <article className="bracket-match" key={match}><div className="bracket-match-title">{match} <span>SEMI</span></div><div className="bracket-player">WINNER M{index * 2 + 1}<i /></div><div className="bracket-player">WINNER M{index * 2 + 2}<i /></div></article>)}</div></section>
                <section className="bracket-column bracket-final"><h3>GRAND FINAL</h3><div className="bracket-match-stack"><article className="bracket-match final-match"><div className="bracket-match-title">FINAL <span>1 MATCH</span></div><div className="bracket-player">WINNER SF1<i /></div><div className="bracket-player">WINNER SF2<i /></div></article></div></section>
                <section className="bracket-column bracket-champion"><h3>GG <small>ENDGAME</small></h3><article className="bracket-winner-card"><Trophy size={26} /><span>CHAMPION</span><b>TO BE DECIDED</b></article></section>
              </div>
            </div>
            <div className="bracket-note"><span><Check size={15} /></span><p>Player names, match times, and registration status have not been added. Fill the open slots only after the tournament details are confirmed.</p></div>
          </div>
        </section>

        <section className="tournament-join page-wrap" id="registration-details"><div><span>REGISTRATION DETAILS</span><h2>MAKE YOUR<br /><em>MOVE WHEN READY.</em></h2><p>Add the official registration channel and tournament schedule here before entries open.</p></div><div className="tournament-join-flag"><span>STATUS</span><b>NOT SET</b><small>NO CONTACT LINK ADDED</small></div></section>
      </main>
      <SiteFooter />
    </div>
  );
}

function ArrowDownIcon() {
  return <ArrowUpRight size={17} />;
}
