"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/components/AuthProvider";
import { useToast, Spinner, EmptyState, Modal } from "@/components/UI";
import type { AddressResponse, OrderResponse } from "@/lib/types";

// Cart types (backend CartResponse'a uygun)
interface CartItemResponse {
  id: number;
  productId: number;
  productName: string;
  productSlug: string;
  imageUrl?: string;
  producerStoreName?: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
  stockQuantity: number;
  stockSufficient: boolean;
}

interface CartResponse {
  id: number;
  items: CartItemResponse[];
  totalItemCount: number;
  totalAmount: number;
  updatedAt: string;
}

export default function CartPage() {
  const { token, user, ready } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [cart, setCart] = useState<CartResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [showOrder, setShowOrder] = useState(false);
  const [addresses, setAddresses] = useState<AddressResponse[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<number | null>(null);
  const [ordering, setOrdering] = useState(false);

  // Auth kontrolü
  useEffect(() => {
    if (ready && !user) router.replace("/auth");
  }, [ready, user, router]);

  const fetchCart = useCallback(async () => {
    if (!token) return;
    try {
      const res = await apiFetch<{ data: CartResponse }>("/cart", { token });
      setCart((res as any).data ?? res as any);
    } catch {
      toast("Sepet yüklenemedi", "error");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchCart(); }, [fetchCart]);

  useEffect(() => {
    if (!token) return;
    apiFetch<AddressResponse[]>("/addresses", { token })
      .then(setAddresses)
      .catch(() => {});
  }, [token]);

  async function updateQty(productId: number, qty: number) {
    if (!token) return;
    setUpdatingId(productId);
    try {
      const res = await apiFetch<any>(`/cart/items/${productId}`, {
        method: "PATCH", token,
        body: { quantity: qty },
      });
      setCart(res.data ?? res);
    } catch (err) {
      toast(err instanceof Error ? err.message : "Güncellenemedi", "error");
    } finally { setUpdatingId(null); }
  }

  async function removeItem(productId: number) {
    if (!token) return;
    setUpdatingId(productId);
    try {
      const res = await apiFetch<any>(`/cart/items/${productId}`, { method: "DELETE", token });
      setCart(res.data ?? res);
      toast("Ürün sepetten çıkarıldı");
    } catch { toast("Çıkarılamadı", "error"); }
    finally { setUpdatingId(null); }
  }

  async function clearCart() {
    if (!token) return;
    try {
      await apiFetch("/cart", { method: "DELETE", token });
      setCart(prev => prev ? { ...prev, items: [], totalAmount: 0, totalItemCount: 0 } : prev);
      toast("Sepet temizlendi");
    } catch { toast("Hata oluştu", "error"); }
  }

  async function placeOrder() {
    if (!token || !cart) return;
    setOrdering(true);
    try {
      const res = await apiFetch<OrderResponse>("/orders", {
        method: "POST", token,
        body: {
          deliveryType: "SHIPPING",
          shippingAddressId: selectedAddress,
          items: cart.items.map(i => ({ productId: i.productId, quantity: i.quantity })),
        },
      });
      // Siparişten sonra sepeti temizle
      await apiFetch("/cart", { method: "DELETE", token }).catch(() => {});
      toast(`Sipariş #${res.orderNumber} oluşturuldu! 🎉`);
      setShowOrder(false);
      router.push("/orders");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Sipariş verilemedi", "error");
    } finally { setOrdering(false); }
  }

  if (!ready || loading) {
    return <div style={{ display: "flex", justifyContent: "center", padding: 80 }}><Spinner dark /></div>;
  }

  const hasStockIssue = cart?.items.some(i => !i.stockSufficient);

  return (
    <div className="container" style={{ paddingTop: 40, paddingBottom: 64 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32 }}>
        <div>
          <div className="section-label">Alışveriş</div>
          <h2>Sepetim {cart && cart.totalItemCount > 0 && (
            <span style={{ fontSize: "1rem", color: "var(--text-muted)", fontFamily: "var(--font-body)", fontWeight: 400 }}>
              ({cart.totalItemCount} ürün)
            </span>
          )}</h2>
        </div>
        {cart && cart.items.length > 0 && (
          <button className="btn btn-ghost btn-sm" onClick={clearCart} style={{ color: "#dc3545" }}>
            🗑 Sepeti Temizle
          </button>
        )}
      </div>

      {!cart || cart.items.length === 0 ? (
        <EmptyState
          icon="🛒"
          title="Sepetiniz boş"
          desc="Ürünleri keşfedin ve sepete ekleyin."
          action={<Link href="/" className="btn btn-primary">Alışverişe Başla</Link>}
        />
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 24, alignItems: "start" }}>
          {/* Items */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {cart.items.map(item => (
              <div key={item.productId} className="card" style={{
                padding: 20, display: "flex", gap: 16, alignItems: "center",
                opacity: updatingId === item.productId ? 0.6 : 1, transition: "opacity 200ms"
              }}>
                {/* Image */}
                <Link href={`/products/${item.productId}`}>
                  <div style={{ width: 80, height: 80, borderRadius: "var(--radius)", overflow: "hidden", background: "var(--cream-100)", flexShrink: 0 }}>
                    {item.imageUrl
                      ? <img src={item.imageUrl} alt={item.productName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>🌿</div>
                    }
                  </div>
                </Link>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <Link href={`/products/${item.productId}`}>
                    <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 3, color: "var(--text-primary)" }}>{item.productName}</div>
                  </Link>
                  {item.producerStoreName && (
                    <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 6 }}>{item.producerStoreName}</div>
                  )}
                  <div style={{ fontSize: 14, fontWeight: 600, color: "var(--olive-700)" }}>
                    ₺{item.unitPrice.toFixed(2)} / adet
                  </div>
                  {!item.stockSufficient && (
                    <div style={{ fontSize: 12, color: "#dc3545", marginTop: 4 }}>
                      ⚠️ Stok yetersiz (maks. {item.stockQuantity})
                    </div>
                  )}
                </div>

                {/* Qty control */}
                <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
                  <div className="quantity-control">
                    <button
                      onClick={() => item.quantity > 1 ? updateQty(item.productId, item.quantity - 1) : removeItem(item.productId)}
                      disabled={updatingId === item.productId}
                    >−</button>
                    <span>{item.quantity}</span>
                    <button
                      onClick={() => updateQty(item.productId, item.quantity + 1)}
                      disabled={updatingId === item.productId || item.quantity >= item.stockQuantity}
                    >+</button>
                  </div>
                </div>

                {/* Subtotal */}
                <div style={{ minWidth: 80, textAlign: "right" }}>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem", fontWeight: 700, color: "var(--olive-700)" }}>
                    ₺{item.subtotal.toFixed(2)}
                  </div>
                </div>

                {/* Remove */}
                <button
                  onClick={() => removeItem(item.productId)}
                  disabled={updatingId === item.productId}
                  style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--cream-200)", border: "none", cursor: "pointer", fontSize: 16, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", transition: "var(--transition)" }}
                >×</button>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="card" style={{ padding: 24, position: "sticky", top: "calc(var(--nav-h) + 16px)" }}>
            <h3 style={{ marginBottom: 20 }}>Sipariş Özeti</h3>

            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
              {cart.items.map(i => (
                <div key={i.productId} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "var(--text-secondary)" }}>
                  <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginRight: 8 }}>
                    {i.productName} ×{i.quantity}
                  </span>
                  <span style={{ fontWeight: 600, flexShrink: 0 }}>₺{i.subtotal.toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div style={{ borderTop: "1px solid var(--border-light)", paddingTop: 16, marginBottom: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <span style={{ fontSize: 15, fontWeight: 600 }}>Toplam</span>
                <span style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem", fontWeight: 700, color: "var(--olive-700)" }}>
                  ₺{cart.totalAmount.toFixed(2)}
                </span>
              </div>
              <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>KDV dahil</div>
            </div>

            {hasStockIssue && (
              <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "var(--radius-sm)", padding: "10px 14px", fontSize: 13, color: "#dc2626", marginBottom: 16 }}>
                ⚠️ Stok yetersiz olan ürünleri düzeltin.
              </div>
            )}

            {user?.role === "CONSUMER" ? (
              <button
                className="btn btn-primary btn-lg btn-block"
                disabled={hasStockIssue || cart.items.length === 0}
                onClick={() => setShowOrder(true)}
              >
                🛒 Siparişi Tamamla
              </button>
            ) : (
              <Link href="/auth" className="btn btn-primary btn-lg btn-block" style={{ textAlign: "center" }}>
                Giriş Yap & Sipariş Ver
              </Link>
            )}

            <Link href="/" className="btn btn-ghost btn-block" style={{ marginTop: 10, justifyContent: "center" }}>
              ← Alışverişe Devam Et
            </Link>
          </div>
        </div>
      )}

      {/* Order Confirm Modal */}
      <Modal open={showOrder} onClose={() => setShowOrder(false)} title="Siparişi Onayla">
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ background: "var(--cream-50)", border: "1px solid var(--border-light)", borderRadius: "var(--radius-sm)", padding: 16 }}>
            <div style={{ fontWeight: 600, marginBottom: 8 }}>Sipariş Özeti</div>
            {cart?.items.map(i => (
              <div key={i.productId} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}>
                <span>{i.productName} ×{i.quantity}</span>
                <span>₺{i.subtotal.toFixed(2)}</span>
              </div>
            ))}
            <div style={{ borderTop: "1px solid var(--border-light)", marginTop: 10, paddingTop: 10, fontWeight: 700, display: "flex", justifyContent: "space-between" }}>
              <span>Toplam</span>
              <span>₺{cart?.totalAmount.toFixed(2)}</span>
            </div>
          </div>

          {/* Address selection */}
          {addresses.length > 0 && (
            <div className="form-group">
              <label className="form-label">Teslimat Adresi</label>
              {addresses.map(a => (
                <div
                  key={a.id}
                  onClick={() => setSelectedAddress(a.id)}
                  style={{
                    padding: "10px 14px", border: `1.5px solid ${selectedAddress === a.id ? "var(--olive-500)" : "var(--border)"}`,
                    borderRadius: "var(--radius-sm)", marginBottom: 8, cursor: "pointer",
                    background: selectedAddress === a.id ? "var(--olive-50)" : "var(--surface)",
                    transition: "var(--transition)"
                  }}
                >
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{a.title} {a.isDefault && <span style={{ fontSize: 11, color: "var(--olive-600)" }}>• Varsayılan</span>}</div>
                  <div style={{ fontSize: 13, color: "var(--text-muted)" }}>{a.fullName} — {a.address}, {a.districtName}/{a.cityName}</div>
                </div>
              ))}
              <Link href="/addresses" style={{ fontSize: 13, color: "var(--olive-600)" }}>+ Yeni adres ekle</Link>
            </div>
          )}

          {addresses.length === 0 && (
            <div style={{ fontSize: 14, color: "var(--text-muted)" }}>
              Teslimat adresi eklemediniz. <Link href="/addresses" style={{ color: "var(--olive-600)" }}>Adres ekle</Link>
            </div>
          )}

          <button
            className="btn btn-primary btn-block btn-lg"
            onClick={placeOrder}
            disabled={ordering || (addresses.length > 0 && !selectedAddress)}
          >
            {ordering ? <><Spinner /> İşleniyor…</> : "Siparişi Ver 🎉"}
          </button>
        </div>
      </Modal>
    </div>
  );
}
