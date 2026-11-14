import { createContext, useCallback, useContext, useEffect, useState, type PropsWithChildren } from "react";
import { defaultSiteContent, type SiteContent } from "../../../shared/siteContent";

interface SiteContentContextValue {
  content: SiteContent;
  setContent: (content: unknown) => void;
  refreshContent: () => Promise<void>;
}

function mergeContent(value: unknown): SiteContent {
  if (!value || typeof value !== "object") return defaultSiteContent;
  const candidate = value as Partial<SiteContent>;
  return {
    settings: { ...defaultSiteContent.settings, ...(candidate.settings ?? {}) },
    artwork: { ...defaultSiteContent.artwork, ...(candidate.artwork ?? {}) },
    news: Array.isArray(candidate.news) ? candidate.news : defaultSiteContent.news,
    market: Array.isArray(candidate.market) ? candidate.market : defaultSiteContent.market,
    tournaments: Array.isArray(candidate.tournaments) ? candidate.tournaments : defaultSiteContent.tournaments,
    coaching: Array.isArray(candidate.coaching) ? candidate.coaching : defaultSiteContent.coaching,
    coaches: Array.isArray(candidate.coaches) ? candidate.coaches : defaultSiteContent.coaches,
    guides: Array.isArray(candidate.guides) ? candidate.guides : defaultSiteContent.guides,
  };
}

const SiteContentContext = createContext<SiteContentContextValue | null>(null);

export function SiteContentProvider({ children }: PropsWithChildren) {
  const [content, setContentState] = useState<SiteContent>(defaultSiteContent);
  const setContent = useCallback((value: unknown) => setContentState(mergeContent(value)), []);
  const refreshContent = useCallback(async () => {
    const response = await fetch("/api/site-content", { cache: "no-store" });
    if (!response.ok) return;
    setContent(await response.json());
  }, [setContent]);

  useEffect(() => {
    let active = true;
    fetch("/api/site-content", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((value: unknown) => { if (active && value) setContent(value); })
      .catch(() => undefined);
    return () => { active = false; };
  }, [setContent]);

  return <SiteContentContext.Provider value={{ content, setContent, refreshContent }}>{children}</SiteContentContext.Provider>;
}

function useContentContext(): SiteContentContextValue {
  const context = useContext(SiteContentContext);
  if (!context) throw new Error("SiteContentProvider is missing from the app tree.");
  return context;
}

export function useSiteContent(): SiteContent {
  return useContentContext().content;
}

export function useSiteContentActions(): Pick<SiteContentContextValue, "setContent" | "refreshContent"> {
  const { setContent, refreshContent } = useContentContext();
  return { setContent, refreshContent };
}
