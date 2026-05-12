"use client";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/components/AuthProvider";
import { useToast, StatusBadge, Spinner, EmptyState } from "@/components/UI";
import type { PaymentResponse, PageResponse } from "@/lib/types";

export default function AdminPaymentsPage() {
  const { token } = useAuth();
  const { toast } = useToast();
  const [payments, setPayments] = useState<PaymentResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    // Tüm ödemeleri çek: ilk sayfa 50, sonra gerekirse devam et
    async function loadAll() {
      try {
        const first = await apiFetch<PageResponse<PaymentResponse>>(
          "/payments/admin?page=0&size=100", { token: token ?? undefined }
        );
        let all = first.content ?? [];
        // Birden fazla sayfa varsa devamını da çek
        for (let p = 1; p < Math.min(first.totalPages ?? 1, 10); p++) {
          const next = await apiFetch<PageResponse<PaymentResponse>>(
            `/payments/admin?page=${p}&size=100`, { token: token ?? undefined }
          );
          all = [...all, ...(next.content ?? [])];
        }
        setPayments(all);
      } catch (err: any) {
        toast(err?.message ?? "Ödemeler yüklenemedi", "error");
      } finally {
        setLoading(false);
      }
    }
    loadAll();
  }, [token]);

  async function refund(id: number) {
    try {
      await apiFetch(`/payments/admin/${id}/refund`, { method: "POST", token: token! });
      setPayments(prev => prev.map(p => p.id === id ? { ...p, status: "REFUNDED" } : p));
      toast("Ödeme iade edildi");
    } catch (err) { toast(err instanceof Error ? err.message : "Hata", "error"); }
  }

  const total = payments.filter(p => p.status === "COMPLETED").reduce((s, p) => s + p.amount, 0);

  return (
    <>
      <div className="admin-page-title"><h1>Ödemeler</h1><p>Platform ödemelerini görüntüleyin ve yönetin.</p></div>

      <div style={{ display: "flex", gap: 16, marginBottom: 24 }}>
        {[
          { label: "Toplam Tahsilat", val: `₺${total.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}`, color: "#dcfce7" },
          { label: "Bekleyen", val: payments.filter(p => p.status === "PENDING").length, color: "#fef9c3" },
          { label: "İade", val: payments.filter(p => p.status === "REFUNDED").length, color: "#fee2e2" },
        ].map(s => (
          <div key={s.label} className="card" style={{ padding: 16, background: s.color, border: "none", flex: 1 }}>
            <div style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem", fontWeight: 700 }}>{s.val}</div>
            <div style={{ fontSize: 13, color: "var(--text-muted)" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {loading ? <div style={{ textAlign: "center", padding: 64 }}><Spinner dark /></div> :
       payments.length === 0 ? <EmptyState icon="💳" title="Ödeme bulunamadı" /> : (
        <div className="table-wrap">
          <table className="data-table">
            <thead><tr><th>Sipariş No</th><th>Tutar</th><th>Yöntem</th><th>İşlem ID</th><th>Durum</th><th>Tarih</th><th>İşlemler</th></tr></thead>
            <tbody>
              {payments.map(p => (
                <tr key={p.id}>
                  <td style={{ fontWeight: 700 }}>#{p.orderNumber}</td>
                  <td style={{ fontWeight: 700 }}>₺{p.amount.toFixed(2)}</td>
                  <td style={{ fontSize: 13 }}>{p.method === "CREDIT_CARD" ? "💳 Kredi Kartı" : "🏦 Banka"}</td>
                  <td style={{ fontSize: 13, color: "var(--text-muted)" }}>{p.transactionId ?? "—"}</td>
                  <td><StatusBadge status={p.status} /></td>
                  <td style={{ fontSize: 13, color: "var(--text-muted)" }}>{new Date(p.createdAt).toLocaleDateString("tr-TR")}</td>
                  <td>{p.status === "COMPLETED" && <button className="btn btn-ghost btn-sm" onClick={() => refund(p.id)}>İade Et</button>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
