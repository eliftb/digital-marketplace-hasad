"use client";
import { useEffect, useState } from "react";
import { apiFetch, qs } from "@/lib/api";
import { useAuth } from "@/components/AuthProvider";
import { useToast, StatusBadge, Spinner, EmptyState, Pagination } from "@/components/UI";
import type { OrderResponse, PageResponse, OrderStatus } from "@/lib/types";

const STATUS_OPTIONS: OrderStatus[] = ["PENDING","CONFIRMED","PREPARING","SHIPPED","DELIVERED","CANCELLED","REFUNDED"];

export default function AdminOrdersPage() {
  const { token } = useAuth();
  const { toast } = useToast();
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    const q = qs({ status: statusFilter || undefined, page, size: 20 });
    apiFetch<PageResponse<OrderResponse>>(`/orders/admin${q}`, { token })
      .then(r => { setOrders(r.content); setTotalPages(r.totalPages); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token, statusFilter, page]);

  async function updateStatus(orderId: number, status: OrderStatus) {
    try {
      await apiFetch(`/orders/${orderId}/status?status=${status}`, { method: "PATCH", token: token! });
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
      toast("Sipariş durumu güncellendi");
    } catch (err) { toast(err instanceof Error ? err.message : "Hata", "error"); }
  }

  return (
    <>
      <div className="admin-page-title"><h1>Siparişler</h1><p>Tüm platform siparişlerini yönetin.</p></div>

      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        <button className={`cat-pill${!statusFilter ? " active" : ""}`} onClick={() => setStatusFilter("")}>Tümü</button>
        {STATUS_OPTIONS.map(s => (
          <button key={s} className={`cat-pill${statusFilter === s ? " active" : ""}`} onClick={() => setStatusFilter(s)}>{s}</button>
        ))}
      </div>

      {loading ? <div style={{ textAlign: "center", padding: 64 }}><Spinner dark /></div> :
       orders.length === 0 ? <EmptyState icon="🚚" title="Sipariş bulunamadı" /> : (
        <>
          <div className="table-wrap">
            <table className="data-table">
              <thead><tr><th>Sipariş No</th><th>Ürünler</th><th>Teslimat</th><th>Tutar</th><th>Durum</th><th>Tarih</th><th>Güncelle</th></tr></thead>
              <tbody>
                {orders.map(o => (
                  <tr key={o.id}>
                    <td style={{ fontWeight: 700 }}>#{o.orderNumber}</td>
                    <td style={{ fontSize: 13, maxWidth: 200 }}>{o.items.map(i => `${i.productName} ×${i.quantity}`).join(", ")}</td>
                    <td style={{ fontSize: 13 }}>{o.deliveryType === "SHIPPING" ? "🚚 Kargo" : "📦 Teslim"}</td>
                    <td style={{ fontWeight: 700 }}>₺{o.totalAmount.toFixed(2)}</td>
                    <td><StatusBadge status={o.status} /></td>
                    <td style={{ fontSize: 13, color: "var(--text-muted)" }}>{new Date(o.createdAt).toLocaleDateString("tr-TR")}</td>
                    <td>
                      <select className="form-select" style={{ fontSize: 12, padding: "4px 8px", width: "auto" }}
                        value={o.status} onChange={e => updateStatus(o.id, e.target.value as OrderStatus)}>
                        {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </>
      )}
    </>
  );
}
