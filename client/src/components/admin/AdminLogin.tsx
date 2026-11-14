import { useState, type FormEvent } from "react";
import { ArrowLeft, ArrowRight, KeyRound, LockKeyhole, MailCheck, ShieldCheck, Sparkles } from "lucide-react";
import { Brand } from "@/components/GgSiteChrome";
import { adminFetch } from "@/lib/adminApi";

interface AdminLoginProps {
  onAuthenticated: () => Promise<void>;
}

interface ChallengeResponse {
  ok: true;
  challengeId: string;
  maskedEmail: string;
  expiresInSeconds: number;
}

export default function AdminLogin({ onAuthenticated }: AdminLoginProps) {
  const [step, setStep] = useState<"credentials" | "code">("credentials");
  const [email, setEmail] = useState("yemannhein26@gmail.com");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [challenge, setChallenge] = useState<ChallengeResponse | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function requestCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const result = await adminFetch<ChallengeResponse>("/api/admin/auth/request-code", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      setChallenge(result);
      setPassword("");
      setCode("");
      setStep("code");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not request a sign-in code.");
    } finally {
      setBusy(false);
    }
  }

  async function verifyCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!challenge) return;
    setBusy(true);
    setError("");
    try {
      await adminFetch<{ ok: true }>("/api/admin/auth/verify-code", {
        method: "POST",
        body: JSON.stringify({ challengeId: challenge.challengeId, code: code.trim() }),
      });
      setCode("");
      await onAuthenticated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not verify the sign-in code.");
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
          <h1>{step === "credentials" ? <>ADMIN<br /><em>ACCESS.</em></> : <>CHECK YOUR<br /><em>INBOX.</em></>}</h1>
          <p className="admin-login-copy">{step === "credentials" ? "Sign in with the approved Gmail and your private admin password. A fresh code is required each time." : `A one-time code was sent to ${challenge?.maskedEmail ?? "your approved Gmail"}. Enter it to finish signing in.`}</p>

          {step === "credentials" ? (
            <form className="admin-login-form" onSubmit={requestCode}>
              <label>Email address<input type="email" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} required maxLength={320} /></label>
              <label>Admin password<input type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required maxLength={256} /></label>
              <button className="admin-primary-button" type="submit" disabled={busy}>{busy ? "SENDING CODE…" : "CONTINUE TO EMAIL CODE"}<ArrowRight size={16} /></button>
            </form>
          ) : (
            <form className="admin-login-form" onSubmit={verifyCode}>
              <label>Six-digit code<input className="admin-code-input" type="text" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="000000" required /></label>
              <div className="admin-code-hint"><MailCheck size={15} /><span>The code expires in 10 minutes and can only be used once.</span></div>
              <button className="admin-primary-button" type="submit" disabled={busy || code.length !== 6}>{busy ? "VERIFYING…" : "VERIFY & OPEN ADMIN"}<ShieldCheck size={16} /></button>
              <button className="admin-text-button" type="button" onClick={() => { setStep("credentials"); setChallenge(null); setError(""); setCode(""); }}>Use credentials again</button>
            </form>
          )}

          {error && <div className="admin-error" role="alert">{error}</div>}
          <div className="admin-login-security"><KeyRound size={15} /><span>Login codes are single-use. Never share them with anyone.</span></div>
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
