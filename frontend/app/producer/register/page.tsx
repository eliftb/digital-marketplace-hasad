"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/components/AuthProvider";
import { useToast, Spinner } from "@/components/UI";
import type { ProducerProfileResponse, City } from "@/lib/types";

export default function ProducerRegisterPage() {
  const { token, user, ready } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState(1);

  useEffect(() => {
    apiFetch<City[]>("/cities").then(setCities).catch(() => {});
  }, []);

  useEffect(() => {
    if (ready && user && user.role === "PRODUCER") router.replace("/producer/dashboard");
  }, [ready, user, router]);

  if (!ready) return null;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!token) { toast("Giriş yapmanız gerekiyor", "error"); return; }
    setLoading(true); setError("");
    const fd = new FormData(e.currentTarget);
    try {
      await apiFetch<ProducerProfileResponse>("/producers/register", {
        method: "POST", token,
        body: {
          storeName: fd.get("storeName"),
          storeDescription: fd.get("storeDescription"),
          cityId: fd.get("cityId") ? Number(fd.get("cityId")) : undefined,
          address: fd.get("address"),
          taxNumber: fd.get("taxNumber"),
          iban: fd.get("iban"),
        },
      });
      setStep(3);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Başvuru gönderilemedi");
    } finally { setLoading(false); }
  }

  if (step === 3) {
    return (
      <div className="producer-register-page">
        <div className="container" style={{ maxWidth: 600 }}>
          <div className="producer-register-card" style={{ textAlign: "center" }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>🌿</div>
            <h2>Başvurunuz Alındı!</h2>
            <p style={{ marginBottom: 24, color: "var(--text-secondary)", lineHeight: 1.7 }}>
              Üretici başvurunuz ekibimize iletildi. 1-3 iş günü içinde incelenecek
              ve e-posta ile bilgilendirileceksiniz.
            </p>
            <Link href="/" className="btn btn-primary">Ana Sayfaya Dön</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="producer-register-page">
      <div className="container" style={{ maxWidth: 640 }}>
        <div className="producer-register-card">
          {/* Steps */}
          <div className="producer-register-steps">
            {["Hesap", "Mağaza Bilgileri", "Onay"].map((label, i) => (
              <div key={i} className={`producer-step${step > i ? " done" : step === i + 1 ? " active" : ""}`}>
                <div className="producer-step-icon">{step > i ? "✓" : i + 1}</div>
                <div className="producer-step-label">{label}</div>
              </div>
            ))}
          </div>

          <h2 style={{ marginBottom: 8 }}>Üretici Ol</h2>
          <p style={{ marginBottom: 32, color: "var(--text-secondary)" }}>
            Ürünlerini milyonlarca müşteriye sat. Başvurun 1-3 iş gününde değerlendirilir.
          </p>

          {!token ? (
            <div style={{ textAlign: "center" }}>
              <p style={{ marginBottom: 20 }}>Devam etmek için önce giriş yapmalısınız.</p>
              <Link href="/auth" className="btn btn-primary btn-lg">Giriş Yap / Kayıt Ol</Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {error && <div className="auth-error">{error}</div>}

              <div className="form-group">
                <label className="form-label">Mağaza Adı *</label>
                <input className="form-input" name="storeName" placeholder="Örn: Ege'nin Bereketi" required maxLength={200} />
                <span className="form-hint">Bu isim müşterilere gösterilecek</span>
              </div>

              <div className="form-group">
                <label className="form-label">Mağaza Açıklaması</label>
                <textarea className="form-textarea" name="storeDescription" placeholder="Ürünlerinizden, üretim yönteminizden bahsedin…" rows={4} />
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Şehir</label>
                  <select className="form-select" name="cityId">
                    <option value="">Seçin…</option>
                    {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Vergi Numarası</label>
                  <input className="form-input" name="taxNumber" placeholder="1234567890" />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Adres</label>
                <textarea className="form-textarea" name="address" placeholder="Açık adresiniz" rows={2} />
              </div>

              <div className="form-group">
                <label className="form-label">IBAN (ödeme için)</label>
                <input className="form-input" name="iban" placeholder="TR00 0000 0000 0000 0000 0000 00" />
                <span className="form-hint">Satış ödemeleriniz bu hesaba aktarılacak</span>
              </div>

              {/* Benefits */}
              <div style={{ background: "var(--olive-50)", border: "1px solid var(--olive-200)", borderRadius: "var(--radius)", padding: 20 }}>
                <div style={{ fontWeight: 700, marginBottom: 10, color: "var(--olive-700)" }}>🌾 Üretici olmanın avantajları</div>
                {["Milyonlarca müşteriye ulaş", "Kendi fiyatını belirle", "Düşük komisyon oranı (%8-10)", "Haftalık ödeme garantisi", "Ücretsiz mağaza sayfası"].map(b => (
                  <div key={b} style={{ fontSize: 14, color: "var(--text-secondary)", display: "flex", gap: 8, marginBottom: 4 }}>
                    <span>✓</span> {b}
                  </div>
                ))}
              </div>

              <button className="btn btn-primary btn-lg btn-block" disabled={loading}>
                {loading ? <><Spinner /> Gönderiliyor…</> : "Başvuruyu Gönder 🌿"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
