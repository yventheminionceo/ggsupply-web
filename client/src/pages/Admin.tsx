import { useEffect, useMemo, useState } from "react";
import { Activity, BookOpen, Check, Image, LayoutDashboard, LogOut, Newspaper, Save, Settings2, ShieldCheck, ShoppingBag, Swords, Target, UserRound, type LucideIcon } from "lucide-react";
import { Brand } from "@/components/GgSiteChrome";
import AdminLogin from "@/components/admin/AdminLogin";
import ContentEditor from "@/components/admin/ContentEditor";
import { adminFetch } from "@/lib/adminApi";
import { useSiteContentActions } from "@/hooks/useSiteContent";
import { defaultSiteContent, type EditableSection, type SiteContent } from "../../../shared/siteContent";

type AdminSectionMeta = { id: EditableSection; label: string; icon: LucideIcon; group: string };
const sections: AdminSectionMeta[] = [
  { id: "settings", label: "Site settings", icon: Settings2, group: "SITE" },
  { id: "news", label: "News posts", icon: Newspaper, group: "PUBLISH" },
  { id: "artwork", label: "Artwork", icon: Image, group: "PUBLISH" },
  { id: "market", label: "Gaming Market", icon: ShoppingBag, group: "PUBLISH" },
  { id: "tournaments", label: "Tournaments", icon: Swords, group: "PUBLISH" },
  { id: "coaching", label: "Coaching offers", icon: Target, group: "PLAYERS" },
  { id: "coaches", label: "Coach profiles", icon: UserRound, group: "PLAYERS" },
  { id: "guides", label: "Guides", icon: BookOpen, group: "PLAYERS" },
];

interface SessionResponse { authenticated: boolean; email?: string | null }
interface ContentResponse { content: SiteContent }

