"use client";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/components/AuthProvider";
import { useToast, StatusBadge, Spinner, EmptyState } from "@/components/UI";
import type { ProducerProfileResponse, PageResponse } from "@/lib/types";

export default function AdminProducersPage() {
  const { token } = useAuth();
  const { toast } = useToast();
  const [producers, setProducers] = useState<ProducerProfileResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("ALL");
  const [rejectId, setRejectId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    const params = filter !== "ALL" ? `?status=${filter}&size=100` : "?size=100";
    apiFetch<PageResponse<ProducerProfileResponse>>(`/producers/admin${params}`, { token })
      .then(r => setProducers(r.content))
      .catch(err => toast(err instanceof Error ? err.message : "Yüklenemedi", "error"))
      .finally(() => setLoading(false));
  }, [token, filter]);

  async function approve(id: number) {
    try {
      await apiFetch(`/producers/admin/${id}/approve`, { method: "POST", token: token! });
      setProducers(prev => prev.map(p => p.id === id ? { ...p, approvalStatus: "ACTIVE" } : p));
      toast("Üretici onaylandı ✓");
    } catch (err) { toast(err instanceof Error ? err.message : "Hata", "error"); }
  }

  async function reject(id: number, reason: string) {
    if (!reason.trim()) { toast("Gerekçe yazın", "error"); return; }
    try {
      await apiFetch(`/producers/admin/${id}/reject?reason=${encodeURIComponent(reason)}`, { method: "POST", token: token! });
      setProducers(prev => prev.map(p => p.id === id ? { ...p, approvalStatus: "INACTIVE", rejectionReason: reason } : p));
      toast("Üretici reddedildi");
      setRejectId(null);
      setRejectReason("");
    } catch (err) { toast(err instanceof Error ? err.message : "Hata", "error"); }
  }

  const filtered = producers.filter(p => {
    const matchFilter = filter === "ALL" || p.approvalStatus === filter;
    const matchSearch = !search ||
      p.storeName.toLowerCase().includes(search.toLowerCase()) ||
      p.ownerName?.toLowerCase().includes(search.toLowerCase()) ||
      p.ownerEmail?.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const pendingCount = producers.filter(p => p.approvalStatus === "PENDING_APPROVAL").length;

  return (
    <>
      <div className="admin-page-title">
        <h1>Üreticiler</h1>
        <p>Üretici başvurularını yönetin, onayla veya reddedin.</p>
      </div>

      {/* Özet kartları */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 24 }}>
        {[
          { label: "Toplam", val: producers.length, color: "#dbeafe" },
          { label: "Onay Bekliyor", val: pendingCount, color: pendingCount > 0 ? "#fef9c3" : "#f3f4f6", urgent: pendingCount > 0 },
          { label: "Aktif", val: producers.filter(p => p.approvalStatus === "ACTIVE").length, color: "#dcfce7" },
          { label: "Reddedildi", val: producers.filter(p => p.approvalStatus === "INACTIVE").length, color: "#fee2e2" },
        ].map(s => (
          <div key={s.label} className="card" style={{ padding: 16, background: s.color, border: "none" }}>
            <div style={{ fontFamily: "var(--font-display)", fontSize: "1.75rem", fontWeight: 700, color: s.urgent ? "#ca8a04" : "var(--text-primary)" }}>{s.val}</div>
            <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filtre + Arama */}
      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
        <div className="filter-search" style={{ maxWidth: 260 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input placeholder="Mağaza veya isim ara…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {[["ALL", "Tümü"], ["PENDING_APPROVAL", `Onay Bekliyor${pendingCount > 0 ? ` (${pendingCount})` : ""}`], ["ACTIVE", "Aktif"], ["INACTIVE", "Reddedildi"], ["BANNED", "Banlı"]].map(([v, l]) => (
            <button key={v} className={`cat-pill${filter === v ? " active" : ""}`}
              style={v === "PENDING_APPROVAL" && pendingCount > 0 ? { borderColor: "#ca8a04", color: filter === v ? undefined : "#ca8a04" } : {}}
              onClick={() => setFilter(v)}>{l}</button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: 64 }}><Spinner dark /></div>
      ) : filtered.length === 0 ? (
        <EmptyState icon="🌿" title="Üretici bulunamadı"
          desc={filter === "PENDING_APPROVAL" ? "Onay bekleyen başvuru yok." : "Bu filtreye uygun üretici yok."} />
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead><tr>
              <th>Mağaza</th><th>Sahibi</th><th>Şehir</th><th>Komisyon</th><th>Başvuru Tarihi</th><th>Durum</th><th>İşlemler</th>
            </tr></thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id} style={p.approvalStatus === "PENDING_APPROVAL" ? { background: "#fffbeb" } : {}}>
                  <td>
                    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                      {p.logoUrl
                        ? <img src={p.logoUrl} alt="" style={{ width: 36, height: 36, borderRadius: "50%", objectFit: "cover" }} />
                        : <div style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--olive-200)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🌿</div>
                      }
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 14 }}>{p.storeName}</div>
                        <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{p.ownerEmail}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ fontSize: 14 }}>{p.ownerName ?? "—"}</td>
                  <td style={{ fontSize: 14 }}>{p.cityName ?? "—"}</td>
                  <td style={{ fontSize: 14 }}>%{p.commissionRate ?? 10}</td>
                  <td style={{ fontSize: 13, color: "var(--text-muted)" }}>
                    {p.createdAt ? new Date(p.createdAt).toLocaleDateString("tr-TR") : "—"}
                  </td>
                  <td><StatusBadge status={p.approvalStatus} /></td>
                  <td>
                    <div style={{ display: "flex", gap: 6 }}>
                      {p.approvalStatus === "PENDING_APPROVAL" && (
                        <>
                          <button className="btn btn-primary btn-sm" onClick={() => approve(p.id)}>✓ Onayla</button>
                          <button className="btn btn-danger btn-sm" onClick={() => setRejectId(p.id)}>✕ Reddet</button>
                        </>
                      )}
                      {p.approvalStatus === "ACTIVE" && (
                        <button className="btn btn-ghost btn-sm" onClick={() => setRejectId(p.id)}>Askıya Al</button>
                      )}
                      {p.approvalStatus === "INACTIVE" && (
                        <button className="btn btn-primary btn-sm" onClick={() => approve(p.id)}>Tekrar Onayla</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Red Modal */}
      {rejectId && (
        <div className="modal-overlay" onClick={() => { setRejectId(null); setRejectReason(""); }}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Red / Askıya Alma Gerekçesi</h3>
              <button className="modal-close" onClick={() => { setRejectId(null); setRejectReason(""); }}>×</button>
            </div>
            <p style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 16 }}>
              {producers.find(p => p.id === rejectId)?.storeName} mağazası için gerekçe girin.
            </p>
            <div className="form-group" style={{ marginBottom: 16 }}>
              <label className="form-label">Gerekçe *</label>
              <textarea className="form-textarea" rows={3} value={rejectReason}
                onChange={e => setRejectReason(e.target.value)}
                placeholder="Örn: Eksik belge, yetersiz bilgi, kural ihlali…" />
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button className="btn btn-ghost" onClick={() => { setRejectId(null); setRejectReason(""); }}>İptal</button>
              <button className="btn btn-danger" onClick={() => reject(rejectId, rejectReason)}>Reddet</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
