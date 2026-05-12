"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/components/AuthProvider";
import { useToast, Spinner } from "@/components/UI";
import type { AuthResponse } from "@/lib/types";

export default function AuthPage() {
  const { saveAuth, user, ready } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [tab, setTab] = useState<"login" | "register">("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Giriş yapmışsa ana sayfaya yönlendir — sadece ready olduktan sonra
  useEffect(() => {
    if (ready && user) router.replace("/");
  }, [ready, user, router]);

  // ready değilse veya kullanıcı var ama henüz yönlendirilmediyse boş göster
  if (!ready || user) return null;

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(""); setLoading(true);
    const fd = new FormData(e.currentTarget);
    try {
      const res = await apiFetch<AuthResponse>("/auth/login", {
        method: "POST",
        body: { email: fd.get("email"), password: fd.get("password") },
      });
      saveAuth(res);
      toast(`Hoş geldin, ${res.user.firstName}! 👋`);
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Giriş yapılamadı");
    } finally { setLoading(false); }
  }

  async function handleRegister(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(""); setLoading(true);
    const fd = new FormData(e.currentTarget);
    if (fd.get("password") !== fd.get("passwordConfirm")) {
      setError("Şifreler eşleşmiyor"); setLoading(false); return;
    }
    try {
      const res = await apiFetch<AuthResponse>("/auth/register", {
        method: "POST",
        body: {
          firstName: fd.get("firstName"),
          lastName: fd.get("lastName"),
          email: fd.get("email"),
          password: fd.get("password"),
          phone: fd.get("phone"),
        },
      });
      saveAuth(res);
      toast("Hesabın oluşturuldu! Hoş geldin 🌿");
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kayıt oluşturulamadı");
    } finally { setLoading(false); }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">Hasad</div>
        <div className="auth-sub">Yerel üreticilerle buluş</div>

        <div className="auth-tabs">
          <button className={`auth-tab${tab === "login" ? " active" : ""}`} onClick={() => { setTab("login"); setError(""); }}>
            Giriş Yap
          </button>
          <button className={`auth-tab${tab === "register" ? " active" : ""}`} onClick={() => { setTab("register"); setError(""); }}>
            Kayıt Ol
          </button>
        </div>

        {error && <div className="auth-error">{error}</div>}

        {tab === "login" ? (
          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div className="form-group">
              <label className="form-label">E-posta</label>
              <input className="form-input" name="email" type="email" placeholder="ornek@email.com" required />
            </div>
            <div className="form-group">
              <label className="form-label">Şifre</label>
              <input className="form-input" name="password" type="password" placeholder="••••••••" required />
            </div>
            <button className="btn btn-primary btn-block" style={{ marginTop: 4 }} disabled={loading}>
              {loading ? <><Spinner /> Giriş yapılıyor…</> : "Giriş Yap"}
            </button>
            <div style={{ textAlign: "center", marginTop: 8 }}>
              <Link href="/auth/forgot-password" style={{ fontSize: 13, color: "var(--text-muted)" }}>
                Şifremi unuttum
              </Link>
            </div>
          </form>
        ) : (
          <form onSubmit={handleRegister} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Ad</label>
                <input className="form-input" name="firstName" placeholder="Ayşe" required minLength={2} />
              </div>
              <div className="form-group">
                <label className="form-label">Soyad</label>
                <input className="form-input" name="lastName" placeholder="Demir" required minLength={2} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">E-posta</label>
              <input className="form-input" name="email" type="email" placeholder="ornek@email.com" required />
            </div>
            <div className="form-group">
              <label className="form-label">Telefon (isteğe bağlı)</label>
              <input className="form-input" name="phone" type="tel" placeholder="05XX XXX XX XX" />
            </div>
            <div className="form-group">
              <label className="form-label">Şifre</label>
              <input className="form-input" name="password" type="password" placeholder="En az 8 karakter" required minLength={8} />
              <span className="form-hint">Büyük harf, küçük harf ve rakam içermeli</span>
            </div>
            <div className="form-group">
              <label className="form-label">Şifre Tekrar</label>
              <input className="form-input" name="passwordConfirm" type="password" placeholder="••••••••" required />
            </div>
            <button className="btn btn-primary btn-block" style={{ marginTop: 4 }} disabled={loading}>
              {loading ? <><Spinner /> Hesap oluşturuluyor…</> : "Kayıt Ol"}
            </button>
          </form>
        )}

        <div style={{ marginTop: 20, textAlign: "center" }}>
          <Link href="/" style={{ fontSize: 13, color: "var(--text-muted)" }}>← Ana sayfaya dön</Link>
        </div>
      </div>
    </div>
  );
}
