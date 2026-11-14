import { useState, type ChangeEvent, type ReactNode } from "react";
import { ArrowUpRight, ImagePlus, Plus, Trash2, UploadCloud } from "lucide-react";
import type { EditableSection, SiteContent } from "../../../../shared/siteContent";

interface ContentEditorProps {
  section: EditableSection;
  content: SiteContent;
  onChange: (content: SiteContent) => void;
  onUpload: (file: File) => Promise<string>;
}

type ListSection = Exclude<EditableSection, "settings" | "artwork">;

const sectionMeta: Record<EditableSection, { title: string; description: string }> = {
  settings: { title: "Site settings", description: "Update the visible brand line, homepage message, and community link." },
  news: { title: "News posts", description: "Write the story cards players see in the GG SUPPLY newsroom." },
  artwork: { title: "Artwork library", description: "Upload and assign safe image files to the homepage, news feature, and tournament artwork." },
  market: { title: "Gaming Market", description: "Maintain the games, offers, categories, notes, and price labels in the public catalog." },
  tournaments: { title: "Tournament posts", description: "Edit event details and prize information shown on the tournament page." },
  coaching: { title: "Coaching offers", description: "Edit the coaching formats, game focus, specialty, and availability shown to players." },
  coaches: { title: "Coach profiles", description: "Add and update public coach profiles, specialties, and available times." },
  guides: { title: "Guides", description: "Manage the short guide titles and categories shown on the homepage." },
};

function TextField({ label, value, onChange, placeholder, maxLength = 180 }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string; maxLength?: number }) {
  return <label className="admin-field"><span>{label}</span><input type="text" value={value} maxLength={maxLength} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} /></label>;
}

function TextAreaField({ label, value, onChange, placeholder, maxLength = 800, rows = 3 }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string; maxLength?: number; rows?: number }) {
  return <label className="admin-field admin-field-wide"><span>{label}</span><textarea value={value} rows={rows} maxLength={maxLength} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} /></label>;
}

function NumberField({ label, value, onChange, min = 0, max = 100_000_000 }: { label: string; value: number; onChange: (value: number) => void; min?: number; max?: number }) {
  return <label className="admin-field"><span>{label}</span><input type="number" value={value} min={min} max={max} step={1} onChange={(event) => onChange(Number(event.target.value))} /></label>;
}

