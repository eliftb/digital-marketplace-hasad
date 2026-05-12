"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/components/AuthProvider";
import { useToast, StatusBadge, Spinner, EmptyState } from "@/components/UI";
import type { OrderResponse, PageResponse } from "@/lib/types";

export default function OrdersPage() {
  const { token, user, ready } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (ready && !user) router.replace("/auth");
  }, [ready, user, router]);

  useEffect(() => {
    if (!token) return;
    apiFetch<PageResponse<OrderResponse>>("/orders/my?page=0&size=20", { token })
      .then(r => setOrders(r.content))
      .catch(() => toast("Siparişler yüklenemedi", "error"))
      .finally(() => setLoading(false));
  }, [token]);

  if (!ready || loading) return <div style={{ display: "flex", justifyContent: "center", padding: 80 }}><Spinner dark /></div>;

  return (
    <div className="container" style={{ paddingTop: 40, paddingBottom: 64 }}>
      <div className="section-header" style={{ marginBottom: 32 }}>
        <div>
          <div className="section-label">Hesabım</div>
          <h2>Siparişlerim</h2>
        </div>
      </div>

      {orders.length === 0 ? (
        <EmptyState icon="🛍️" title="Henüz siparişiniz yok"
          desc="Ürünleri keşfedin ve ilk siparişinizi verin."
          action={<Link href="/" className="btn btn-primary">Ürünleri Keşfet</Link>} />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {orders.map(o => (
            <div key={o.id} className="order-card">
              <div className="order-card-header">
                <div>
                  <div className="order-number">Sipariş #{o.orderNumber}</div>
                  <div className="order-date">{new Date(o.createdAt).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })}</div>
                </div>
                <StatusBadge status={o.status} />
              </div>
              <div className="order-items">
                {o.items.map(item => (
                  <div key={item.id} className="order-item">
                    <div style={{ flex: 1 }}>
                      <div className="order-item-name">{item.productName}</div>
                      <div className="order-item-detail">{item.producerStoreName} • {item.quantity} adet • ₺{item.unitPrice.toFixed(2)}/adet</div>
                    </div>
                    <div style={{ fontWeight: 700 }}>₺{item.subtotal.toFixed(2)}</div>
                  </div>
                ))}
              </div>
              <div className="order-card-footer">
                <div>
                  <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 2 }}>
                    {o.deliveryType === "SHIPPING" ? "🚚 Kargo" : "📦 Teslim Alma"}
                  </div>
                  <div className="order-total">₺{o.totalAmount.toFixed(2)}</div>
                </div>
                {(o.status === "PENDING" || o.status === "CONFIRMED") && (
                  <button className="btn btn-danger btn-sm" onClick={async () => {
                    try {
                      await apiFetch(`/orders/${o.id}/cancel`, { method: "PATCH", token: token! });
                      setOrders(prev => prev.map(x => x.id === o.id ? { ...x, status: "CANCELLED" } : x));
                      toast("Sipariş iptal edildi");
                    } catch (err) {
                      toast(err instanceof Error ? err.message : "İptal edilemedi", "error");
                    }
                  }}>İptal Et</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
