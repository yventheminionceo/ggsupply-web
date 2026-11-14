import { ArrowDownRight, ArrowRight, ArrowUpRight, CalendarDays, Check, Crown, Shield, Swords, Trophy, Users } from "lucide-react";
import { SiteFooter, SiteHeader } from "@/components/GgSiteChrome";
import { useSiteContent } from "@/hooks/useSiteContent";
import type { TournamentPost } from "../../../shared/siteContent";

interface BracketRound { title: string; playerCount: number; matchCount: number; index: number }

function makeRounds(playerCap: number): BracketRound[] {
  const safeCap = [2, 4, 8, 16, 32, 64, 128].includes(playerCap) ? playerCap : 8;
  const rounds: BracketRound[] = [];
  let remaining = safeCap;
  while (remaining >= 2) {
    let title = `ROUND OF ${remaining}`;
    if (remaining === 2) title = "GRAND FINAL";
    else if (remaining === 4) title = "SEMIFINALS";
    else if (remaining === 8) title = safeCap === 8 ? "ROUND 1" : "QUARTERFINALS";
    else if (remaining === safeCap) title = "ROUND 1";
    rounds.push({ title, playerCount: remaining, matchCount: remaining / 2, index: rounds.length });
    remaining /= 2;
  }
  return rounds;
}

function formatMmk(amount: number): string {
  return `${amount.toLocaleString("en-US")} MMK`;
}

function MatchCard({ round, matchIndex }: { round: BracketRound; matchIndex: number }) {
  const matchCode = round.playerCount === 2 ? "F" : round.playerCount === 4 ? `SF${matchIndex + 1}` : round.playerCount === 8 && round.index > 0 ? `QF${matchIndex + 1}` : `M${String(matchIndex + 1).padStart(2, "0")}`;
  const sourceRound = round.index - 1;
  const firstSourceIndex = matchIndex * 2;
  const firstSlot = round.index === 0 ? firstSourceIndex + 1 : firstSourceIndex + 1;
  const secondSlot = firstSlot + 1;
  const playerLabel = (slot: number) => round.index === 0 ? `PLAYER SLOT ${String(slot).padStart(2, "0")}` : `WINNER R${sourceRound + 1} M${String(slot).padStart(2, "0")}`;
  return (
    <article className="bracket-match" key={`${round.index}-${matchIndex}`}>
      <div className="bracket-match-title"><span>{matchCode}</span><small>{round.title}</small></div>
      <div className="bracket-player">{playerLabel(firstSlot)}<i /></div>
      <div className="bracket-player">{playerLabel(secondSlot)}<i /></div>
    </article>
  );
}

function FeaturedEvent({ event, globalPoster }: { event: TournamentPost; globalPoster: string }) {
  const rounds = makeRounds(event.playerCap);
  const poster = event.posterUrl || globalPoster;
  const gridWidth = `${Math.max(960, rounds.length * 205 + 180)}px`;
  return (
    <>
      <section className="tournament-event content-section" id="event-details">
        <div className="page-wrap">
          <div className="section-index"><span>01</span><i /> EVENT DETAILS</div>
          <div className="tournament-event-heading"><div><h2>{event.title.toUpperCase().split(" ").slice(0, 2).join(" ")}<br /><span>{event.title.toUpperCase().split(" ").slice(2).join(" ") || event.format.toUpperCase()}</span></h2><p>{event.description}</p></div><span className="event-status-chip"><CalendarDays size={15} /> {event.status || "DETAILS PREVIEW"}</span></div>
          <div className="tournament-facts">
            <article className="tournament-fact"><span className="tournament-fact-icon cyan"><Users size={19} /></span><small>PLAYER CAP</small><b>{event.playerCap} players</b><p>Slots are ready for names when registration is confirmed.</p></article>
            <article className="tournament-fact"><span className="tournament-fact-icon violet"><Shield size={19} /></span><small>REGISTRATION FEE</small><b>{formatMmk(event.registrationFeeMmk)}</b><p>Entry details are shared by the organizer.</p></article>
            <article className="tournament-fact"><span className="tournament-fact-icon gold"><Crown size={19} /></span><small>CHAMPION PRIZE</small><b>{formatMmk(event.championPrizeMmk)}</b><p>Prize shown as provided by GG SUPPLY.</p></article>
          </div>
        </div>
      </section>

      <section className="tournament-bracket-section content-section" id="bracket">
        <div className="page-wrap">
          <div className="section-index"><span>02</span><i /> MATCH FLOW</div>
          <div className="tournament-event-heading"><div><h2>PLAY LEFT<br /><span>TO RIGHT.</span></h2><p>{event.playerCap} open slots progress through each elimination round to one final winner.</p></div><div className="bracket-round-count">{rounds.map((round, index) => <span key={round.index}><b>{round.matchCount}</b> {round.title}{index < rounds.length - 1 && <i />}</span>)}</div></div>
          <div className="bracket-scroll">
            <div className="bracket-rail bracket-rail-dynamic" style={{ gridTemplateColumns: `repeat(${rounds.length}, minmax(170px, 1fr)) minmax(145px, .78fr)`, minWidth: gridWidth }}>
              {rounds.map((round) => <section className={`bracket-column ${round.playerCount === 4 ? "bracket-semifinals" : round.playerCount === 2 ? "bracket-final" : "bracket-round-one"}`} key={round.index}>
                <h3>{round.title}<small>{round.playerCount} PLAYERS</small></h3>
              <div className="bracket-match-stack">{Array.from({ length: round.matchCount }, (_, matchIndex) => <MatchCard key={`${round.index}-${matchIndex}`} round={round} matchIndex={matchIndex} />)}</div>
              </section>)}
              <section className="bracket-column bracket-champion"><h3>GG <small>ENDGAME</small></h3><article className="bracket-winner-card"><Trophy size={26} /><span>CHAMPION</span><b>TO BE DECIDED</b></article></section>
            </div>
          </div>
          <div className="bracket-note"><span><Check size={15} /></span><p>Player names, match times, and registration status have not been added. Fill the open slots only after tournament details are confirmed.</p></div>
        </div>
      </section>
    </>
  );
}

