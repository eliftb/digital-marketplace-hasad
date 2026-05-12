"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/components/AuthProvider";
import { useToast, Stars, Spinner, Modal, EmptyState } from "@/components/UI";
import type { ProductResponse, ReviewResponse, PageResponse, AddressResponse, OrderResponse } from "@/lib/types";

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { token, user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const [product, setProduct] = useState<ProductResponse | null>(null);
  const [imgIdx, setImgIdx] = useState(0);
  const [qty, setQty] = useState(1);
  const [isFav, setIsFav] = useState(false);
  const [reviews, setReviews] = useState<ReviewResponse[]>([]);
  const [showOrder, setShowOrder] = useState(false);
  const [addresses, setAddresses] = useState<AddressResponse[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<number | null>(null);
  const [ordering, setOrdering] = useState(false);
  const [addingCart, setAddingCart] = useState(false);
  const [purchasedOrderItems, setPurchasedOrderItems] = useState<{ id: number }[]>([]);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiFetch<ProductResponse>(`/products/${id}`),
      apiFetch<PageResponse<ReviewResponse>>(`/reviews/product/${id}?page=0&size=20`).catch(() => ({ content: [] as ReviewResponse[] })),
    ]).then(([p, r]) => {
      setProduct(p);
      setReviews(r.content);
      setQty(p.minOrderQuantity ?? 1);
    }).catch(() => toast("Ürün bulunamadı", "error"))
    .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!token) return;
    apiFetch<{ isFavorite: boolean }>(`/favorites/${id}/check`, { token })
      .then(r => setIsFav(r.isFavorite)).catch(() => {});
    apiFetch<AddressResponse[]>("/addresses", { token })
      .then(data => { setAddresses(data); const def = data.find(a => a.isDefault); if (def) setSelectedAddress(def.id); })
      .catch(() => {});
    if (user?.role === "CONSUMER") {
      apiFetch<PageResponse<OrderResponse>>("/orders/my?page=0&size=50", { token })
        .then(r => {
          const items: { id: number }[] = [];
          r.content.forEach(order => {
            if (order.status === "DELIVERED") {
              order.items.forEach(item => { if (item.productId === Number(id)) items.push({ id: item.id }); });
            }
          });
          setPurchasedOrderItems(items);
        }).catch(() => {});
    }
  }, [id, token, user]);

  async function toggleFav() {
    if (!token) { toast("Favoriye eklemek için giriş yapın", "error"); return; }
    const prev = isFav; setIsFav(!prev);
    try {
      if (prev) { await apiFetch(`/favorites/${id}`, { method: "DELETE", token }); toast("Favorilerden çıkarıldı"); }
      else { await apiFetch(`/favorites/${id}`, { method: "POST", token }); toast("Favorilere eklendi ❤️"); }
    } catch (err) { setIsFav(prev); toast(err instanceof Error ? err.message : "Hata", "error"); }
  }

  async function addToCart() {
    if (!token) { toast("Sepete eklemek için giriş yapın", "error"); return; }
    setAddingCart(true);
    try {
      await apiFetch("/cart/items", { method: "POST", token, body: { productId: Number(id), quantity: qty } });
      toast("Sepete eklendi 🛒");
    } catch (err) { toast(err instanceof Error ? err.message : "Sepete eklenemedi", "error"); }
    finally { setAddingCart(false); }
  }

  async function placeOrder() {
    if (!token) return;
    setOrdering(true);
    try {
      const res = await apiFetch<OrderResponse>("/orders", {
        method: "POST", token,
        body: { deliveryType: "SHIPPING", shippingAddressId: selectedAddress, items: [{ productId: Number(id), quantity: qty }] },
      });
      toast(`Sipariş #${res.orderNumber} oluşturuldu! 🎉`);
      setShowOrder(false);
      router.push("/orders");
    } catch (err) { toast(err instanceof Error ? err.message : "Sipariş verilemedi", "error"); }
    finally { setOrdering(false); }
  }

  async function submitReview() {
    if (!token || purchasedOrderItems.length === 0) return;
    setSubmittingReview(true);
    try {
      const res = await apiFetch<ReviewResponse>("/reviews", {
        method: "POST", token,
        body: { productId: Number(id), orderItemId: purchasedOrderItems[0].id, rating: reviewRating, comment: reviewComment },
      });
      toast("Yorumunuz onay için gönderildi ✓");
      setShowReviewForm(false); setReviewComment(""); setReviewRating(5);
    } catch (err) { toast(err instanceof Error ? err.message : "Yorum gönderilemedi", "error"); }
    finally { setSubmittingReview(false); }
  }

  if (loading) return <div style={{ display: "flex", justifyContent: "center", padding: 80 }}><Spinner dark /></div>;
  if (!product) return <div className="container" style={{ padding: 64, textAlign: "center" }}><h2>Ürün bulunamadı</h2><Link href="/" className="btn btn-outline" style={{ marginTop: 16 }}>Ana Sayfaya Dön</Link></div>;

  const imgs = product.imageUrls?.length ? product.imageUrls : ["https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=600&fit=crop"];

  return (
    <div className="container">
      <div style={{ padding: "20px 0 0", display: "flex", gap: 6, fontSize: 13, color: "var(--text-muted)" }}>
        <Link href="/">Ana sayfa</Link> / <span>{product.category?.name}</span> / <span style={{ color: "var(--text-primary)" }}>{product.name}</span>
      </div>

      <div className="product-detail">
        <div className="product-gallery">
          <div className="product-gallery-main"><img src={imgs[imgIdx]} alt={product.name} /></div>
          {imgs.length > 1 && (
            <div className="product-gallery-thumbs">
              {imgs.map((img, i) => (
                <div key={i} className={`product-gallery-thumb${i === imgIdx ? " active" : ""}`} onClick={() => setImgIdx(i)}>
                  <img src={img} alt="" />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="product-info">
          {product.producer && (
            <div className="product-info-producer">
              {product.producer.logoUrl && <img src={product.producer.logoUrl} alt="" />}
              <Link href={`/producers/${product.producer.id}`} style={{ color: "var(--olive-600)", fontWeight: 600, fontSize: 14 }}>
                {product.producer.storeName}
              </Link>
              {product.producer.cityName && <span style={{ fontSize: 13, color: "var(--text-muted)" }}>• {product.producer.cityName}</span>}
            </div>
          )}

          <h1 style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)" }}>{product.name}</h1>
          {product.rating && <Stars rating={product.rating} count={product.ratingCount} />}

          <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
            <span style={{ fontFamily: "var(--font-display)", fontSize: "2rem", fontWeight: 700, color: "var(--olive-700)" }}>
              ₺{product.price.toFixed(2)}
            </span>
            {product.unit && <span style={{ color: "var(--text-muted)" }}>/ {product.unit}</span>}
          </div>

          {product.description && <p style={{ lineHeight: 1.7 }}>{product.description}</p>}

          <div className="product-delivery-badges">
            {(product.deliveryType === "SHIPPING" || product.deliveryType === "BOTH") && <div className="delivery-badge">🚚 Kargo ile teslimat</div>}
            {(product.deliveryType === "PICKUP" || product.deliveryType === "BOTH") && <div className="delivery-badge">📦 Yerinden teslim</div>}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 14, color: "var(--text-muted)" }}>Miktar:</span>
            <div className="quantity-control">
              <button onClick={() => setQty(q => Math.max(product.minOrderQuantity ?? 1, q - 1))}>−</button>
              <span>{qty}</span>
              <button onClick={() => setQty(q => Math.min(product.stockQuantity, q + 1))}>+</button>
            </div>
            <span style={{ fontSize: 13, color: "var(--text-muted)" }}>Stok: {product.stockQuantity} {product.unit}</span>
          </div>

          {user?.role === "CONSUMER" ? (
            <div className="product-cta">
              <button className="btn btn-outline btn-lg" style={{ flex: 1 }} onClick={addToCart} disabled={addingCart}>
                {addingCart ? <><Spinner dark /> Ekleniyor…</> : "🛒 Sepete Ekle"}
              </button>
              <button className="btn btn-primary btn-lg" style={{ flex: 1 }} onClick={() => setShowOrder(true)}>✓ Hemen Satın Al</button>
              <button className="btn btn-outline btn-lg" onClick={toggleFav} style={{ width: 56, padding: 0, justifyContent: "center" }}>{isFav ? "❤️" : "🤍"}</button>
            </div>
          ) : !user ? (
            <div className="product-cta">
              <Link href="/auth" className="btn btn-primary btn-lg" style={{ flex: 1, textAlign: "center" }}>Giriş Yap & Satın Al</Link>
              <button className="btn btn-outline btn-lg" onClick={toggleFav} style={{ width: 56, padding: 0, justifyContent: "center" }}>{isFav ? "❤️" : "🤍"}</button>
            </div>
          ) : null}

          <div style={{ background: "var(--cream-50)", border: "1px solid var(--border-light)", borderRadius: "var(--radius)", padding: 16 }}>
            <div style={{ fontSize: 13, color: "var(--text-secondary)", display: "flex", flexDirection: "column", gap: 6 }}>
              <div>📦 <strong>Stok:</strong> {product.stockQuantity > 0 ? `${product.stockQuantity} adet mevcut` : "Stok tükendi"}</div>
              {!!product.soldCount && <div>✓ <strong>{product.soldCount} kez</strong> satıldı</div>}
            </div>
          </div>
        </div>
      </div>

      {/* Yorumlar */}
      <div style={{ padding: "48px 0", borderTop: "1px solid var(--border-light)", marginTop: 48 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
          <div>
            <div className="section-label">Müşteri Görüşleri</div>
            <h3 style={{ margin: 0 }}>Yorumlar{reviews.length > 0 && <span style={{ fontWeight: 400, fontSize: "1rem", color: "var(--text-muted)" }}> ({reviews.length})</span>}</h3>
          </div>
          {user?.role === "CONSUMER" ? (
            purchasedOrderItems.length > 0 ? (
              <button className="btn btn-primary btn-sm" onClick={() => setShowReviewForm(true)}>✏️ Yorum Yaz</button>
            ) : (
              <div style={{ fontSize: 13, color: "var(--text-muted)", background: "var(--cream-100)", padding: "8px 14px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-light)" }}>
                🔒 Yorum için bu ürünü satın alıp teslim almalısınız
              </div>
            )
          ) : !user ? <Link href="/auth" style={{ fontSize: 13, color: "var(--olive-600)" }}>Yorum yazmak için giriş yapın →</Link> : null}
        </div>

        {reviews.length === 0 ? (
          <EmptyState icon="💬" title="Henüz yorum yok" desc="Bu ürün için ilk yorumu siz yapın." />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {reviews.map(r => (
              <div key={r.id} className="card" style={{ padding: 20 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--olive-600)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14, flexShrink: 0 }}>
                    {r.consumerName?.[0] ?? "?"}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{r.consumerName}</div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{new Date(r.createdAt).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })}</div>
                  </div>
                  <div style={{ marginLeft: "auto" }}><Stars rating={r.rating} /></div>
                </div>
                {r.comment && <p style={{ fontSize: 14, lineHeight: 1.7, margin: 0 }}>{r.comment}</p>}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sipariş Modal */}
      <Modal open={showOrder} onClose={() => setShowOrder(false)} title="Siparişi Onayla">
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ padding: 16, background: "var(--cream-50)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-light)" }}>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>{product.name}</div>
            <div style={{ fontSize: 14, color: "var(--text-muted)" }}>{qty} {product.unit} × ₺{product.price.toFixed(2)} = <strong>₺{(qty * product.price).toFixed(2)}</strong></div>
          </div>
          {addresses.length > 0 ? (
            <div className="form-group">
              <label className="form-label">Teslimat Adresi</label>
              {addresses.map(a => (
                <div key={a.id} onClick={() => setSelectedAddress(a.id)}
                  style={{ padding: "10px 14px", marginBottom: 8, cursor: "pointer", border: `1.5px solid ${selectedAddress === a.id ? "var(--olive-500)" : "var(--border)"}`, borderRadius: "var(--radius-sm)", background: selectedAddress === a.id ? "var(--olive-50)" : "var(--surface)", transition: "var(--transition)" }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{a.title} {a.isDefault && <span style={{ fontSize: 11, color: "var(--olive-600)" }}>• Varsayılan</span>}</div>
                  <div style={{ fontSize: 13, color: "var(--text-muted)" }}>{a.fullName} — {a.address}, {a.districtName}/{a.cityName}</div>
                </div>
              ))}
              <Link href="/addresses" style={{ fontSize: 13, color: "var(--olive-600)" }}>+ Yeni adres ekle</Link>
            </div>
          ) : (
            <div style={{ fontSize: 14, color: "var(--text-muted)" }}>Kayıtlı adresiniz yok. <Link href="/addresses" style={{ color: "var(--olive-600)" }}>Adres ekle</Link></div>
          )}
          <button className="btn btn-primary btn-block btn-lg" onClick={placeOrder} disabled={ordering}>
            {ordering ? <><Spinner /> İşleniyor…</> : "Siparişi Ver 🎉"}
          </button>
        </div>
      </Modal>

      {/* Yorum Modal */}
      <Modal open={showReviewForm} onClose={() => setShowReviewForm(false)} title="Yorum Yaz">
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ background: "var(--olive-50)", padding: "10px 14px", borderRadius: "var(--radius-sm)", fontSize: 13, color: "var(--olive-700)", border: "1px solid var(--olive-200)" }}>
            ✓ Bu ürünü satın aldınız — yorum yazabilirsiniz
          </div>
          <div className="form-group">
            <label className="form-label">Puanınız</label>
            <div style={{ display: "flex", gap: 4 }}>
              {[1,2,3,4,5].map(star => (
                <button key={star} onClick={() => setReviewRating(star)}
                  style={{ fontSize: 32, background: "none", border: "none", cursor: "pointer", color: star <= reviewRating ? "var(--gold-500)" : "var(--cream-300)", transition: "color 150ms" }}>★</button>
              ))}
              <span style={{ fontSize: 14, color: "var(--text-muted)", alignSelf: "center", marginLeft: 4 }}>{reviewRating}/5</span>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Yorumunuz</label>
            <textarea className="form-textarea" rows={4} placeholder="Ürün hakkındaki deneyiminizi paylaşın…"
              value={reviewComment} onChange={e => setReviewComment(e.target.value)} maxLength={1000} />
            <span className="form-hint">{reviewComment.length}/1000</span>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setShowReviewForm(false)}>İptal</button>
            <button className="btn btn-primary" style={{ flex: 1 }} onClick={submitReview} disabled={submittingReview}>
              {submittingReview ? <Spinner /> : "Yorumu Gönder"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
