export interface NewsPost {
  id: string;
  category: string;
  title: string;
  summary: string;
  imageUrl: string;
}

export interface ArtworkSettings {
  homeHeroUrl: string;
  newsFeatureUrl: string;
  tournamentPosterUrl: string;
}

export interface MarketProduct {
  id: string;
  game: string;
  offer: string;
  category: string;
  detail: string;
  note: string;
  priceLabel: string;
  color: "cyan" | "violet" | "coral";
  icon: "crosshair" | "sparkles" | "flame" | "calendar" | "gift" | "target";
}

export interface TournamentPost {
  id: string;
  game: string;
  title: string;
  format: string;
  description: string;
  scheduleLabel: string;
  status: string;
  playerCap: number;
  registrationFeeMmk: number;
  championPrizeMmk: number;
  posterUrl: string;
}

export interface CoachingOption {
  id: string;
  name: string;
  label: string;
  description: string;
  note: string;
  game: string;
  specialty: string;
  availability: string;
  icon: "target" | "search" | "users";
}

export interface CoachProfile {
  id: string;
  name: string;
  game: string;
  specialty: string;
  availability: string;
  bio: string;
  avatarUrl: string;
}

export interface GuideItem {
  id: string;
  category: string;
  title: string;
}

export interface SiteSettings {
  tagline: string;
  heroDescription: string;
  communityMessage: string;
  communityUrl: string;
}

export interface SiteContent {
  settings: SiteSettings;
  news: NewsPost[];
  artwork: ArtworkSettings;
  market: MarketProduct[];
  tournaments: TournamentPost[];
  coaching: CoachingOption[];
  coaches: CoachProfile[];
  guides: GuideItem[];
}

export const editableSections = ["settings", "news", "artwork", "market", "tournaments", "coaching", "coaches", "guides"] as const;
export type EditableSection = (typeof editableSections)[number];

export const defaultSiteContent: SiteContent = {
  settings: {
    tagline: "GAME SMART. PLAY HARD.",
    heroDescription: "Gaming news, in-game top-ups, and coaching—your next move starts with GG SUPPLY.",
    communityMessage: "Make room for your community links, announcements, and player highlights.",
    communityUrl: "",
  },
  news: [
    {
      id: "signal-update-01",
      category: "GAME UPDATE",
      title: "Patch notes, made player-ready.",
      summary: "Clear recaps for your next session.",
      imageUrl: "",
    },
    {
      id: "signal-competitive-01",
      category: "COMPETITIVE",
      title: "Big moments. Bigger plays.",
      summary: "Tournament stories from the scene.",
      imageUrl: "",
    },
  ],
  artwork: {
    homeHeroUrl: "/manus-storage/async-images/4tJZX2VMoKgypiaL8rGSuo/image-1.webp",
    newsFeatureUrl: "",
    tournamentPosterUrl: "",
  },
  market: [
    { id: "pubg-uc", game: "PUBG MOBILE", offer: "UC TOP-UP", category: "CURRENCY", detail: "Choose a UC pack, then add the region and player instructions for your catalog.", note: "PACK OPTIONS TO ADD", priceLabel: "TO ADD", color: "cyan", icon: "crosshair" },
    { id: "mlbb-diamonds", game: "MOBILE LEGENDS", offer: "DIAMOND TOP-UP", category: "CURRENCY", detail: "Add available diamond packs, region notes, and delivery details here.", note: "PACK OPTIONS TO ADD", priceLabel: "TO ADD", color: "violet", icon: "sparkles" },
    { id: "freefire-diamonds", game: "FREE FIRE", offer: "DIAMOND TOP-UP", category: "CURRENCY", detail: "Set the supported options, player instructions, and delivery details before listing.", note: "PACK OPTIONS TO ADD", priceLabel: "TO ADD", color: "coral", icon: "flame" },
    { id: "weekly-pass", game: "MOBILE LEGENDS", offer: "WEEKLY PASS", category: "PASSES", detail: "Add pass availability, price, region, and delivery notes when ready.", note: "PRICE & AVAILABILITY TO ADD", priceLabel: "TO ADD", color: "cyan", icon: "calendar" },
    { id: "gift-card", game: "DIGITAL GAME CARDS", offer: "GIFT CARD", category: "GIFT CARDS", detail: "Choose the supported game, region, denomination, and delivery method for this listing.", note: "REGION & DENOMINATION TO ADD", priceLabel: "TO ADD", color: "violet", icon: "gift" },
    { id: "coaching", game: "GG SUPPLY COACHING", offer: "1:1 SESSION", category: "COACHING", detail: "Add the game, coach profile, specialty, session details, and available slots.", note: "COACH & SESSION TO ADD", priceLabel: "TO ADD", color: "coral", icon: "target" },
  ],
  tournaments: [
    {
      id: "pubg-tdm-box-season-1",
      game: "PUBG MOBILE",
      title: "TDM BOX TOURNAMENT",
      format: "TDM (BOX)",
      description: "GG SUPPLY's PUBG MOBILE TDM (BOX) tournament layout. Add the schedule and official registration contact when those details are ready.",
      scheduleLabel: "SCHEDULE NOT SET",
      status: "DETAILS PREVIEW",
      playerCap: 8,
      registrationFeeMmk: 2000,
      championPrizeMmk: 15000,
      posterUrl: "",
    },
  ],
  coaching: [
    { id: "coach-1to1", name: "1:1 SESSION", label: "Personal coaching", description: "A focused plan shaped around your game and goals.", note: "SOLO QUEUE", game: "Choose game", specialty: "Rank & mechanics", availability: "Add open slots", icon: "target" },
    { id: "coach-review", name: "REPLAY REVIEW", label: "See the turning point", description: "Review key decisions and take away clear next steps.", note: "VOD BREAKDOWN", game: "Choose game", specialty: "Replay analysis", availability: "Set review times", icon: "search" },
    { id: "coach-squad", name: "SQUAD PRACTICE", label: "Move as one", description: "Build stronger calls, roles, and team habits together.", note: "TEAM PLAY", game: "Choose game", specialty: "Comms & roles", availability: "Add team slots", icon: "users" },
  ],
  coaches: [],
  guides: [
    { id: "guide-1", category: "START HERE", title: "Build your warm-up routine" },
    { id: "guide-2", category: "GET SMARTER", title: "Make every match count" },
    { id: "guide-3", category: "PLAY TOGETHER", title: "Communicate like a squad" },
  ],
};
