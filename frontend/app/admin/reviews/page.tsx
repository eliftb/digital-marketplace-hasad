"use client";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/components/AuthProvider";
import { useToast, Stars, StatusBadge, Spinner, EmptyState } from "@/components/UI";
import type { ReviewResponse, PageResponse } from "@/lib/types";

export default function AdminReviewsPage() {
  const { token } = useAuth();
  const { toast } = useToast();
  const [reviews, setReviews] = useState<ReviewResponse[]>([]);
  const [tab, setTab] = useState<"pending" | "all">("pending");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    const endpoint = tab === "pending"
      ? "/reviews/admin/pending?page=0&size=50"
      : "/reviews/admin?page=0&size=50";
    apiFetch<PageResponse<ReviewResponse>>(endpoint, { token })
      .then(r => setReviews(r.content))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token, tab]);

  async function approve(id: number) {
    try {
      await apiFetch(`/reviews/admin/${id}/approve`, { method: "POST", token: token! });
      setReviews(prev => prev.map(r => r.id === id ? { ...r, approved: true } : r));
      toast("Değerlendirme onaylandı ✓");
    } catch (err) { toast(err instanceof Error ? err.message : "Hata", "error"); }
  }

  async function deleteReview(id: number) {
    try {
      await apiFetch(`/reviews/admin/${id}`, { method: "DELETE", token: token! });
      setReviews(prev => prev.filter(r => r.id !== id));
      toast("Değerlendirme silindi");
    } catch (err) { toast(err instanceof Error ? err.message : "Hata", "error"); }
  }

  return (
    <>
      <div className="admin-page-title"><h1>Değerlendirmeler</h1><p>Onay bekleyen ve mevcut değerlendirmeleri yönetin.</p></div>

      <div style={{ display: "flex", gap: 4, marginBottom: 20 }}>
        <button className={`cat-pill${tab === "pending" ? " active" : ""}`} onClick={() => setTab("pending")}>Onay Bekliyor</button>
        <button className={`cat-pill${tab === "all" ? " active" : ""}`} onClick={() => setTab("all")}>Tümü</button>
      </div>

      {loading ? <div style={{ textAlign: "center", padding: 64 }}><Spinner dark /></div> :
       reviews.length === 0 ? <EmptyState icon="⭐" title="Değerlendirme bulunamadı" desc={tab === "pending" ? "Onay bekleyen değerlendirme yok." : "Henüz değerlendirme yok."} /> : (
        <div className="table-wrap">
          <table className="data-table">
            <thead><tr><th>Ürün</th><th>Kullanıcı</th><th>Puan</th><th>Yorum</th><th>Durum</th><th>İşlemler</th></tr></thead>
            <tbody>
              {reviews.map(r => (
                <tr key={r.id}>
                  <td style={{ fontSize: 13, fontWeight: 600 }}>{r.productName}</td>
                  <td style={{ fontSize: 13 }}>{r.consumerName}</td>
                  <td><Stars rating={r.rating} /></td>
                  <td style={{ fontSize: 13, maxWidth: 240 }}>{r.comment}</td>
                  <td><StatusBadge status={r.approved ? "ACTIVE" : "PENDING"} /></td>
                  <td>
                    <div style={{ display: "flex", gap: 6 }}>
                      {!r.approved && <button className="btn btn-primary btn-sm" onClick={() => approve(r.id)}>Onayla</button>}
                      <button className="btn btn-danger btn-sm" onClick={() => deleteReview(r.id)}>Sil</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