export default function Tournaments() {
  const content = useSiteContent();
  const event = content.tournaments[0];
  const posterUrl = event?.posterUrl || content.artwork.tournamentPosterUrl;
  const futureEvents = content.tournaments.slice(1);

  return (
    <div className="site-shell">
      <SiteHeader activeSection="tournaments" />
      <main className="tournaments-page">
        <section className="page-hero tournament-page-hero">
          <div className="page-wrap page-hero-inner">
            <div className="page-hero-copy">
              <div className="eyebrow"><span className="eyebrow-mark"><Trophy size={13} /></span> GG SUPPLY / TOURNAMENT DESK</div>
              <p className="hero-pretitle">{event ? `${event.game} / ${event.status}` : "GG SUPPLY COMMUNITY ARENA"}</p>
              <h1>{event?.format ?? "COMMUNITY"}.<br /><span>LOCK IN.</span></h1>
              <p className="page-hero-description">{event?.description ?? "Tournament announcements, match formats, and event details will appear here when GG SUPPLY publishes them."}</p>
              <div className="hero-buttons">
                {event ? <a className="button button-accent" href="#bracket">View the bracket <ArrowDownRight size={17} /></a> : <a className="button button-accent" href="/market">Browse the market <ArrowUpRight size={17} /></a>}
                <a className="button button-ghost" href="#event-details">Event details <ArrowRight size={16} /></a>
              </div>
              <div className="hero-proofline"><span><Check size={14} /> {event ? `${event.playerCap}-player bracket` : "GG SUPPLY community"}</span><i /><span>{event?.scheduleLabel ?? "NO SCHEDULE SET"}</span></div>
            </div>
            <aside className="tournament-hero-card">
              {posterUrl && <img className="tournament-hero-poster" src={posterUrl} alt="" />}
              <div className="tournament-card-topline"><span><span className="panel-dot" /> {event?.game ?? "TOURNAMENTS"}</span><span>{event?.format ?? "GG / ARENA"}</span></div>
              <div className="tournament-hero-mark"><Swords size={38} strokeWidth={1.1} /><span>{event?.title ?? "GG / EVENTS"}</span></div>
              <div className="tournament-hero-stat"><small>PLAYER CAP</small><b>{String(event?.playerCap ?? 0).padStart(2, "0")} <span>PLAYERS</span></b></div>
              <div className="tournament-hero-stat"><small>REGISTRATION FEE</small><b>{event ? event.registrationFeeMmk.toLocaleString("en-US") : "—"} <span>MMK</span></b></div>
              <div className="tournament-hero-stat champion-stat"><small>CHAMPION PRIZE</small><b>{event ? event.championPrizeMmk.toLocaleString("en-US") : "—"} <span>MMK</span></b></div>
              <div className="tournament-card-foot"><span>{event?.status ?? "NO EVENT POSTED"}</span><span>GG SUPPLY</span></div>
            </aside>
          </div>
          <div className="page-wrap page-hero-foot"><span>GG / TOURNAMENTS</span><span>{event?.game ?? "COMMUNITY EVENTS"}</span><a href={event ? "#bracket" : "#event-details"}>SCROLL TO DETAILS <ArrowRight size={14} /></a></div>
        </section>

        {event ? <FeaturedEvent event={event} globalPoster={content.artwork.tournamentPosterUrl} /> : <section className="tournament-event content-section" id="event-details"><div className="page-wrap"><div className="section-index"><span>01</span><i /> EVENT DETAILS</div><div className="tournament-empty"><Trophy size={30} /><h2>NO TOURNAMENT POSTED YET.</h2><p>When GG SUPPLY adds a tournament in the admin panel, its details and bracket will appear here.</p></div></div></section>}

        {futureEvents.length > 0 && <section className="tournament-list-section content-section"><div className="page-wrap"><div className="section-index"><span>03</span><i /> MORE FROM THE TOURNAMENT DESK</div><div className="tournament-list-grid">{futureEvents.map((item) => <article className="tournament-list-card" key={item.id}>{item.posterUrl && <img src={item.posterUrl} alt="" />}<span>{item.game} / {item.status}</span><h3>{item.title}</h3><p>{item.description}</p><div><b>{item.playerCap} players</b><b>{formatMmk(item.championPrizeMmk)} prize</b></div></article>)}</div></div></section>}

        <section className="tournament-join page-wrap" id="registration-details"><div><span>REGISTRATION DETAILS</span><h2>MAKE YOUR<br /><em>MOVE WHEN READY.</em></h2><p>{event?.scheduleLabel ?? "Add the official schedule and registration contact before entries open."} Registration is not processed on this page.</p></div><div className="tournament-join-flag"><span>STATUS</span><b>{event?.status ?? "NOT SET"}</b><small>{event?.scheduleLabel ?? "NO CONTACT LINK ADDED"}</small></div></section>
      </main>
      <SiteFooter />
    </div>
  );
}
