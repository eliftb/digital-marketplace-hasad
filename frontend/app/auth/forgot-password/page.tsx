"use client";
import { useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { useToast, Spinner } from "@/components/UI";

export default function ForgotPasswordPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(""); setLoading(true);
    const fd = new FormData(e.currentTarget);
    try {
      await apiFetch("/auth/forgot-password", {
        method: "POST",
        body: { email: fd.get("email") },
      });
      setSent(true);
      toast("Şifre sıfırlama e-postası gönderildi");
    } catch (err) {
      // Backend always returns 200 for security - show success anyway
      setSent(true);
    } finally { setLoading(false); }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">Hasad</div>
        <div className="auth-sub">Şifre Sıfırlama</div>

        {sent ? (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📬</div>
            <h3 style={{ marginBottom: 8 }}>E-posta Gönderildi</h3>
            <p style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 24 }}>
              Eğer bu e-posta sistemimizde kayıtlıysa, şifre sıfırlama bağlantısı gönderildi.
            </p>
            <Link href="/auth" className="btn btn-primary btn-block">Giriş Sayfasına Dön</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {error && <div className="auth-error">{error}</div>}
            <div className="form-group">
              <label className="form-label">E-posta Adresiniz</label>
              <input className="form-input" name="email" type="email" placeholder="ornek@email.com" required />
            </div>
            <button className="btn btn-primary btn-block" disabled={loading}>
              {loading ? <><Spinner /> Gönderiliyor…</> : "Sıfırlama Linki Gönder"}
            </button>
            <div style={{ textAlign: "center" }}>
              <Link href="/auth" style={{ fontSize: 13, color: "var(--text-muted)" }}>← Giriş sayfasına dön</Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
