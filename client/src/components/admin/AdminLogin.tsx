import { useState, type FormEvent } from "react";
import { ArrowLeft, ArrowRight, KeyRound, LockKeyhole, ShieldCheck, Sparkles } from "lucide-react";
import { Brand } from "@/components/GgSiteChrome";
import { adminFetch } from "@/lib/adminApi";

interface AdminLoginProps {
  onAuthenticated: () => Promise<void>;
}

export default function AdminLogin({ onAuthenticated }: AdminLoginProps) {
  const [email] = useState("yemannhein26@gmail.com");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await adminFetch<{ ok: true; expiresInSeconds: number }>("/api/admin/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      setPassword("");
      await onAuthenticated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not sign in to the admin panel.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="admin-login-page">
      <section className="admin-login-card">
        <header className="admin-login-head"><Brand /><a href="/" className="admin-back-home"><ArrowLeft size={14} /> Back to site</a></header>
        <div className="admin-login-content">
          <div className="admin-login-mark"><span><LockKeyhole size={22} /></span><i /><i /><i /></div>
          <div className="admin-kicker"><span className="live-dot" /> PRIVATE ACCESS / GG SUPPLY</div>
          <h1>ADMIN<br /><em>ACCESS.</em></h1>
          <p className="admin-login-copy">Sign in with the approved Gmail account and your private admin password. Email codes are turned off for now.</p>

          <form className="admin-login-form" onSubmit={signIn}>
            <label>Email address<input type="email" autoComplete="username" value={email} readOnly /></label>
            <label>Admin password<input type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required minLength={16} maxLength={256} /></label>
            <div className="admin-login-hint"><ShieldCheck size={15} /><span>Only the approved Gmail can sign in. Use your private password of at least 16 characters.</span></div>
            <button className="admin-primary-button" type="submit" disabled={busy || password.length < 16}>{busy ? "SIGNING IN…" : "OPEN ADMIN STUDIO"}<ArrowRight size={16} /></button>
          </form>

          {error && <div className="admin-error" role="alert">{error}</div>}
          <div className="admin-login-security"><KeyRound size={15} /><span>Keep your password private. Admin sessions expire after 12 hours.</span></div>
        </div>
        <footer className="admin-login-foot"><span><Sparkles size={13} /> GG SUPPLY / ADMIN STUDIO</span><span>SECURE SIGN-IN</span></footer>
      </section>
      <aside className="admin-login-side" aria-label="Admin panel capabilities">
        <div className="admin-login-side-orbit" />
        <div className="admin-side-label"><span className="live-dot" /> CONTROL ROOM / 01</div>
        <h2>YOUR SITE.<br /><em>YOUR SIGNAL.</em></h2>
        <p>Manage the stories, artwork, market listings, tournament posts, coaching, and guides that players see on GG SUPPLY.</p>
        <div className="admin-side-grid"><span>01 / NEWS</span><span>02 / ARTWORK</span><span>03 / MARKET</span><span>04 / TOURNAMENTS</span><span>05 / COACHES</span><span>06 / GUIDES</span></div>
        <span className="admin-side-watermark">GG</span>
      </aside>
    </main>
  );
}