function SelectField({ label, value, options, onChange }: { label: string; value: string; options: readonly { value: string; label: string }[]; onChange: (value: string) => void }) {
  return <label className="admin-field"><span>{label}</span><select value={value} onChange={(event) => onChange(event.target.value)}>{options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>;
}

function EditorCard({ title, subtitle, children, onRemove }: { title: string; subtitle: string; children: ReactNode; onRemove: () => void }) {
  return <article className="admin-editor-card"><header><div><small>{subtitle}</small><h3>{title}</h3></div><button className="admin-remove-button" type="button" onClick={onRemove} aria-label={`Remove ${title}`}><Trash2 size={15} /> Remove</button></header><div className="admin-editor-fields">{children}</div></article>;
}

function ImageField({ label, value, onChange, onUpload }: { label: string; value: string; onChange: (value: string) => void; onUpload: (file: File) => Promise<string> }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!(["image/png", "image/jpeg", "image/webp", "image/gif"] as string[]).includes(file.type) || file.size > 5 * 1024 * 1024) {
      setError("Choose a PNG, JPEG, WebP, or GIF image up to 5 MB.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      onChange(await onUpload(file));
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Upload failed. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="admin-image-field">
      <div className="admin-image-preview">{value ? <img src={value} alt="" /> : <ImagePlus size={22} />}<span>{value ? "IMAGE SET" : "NO IMAGE"}</span></div>
      <div className="admin-image-controls">
        <TextField label={label} value={value} onChange={onChange} placeholder="Paste an https:// or /manus-storage/ URL" maxLength={2048} />
        <label className={`admin-upload-button${busy ? " is-busy" : ""}`}><UploadCloud size={15} />{busy ? "UPLOADING…" : "Upload artwork"}<input type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={handleFile} disabled={busy} /></label>
        <small>PNG, JPEG, WebP or GIF · 5 MB max</small>
        {error && <span className="admin-upload-error" role="alert">{error}</span>}
      </div>
    </div>
  );
}

function newId(section: string): string {
  const random = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID().replace(/-/g, "").slice(0, 16) : Math.random().toString(36).slice(2, 18);
  return `${section}-${random}`.slice(0, 64);
}

function newRecord(section: ListSection): Record<string, unknown> {
  const id = newId(section);
  switch (section) {
    case "news": return { id, category: "GAME UPDATE", title: "New news post", summary: "", imageUrl: "" };
    case "market": return { id, game: "GAME TITLE", offer: "NEW OFFER", category: "CURRENCY", detail: "Add the listing details.", note: "DETAILS TO ADD", priceLabel: "TO ADD", color: "cyan", icon: "sparkles" };
    case "tournaments": return { id, game: "PUBG MOBILE", title: "NEW TOURNAMENT", format: "TDM (BOX)", description: "Add the confirmed tournament details.", scheduleLabel: "SCHEDULE NOT SET", status: "DETAILS PREVIEW", playerCap: 8, registrationFeeMmk: 0, championPrizeMmk: 0, posterUrl: "" };
    case "coaching": return { id, name: "NEW SESSION", label: "Coaching offer", description: "Add the session details.", note: "SESSION INFO", game: "Choose game", specialty: "Add specialty", availability: "Add open slots", icon: "target" };
    case "coaches": return { id, name: "New coach", game: "Choose game", specialty: "Add specialty", availability: "Add availability", bio: "", avatarUrl: "" };
    case "guides": return { id, category: "START HERE", title: "New guide" };
  }
  return { id, category: "START HERE", title: "New guide" };
}

export default function ContentEditor({ section, content, onChange, onUpload }: ContentEditorProps) {
  const meta = sectionMeta[section];
  const updateSettings = (field: keyof SiteContent["settings"], value: string) => onChange({ ...content, settings: { ...content.settings, [field]: value } });
  const updateArtwork = (field: keyof SiteContent["artwork"], value: string) => onChange({ ...content, artwork: { ...content.artwork, [field]: value } });

  function updateEntry(activeSection: ListSection, index: number, field: string, value: unknown) {
    const entries = content[activeSection] as unknown as Array<Record<string, unknown>>;
    const updated = entries.map((entry, entryIndex) => entryIndex === index ? { ...entry, [field]: value } : entry);
    onChange({ ...content, [activeSection]: updated } as SiteContent);
  }

  function addEntry(activeSection: ListSection) {
    const entries = content[activeSection] as unknown as Array<Record<string, unknown>>;
    onChange({ ...content, [activeSection]: [...entries, newRecord(activeSection)] } as SiteContent);
  }

  function removeEntry(activeSection: ListSection, index: number, title: string) {
    if (!window.confirm(`Remove “${title}” from this section? Save the section to apply this change publicly.`)) return;
    const entries = content[activeSection] as unknown as Array<Record<string, unknown>>;
    onChange({ ...content, [activeSection]: entries.filter((_, entryIndex) => entryIndex !== index) } as SiteContent);
  }

  return (
    <div className="admin-content-editor">
      <div className="admin-section-title"><div><span className="admin-kicker">CONTENT CONTROL / {section.toUpperCase()}</span><h2>{meta.title}</h2><p>{meta.description}</p></div>
        {section !== "settings" && section !== "artwork" && <button className="admin-add-button" type="button" onClick={() => addEntry(section)}><Plus size={16} /> Add {section === "coaches" ? "coach" : section === "news" ? "post" : section === "tournaments" ? "tournament" : section === "market" ? "listing" : section === "guides" ? "guide" : "offer"}</button>}
      </div>

      {section === "settings" && (
        <div className="admin-editor-card"><header><div><small>PUBLIC BRAND &amp; COMMUNITY</small><h3>Homepage settings</h3></div><ArrowUpRight size={16} /></header><div className="admin-editor-fields">
          <TextField label="Brand tagline" value={content.settings.tagline} onChange={(value) => updateSettings("tagline", value)} maxLength={100} />
          <TextAreaField label="Homepage description" value={content.settings.heroDescription} onChange={(value) => updateSettings("heroDescription", value)} maxLength={400} />
          <TextAreaField label="Community message" value={content.settings.communityMessage} onChange={(value) => updateSettings("communityMessage", value)} maxLength={400} />
          <TextField label="Community invite URL (HTTPS)" value={content.settings.communityUrl} onChange={(value) => updateSettings("communityUrl", value)} placeholder="https://…" maxLength={2048} />
        </div></div>
      )}

      {section === "artwork" && (
        <div className="admin-artwork-list">
          <div className="admin-editor-card"><header><div><small>HOME / FEATURE ART</small><h3>Homepage hero</h3></div><ArrowUpRight size={16} /></header><ImageField label="Homepage hero artwork" value={content.artwork.homeHeroUrl} onChange={(value) => updateArtwork("homeHeroUrl", value)} onUpload={onUpload} /></div>
          <div className="admin-editor-card"><header><div><small>NEWSROOM / FEATURE ART</small><h3>News feature artwork</h3></div><ArrowUpRight size={16} /></header><ImageField label="News feature image" value={content.artwork.newsFeatureUrl} onChange={(value) => updateArtwork("newsFeatureUrl", value)} onUpload={onUpload} /></div>
          <div className="admin-editor-card"><header><div><small>TOURNAMENT DESK / FEATURE ART</small><h3>Tournament poster</h3></div><ArrowUpRight size={16} /></header><ImageField label="Tournament artwork" value={content.artwork.tournamentPosterUrl} onChange={(value) => updateArtwork("tournamentPosterUrl", value)} onUpload={onUpload} /></div>
        </div>
      )}

      {section === "news" && <div className="admin-entry-list">{content.news.map((post, index) => <EditorCard key={post.id} title={post.title || "Untitled news post"} subtitle={`NEWS POST / ${String(index + 1).padStart(2, "0")}`} onRemove={() => removeEntry("news", index, post.title || "this post")}>
        <TextField label="Category" value={post.category} onChange={(value) => updateEntry("news", index, "category", value)} maxLength={48} />
        <TextField label="Headline" value={post.title} onChange={(value) => updateEntry("news", index, "title", value)} maxLength={180} />
        <TextAreaField label="Summary" value={post.summary} onChange={(value) => updateEntry("news", index, "summary", value)} maxLength={400} />
        <ImageField label="Post image" value={post.imageUrl} onChange={(value) => updateEntry("news", index, "imageUrl", value)} onUpload={onUpload} />
      </EditorCard>)}</div>}

      {section === "market" && <div className="admin-entry-list">{content.market.map((product, index) => <EditorCard key={product.id} title={product.offer || "Untitled listing"} subtitle={`MARKET LISTING / ${String(index + 1).padStart(2, "0")}`} onRemove={() => removeEntry("market", index, product.offer || "this listing")}>
        <TextField label="Game / brand" value={product.game} onChange={(value) => updateEntry("market", index, "game", value)} maxLength={80} />
        <TextField label="Offer name" value={product.offer} onChange={(value) => updateEntry("market", index, "offer", value)} maxLength={100} />
        <SelectField label="Category" value={product.category} options={[{ value: "CURRENCY", label: "Game currency" }, { value: "PASSES", label: "Passes" }, { value: "GIFT CARDS", label: "Gift cards" }, { value: "COACHING", label: "Coaching" }]} onChange={(value) => updateEntry("market", index, "category", value)} />
        <TextField label="Price label" value={product.priceLabel} onChange={(value) => updateEntry("market", index, "priceLabel", value)} maxLength={48} />
        <TextField label="Small note" value={product.note} onChange={(value) => updateEntry("market", index, "note", value)} maxLength={100} />
        <TextAreaField label="Product details" value={product.detail} onChange={(value) => updateEntry("market", index, "detail", value)} maxLength={400} />
        <SelectField label="Accent color" value={product.color} options={[{ value: "cyan", label: "Cyan" }, { value: "violet", label: "Violet" }, { value: "coral", label: "Coral" }]} onChange={(value) => updateEntry("market", index, "color", value)} />
        <SelectField label="Card icon" value={product.icon} options={[{ value: "crosshair", label: "Crosshair" }, { value: "sparkles", label: "Sparkles" }, { value: "flame", label: "Flame" }, { value: "calendar", label: "Calendar" }, { value: "gift", label: "Gift" }, { value: "target", label: "Target" }]} onChange={(value) => updateEntry("market", index, "icon", value)} />
      </EditorCard>)}</div>}

      {section === "tournaments" && <div className="admin-entry-list">{content.tournaments.map((event, index) => <EditorCard key={event.id} title={event.title || "Untitled tournament"} subtitle={`TOURNAMENT POST / ${String(index + 1).padStart(2, "0")}`} onRemove={() => removeEntry("tournaments", index, event.title || "this tournament")}>
        <TextField label="Game" value={event.game} onChange={(value) => updateEntry("tournaments", index, "game", value)} maxLength={64} />
        <TextField label="Tournament title" value={event.title} onChange={(value) => updateEntry("tournaments", index, "title", value)} maxLength={120} />
        <TextField label="Format" value={event.format} onChange={(value) => updateEntry("tournaments", index, "format", value)} maxLength={64} />
        <SelectField label="Player cap" value={String(event.playerCap)} options={[2, 4, 8, 16, 32, 64, 128].map((value) => ({ value: String(value), label: `${value} players` }))} onChange={(value) => updateEntry("tournaments", index, "playerCap", Number(value))} />
        <TextField label="Schedule" value={event.scheduleLabel} onChange={(value) => updateEntry("tournaments", index, "scheduleLabel", value)} maxLength={80} />
        <TextField label="Status label" value={event.status} onChange={(value) => updateEntry("tournaments", index, "status", value)} maxLength={48} />
        <NumberField label="Registration fee (MMK)" value={event.registrationFeeMmk} onChange={(value) => updateEntry("tournaments", index, "registrationFeeMmk", value)} />
        <NumberField label="Champion prize (MMK)" value={event.championPrizeMmk} onChange={(value) => updateEntry("tournaments", index, "championPrizeMmk", value)} />
        <TextAreaField label="Tournament description" value={event.description} onChange={(value) => updateEntry("tournaments", index, "description", value)} maxLength={800} />
        <TextField label="Poster image URL" value={event.posterUrl} onChange={(value) => updateEntry("tournaments", index, "posterUrl", value)} maxLength={2048} />
      </EditorCard>)}</div>}

      {section === "coaching" && <div className="admin-entry-list">{content.coaching.map((offer, index) => <EditorCard key={offer.id} title={offer.label || "Untitled coaching offer"} subtitle={`COACHING OFFER / ${String(index + 1).padStart(2, "0")}`} onRemove={() => removeEntry("coaching", index, offer.label || "this offer")}>
        <TextField label="Card title" value={offer.label} onChange={(value) => updateEntry("coaching", index, "label", value)} maxLength={100} />
        <TextField label="Short name" value={offer.name} onChange={(value) => updateEntry("coaching", index, "name", value)} maxLength={80} />
        <TextField label="Game" value={offer.game} onChange={(value) => updateEntry("coaching", index, "game", value)} maxLength={80} />
        <TextField label="Specialty" value={offer.specialty} onChange={(value) => updateEntry("coaching", index, "specialty", value)} maxLength={120} />
        <TextField label="Availability" value={offer.availability} onChange={(value) => updateEntry("coaching", index, "availability", value)} maxLength={120} />
        <TextField label="Card note" value={offer.note} onChange={(value) => updateEntry("coaching", index, "note", value)} maxLength={48} />
        <TextAreaField label="Description" value={offer.description} onChange={(value) => updateEntry("coaching", index, "description", value)} maxLength={400} />
        <SelectField label="Card icon" value={offer.icon} options={[{ value: "target", label: "Target" }, { value: "search", label: "Search" }, { value: "users", label: "Players" }]} onChange={(value) => updateEntry("coaching", index, "icon", value)} />
      </EditorCard>)}</div>}

      {section === "coaches" && <div className="admin-entry-list">{content.coaches.length === 0 && <div className="admin-empty-state"><Plus size={18} /><b>No coach profiles yet.</b><span>Use “Add coach” to create the first public coach card.</span></div>}{content.coaches.map((coach, index) => <EditorCard key={coach.id} title={coach.name || "New coach"} subtitle={`COACH PROFILE / ${String(index + 1).padStart(2, "0")}`} onRemove={() => removeEntry("coaches", index, coach.name || "this coach")}>
        <TextField label="Coach name" value={coach.name} onChange={(value) => updateEntry("coaches", index, "name", value)} maxLength={100} />
        <TextField label="Game" value={coach.game} onChange={(value) => updateEntry("coaches", index, "game", value)} maxLength={64} />
        <TextField label="Specialty" value={coach.specialty} onChange={(value) => updateEntry("coaches", index, "specialty", value)} maxLength={120} />
        <TextField label="Availability" value={coach.availability} onChange={(value) => updateEntry("coaches", index, "availability", value)} maxLength={120} />
        <TextAreaField label="Short bio" value={coach.bio} onChange={(value) => updateEntry("coaches", index, "bio", value)} maxLength={500} />
        <ImageField label="Coach avatar" value={coach.avatarUrl} onChange={(value) => updateEntry("coaches", index, "avatarUrl", value)} onUpload={onUpload} />
      </EditorCard>)}</div>}

      {section === "guides" && <div className="admin-entry-list">{content.guides.map((guide, index) => <EditorCard key={guide.id} title={guide.title || "Untitled guide"} subtitle={`GUIDE / ${String(index + 1).padStart(2, "0")}`} onRemove={() => removeEntry("guides", index, guide.title || "this guide")}>
        <TextField label="Category" value={guide.category} onChange={(value) => updateEntry("guides", index, "category", value)} maxLength={48} />
        <TextField label="Guide title" value={guide.title} onChange={(value) => updateEntry("guides", index, "title", value)} maxLength={140} />
      </EditorCard>)}</div>}
    </div>
  );
}