export default function Admin() {
  const [status, setStatus] = useState<"checking" | "signed-out" | "loading-content" | "signed-in">("checking");
  const [activeSection, setActiveSection] = useState<EditableSection>("settings");
  const [content, setContent] = useState<SiteContent>(defaultSiteContent);
  const [savedContent, setSavedContent] = useState<SiteContent>(defaultSiteContent);
  const [adminEmail, setAdminEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const { setContent: setPublicContent, refreshContent } = useSiteContentActions();

  async function loadAdminContent() {
    setStatus("loading-content");
    setError("");
    try {
      const result = await adminFetch<SiteContent>("/api/admin/content");
      setContent(result);
      setSavedContent(result);
      setPublicContent(result);
      setStatus("signed-in");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load admin content.");
      setStatus("signed-out");
      throw err;
    }
  }

  useEffect(() => {
    let active = true;
    adminFetch<SessionResponse>("/api/admin/session")
      .then(async (session) => {
        if (!active) return;
        if (!session.authenticated) {
          setStatus("signed-out");
          return;
        }
        setAdminEmail(session.email ?? "");
        setStatus("loading-content");
        const current = await adminFetch<SiteContent>("/api/admin/content");
        if (!active) return;
        setContent(current);
        setSavedContent(current);
        setPublicContent(current);
        setStatus("signed-in");
      })
      .catch((err: unknown) => {
        if (!active) return;
        if (err instanceof Error && "status" in err && (err as { status?: number }).status === 401) {
          setStatus("signed-out");
          return;
        }
        setError(err instanceof Error ? err.message : "Could not check admin access.");
        setStatus("signed-out");
      });
    return () => { active = false; };
  }, [setPublicContent]);

  const activeMeta = sections.find((item) => item.id === activeSection) ?? sections[0];
  const isDirty = useMemo(() => JSON.stringify(content[activeSection]) !== JSON.stringify(savedContent[activeSection]), [activeSection, content, savedContent]);

  async function saveCurrentSection() {
    if (!isDirty || saving) return;
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const result = await adminFetch<ContentResponse>(`/api/admin/content/${activeSection}`, {
        method: "PUT",
        body: JSON.stringify({ value: content[activeSection] }),
      });
      setContent(result.content);
      setSavedContent(result.content);
      setPublicContent(result.content);
      setNotice(`${activeMeta.label} saved. Public pages now use the updated content.`);
      window.setTimeout(() => setNotice(""), 4200);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save this section.");
    } finally {
      setSaving(false);
    }
  }

  async function uploadArtwork(file: File): Promise<string> {
    setUploading(true);
    setError("");
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => typeof reader.result === "string" ? resolve(reader.result) : reject(new Error("Could not read this image."));
        reader.onerror = () => reject(new Error("Could not read this image."));
        reader.readAsDataURL(file);
      });
      const base64 = dataUrl.split(",")[1] ?? "";
      const result = await adminFetch<{ imageUrl: string }>("/api/admin/artwork/upload", {
        method: "POST",
        body: JSON.stringify({ contentType: file.type, base64 }),
      });
      return result.imageUrl;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Artwork upload failed.";
      setError(message);
      throw new Error(message);
    } finally {
      setUploading(false);
    }
  }

  async function signOut() {
    setError("");
    try {
      await adminFetch<{ ok: true }>("/api/admin/auth/logout", { method: "POST", body: "{}" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not sign out cleanly.");
      return;
    }
    setAdminEmail("");
    setContent(defaultSiteContent);
    setSavedContent(defaultSiteContent);
    try {
      await refreshContent();
    } catch {
      setPublicContent(defaultSiteContent);
    }
    setStatus("signed-out");
  }

  async function onAuthenticated() {
    await loadAdminContent();
    const session = await adminFetch<SessionResponse>("/api/admin/session");
    setAdminEmail(session.email ?? "");
  }

  if (status === "checking" || status === "loading-content") {
    return <main className="admin-checking"><div className="admin-spinner" /><span>{status === "checking" ? "VERIFYING ADMIN SESSION" : "LOADING YOUR CONTENT"}</span></main>;
  }

  if (status === "signed-out") return <AdminLogin onAuthenticated={onAuthenticated} />;

  const groups = [...new Set(sections.map((section) => section.group))];

  return (
    <div className="admin-dashboard">
      <header className="admin-dashboard-header">
        <Brand />
        <div className="admin-dashboard-status"><span className="admin-status-indicator" /><span>ADMIN STUDIO</span><i /> <span>{adminEmail}</span></div>
        <div className="admin-header-actions">
          <span className="admin-sync-state"><Activity size={14} /> {isDirty ? "UNSAVED CHANGES" : "ALL CHANGES SAVED"}</span>
          <button className="admin-save-button" type="button" onClick={saveCurrentSection} disabled={!isDirty || saving || uploading}>{saving ? "SAVING…" : "SAVE SECTION"}{saving ? <span className="admin-spinner-small" /> : <Save size={15} />}</button>
          <button className="admin-logout-button" type="button" onClick={signOut} aria-label="Sign out"><LogOut size={16} /><span>Sign out</span></button>
        </div>
      </header>
      <div className="admin-dashboard-layout">
        <aside className="admin-sidebar">
          <div className="admin-sidebar-top"><span className="admin-kicker">CONTROL ROOM</span><h1>CONTENT<br /><em>STUDIO.</em></h1><p>Update what players see across GG SUPPLY.</p></div>
          {groups.map((group) => <div className="admin-sidebar-group" key={group}><small>{group}</small>{sections.filter((section) => section.group === group).map((section) => {
            const Icon = section.icon;
            const dirty = JSON.stringify(content[section.id]) !== JSON.stringify(savedContent[section.id]);
            return <button type="button" key={section.id} className={activeSection === section.id ? "admin-nav-item active" : "admin-nav-item"} onClick={() => { setActiveSection(section.id); setError(""); setNotice(""); }}><Icon size={16} /><span>{section.label}</span>{dirty && <i className="admin-dirty-dot" />}</button>;
          })}</div>)}
          <a className="admin-preview-link" href="/"><LayoutDashboard size={15} /> View public site</a>
          <div className="admin-sidebar-foot"><ShieldCheck size={15} /><span>SERVER-VERIFIED ACCESS<br />SECURE SESSION</span></div>
        </aside>
        <main className="admin-workspace">
          <div className="admin-workspace-top"><span><span className="live-dot" /> GG SUPPLY / {activeMeta.group} / {activeMeta.label.toUpperCase()}</span><span>PRIVATE ADMIN AREA</span></div>
          {notice && <div className="admin-notice" role="status"><Check size={16} />{notice}</div>}
          {error && <div className="admin-error admin-workspace-error" role="alert">{error}</div>}
          {uploading && <div className="admin-upload-progress"><span className="admin-spinner-small" /> Uploading image securely…</div>}
          <div className={saving || uploading ? "admin-editor-wrap is-busy" : "admin-editor-wrap"} aria-busy={saving || uploading}>
            <ContentEditor section={activeSection} content={content} onChange={setContent} onUpload={uploadArtwork} />
          </div>
          <div className="admin-workspace-foot"><span>Changes remain private until you save this section.</span><button type="button" onClick={saveCurrentSection} disabled={!isDirty || saving || uploading}>{saving ? "SAVING…" : isDirty ? "SAVE CHANGES" : "NO UNSAVED CHANGES"}{!isDirty && <Check size={14} />}</button></div>
        </main>
      </div>
      <div className="admin-dashboard-mobile-save"><button type="button" onClick={saveCurrentSection} disabled={!isDirty || saving || uploading}>{saving ? "SAVING…" : "SAVE SECTION"}<Save size={15} /></button></div>
    </div>
  );
}
