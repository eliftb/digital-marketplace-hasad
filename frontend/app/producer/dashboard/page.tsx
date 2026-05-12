"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/components/AuthProvider";
import { useToast, StatusBadge, Spinner, Modal, EmptyState } from "@/components/UI";
import type { ProducerProfileResponse, ProductResponse, PageResponse, OrderResponse, ProducerReport } from "@/lib/types";

type Category = { id: number; name: string; slug: string };

export default function ProducerDashboardPage() {
  const { token, user, ready } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [profile, setProfile] = useState<ProducerProfileResponse | null>(null);
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [report, setReport] = useState<ProducerReport | null>(null);
  const [tab, setTab] = useState<"products" | "orders" | "report">("products");
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [editProduct, setEditProduct] = useState<ProductResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [reportLoading, setReportLoading] = useState(false);

  // Rapor tab'ına geçince veri çek
  useEffect(() => {
    if (tab !== "report" || !token || report) return;
    setReportLoading(true);
    apiFetch<ProducerReport>("/reports/producer/my", { token })
      .then(setReport)
      .catch(() => toast("Rapor yüklenemedi", "error"))
      .finally(() => setReportLoading(false));
  }, [tab, token]);

  useEffect(() => {
    if (ready && (!user || user.role !== "PRODUCER")) router.replace("/");
  }, [ready, user, router]);

  useEffect(() => {
    if (!token || !user || user.role !== "PRODUCER") return;
    async function load() {
      setLoading(true);
      try {
        const [prof, prods, ords] = await Promise.all([
          apiFetch<ProducerProfileResponse>("/producers/me", { token }),
          apiFetch<PageResponse<ProductResponse>>(`/products?page=0&size=50`, { token }),
          apiFetch<PageResponse<OrderResponse>>("/orders/producer?page=0&size=20", { token }),
        ]);
        setProfile(prof);
        setProducts(prods.content ?? []);
        setOrders(ords.content ?? []);
      } catch (err) {
        toast("Veriler yüklenemedi", "error");
      } finally { setLoading(false); }
    }
    load();
  }, [token, user]);

  if (!ready || loading) return <div style={{ display: "flex", justifyContent: "center", padding: 80 }}><Spinner dark /></div>;

  return (
    <div className="container" style={{ paddingTop: 32, paddingBottom: 48 }}>
      <div className="admin-page-title">
        <h1>Mağaza Yönetimi</h1>
        <p>Ürünlerinizi ve siparişlerinizi buradan yönetin.</p>
      </div>

      {profile && (
        <div className="card" style={{ padding: 24, marginBottom: 24, display: "flex", gap: 20, alignItems: "center" }}>
          {profile.logoUrl && <img src={profile.logoUrl} alt="" style={{ width: 64, height: 64, borderRadius: "50%", objectFit: "cover" }} />}
          <div style={{ flex: 1 }}>
            <h3 style={{ marginBottom: 4 }}>{profile.storeName}</h3>
            <div style={{ fontSize: 14, color: "var(--text-muted)", display: "flex", gap: 16 }}>
              <span>📍 {profile.cityName}</span>
              <span>⭐ {profile.rating?.toFixed(1) ?? "—"} ({profile.ratingCount} yorum)</span>
              <span>💰 Toplam: ₺{((profile.totalSales ?? 0)).toLocaleString()}</span>
            </div>
          </div>
          <StatusBadge status={profile.approvalStatus} />
        </div>
      )}

      <div style={{ display: "flex", gap: 4, marginBottom: 24, borderBottom: "1px solid var(--border-light)" }}>
        {([["products", "📦 Ürünlerim"], ["orders", "🚚 Siparişler"], ["report", "📊 Rapor"]] as const).map(([t, label]) => (
          <button key={t} onClick={() => setTab(t)}
            style={{ padding: "10px 20px", borderRadius: "var(--radius-sm) var(--radius-sm) 0 0", fontSize: 14, fontWeight: 600, cursor: "pointer", border: "none",
              background: tab === t ? "var(--surface)" : "transparent",
              color: tab === t ? "var(--olive-700)" : "var(--text-muted)",
              borderBottom: tab === t ? "2px solid var(--olive-600)" : "2px solid transparent",
            }}>{label}</button>
        ))}
        {tab === "products" && (
          <button className="btn btn-primary btn-sm" style={{ marginLeft: "auto" }} onClick={() => setShowAddProduct(true)}>
            + Ürün Ekle
          </button>
        )}
      </div>

      {tab === "products" && (
        products.length === 0 ? (
          <EmptyState icon="📦" title="Henüz ürününüz yok" desc="İlk ürününüzü ekleyin" action={
            <button className="btn btn-primary" onClick={() => setShowAddProduct(true)}>Ürün Ekle</button>
          } />
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead><tr>
                <th>Ürün</th><th>Fiyat</th><th>Stok</th><th>Satış</th><th>Durum</th><th>İşlemler</th>
              </tr></thead>
              <tbody>
                {products.map(p => (
                  <tr key={p.id}>
                    <td>
                      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                        {p.imageUrls?.[0] && <img src={p.imageUrls[0]} alt="" style={{ width: 40, height: 40, borderRadius: 6, objectFit: "cover" }} />}
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 14 }}>{p.name}</div>
                          <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{p.category?.name}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontWeight: 700 }}>₺{p.price.toFixed(2)}<span style={{ fontWeight: 400, color: "var(--text-muted)", fontSize: 12 }}>/{p.unit}</span></td>
                    <td>{p.stockQuantity}</td>
                    <td>{p.soldCount ?? 0}</td>
                    <td><StatusBadge status={p.active ? "ACTIVE" : "INACTIVE"} /></td>
                    <td>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => setEditProduct(p)}>Düzenle</button>
                        <button className="btn btn-ghost btn-sm" onClick={async () => {
                          try {
                            await apiFetch(`/products/${p.id}/toggle-status`, { method: "PATCH", token: token! });
                            setProducts(prev => prev.map(x => x.id === p.id ? { ...x, active: !x.active } : x));
                            toast("Ürün durumu güncellendi");
                          } catch { toast("Hata oluştu", "error"); }
                        }}>{p.active ? "Pasife Al" : "Aktife Al"}</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}

      {tab === "orders" && (
        orders.length === 0 ? (
          <EmptyState icon="🚚" title="Henüz siparişiniz yok" />
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead><tr>
                <th>Sipariş No</th><th>Ürünler</th><th>Tutar</th><th>Durum</th><th>Tarih</th><th>İşlemler</th>
              </tr></thead>
              <tbody>
                {orders.map(o => (
                  <tr key={o.id}>
                    <td style={{ fontWeight: 700, fontSize: 13 }}>#{o.orderNumber}</td>
                    <td style={{ fontSize: 13 }}>{o.items.map(i => `${i.productName} ×${i.quantity}`).join(", ")}</td>
                    <td style={{ fontWeight: 700 }}>₺{o.totalAmount.toFixed(2)}</td>
                    <td><StatusBadge status={o.status} /></td>
                    <td style={{ fontSize: 13, color: "var(--text-muted)" }}>{new Date(o.createdAt).toLocaleDateString("tr")}</td>
                    <td>
                      <select className="form-select" style={{ fontSize: 12, padding: "4px 8px" }}
                        value={o.status}
                        onChange={async (e) => {
                          try {
                            await apiFetch(`/orders/${o.id}/status?status=${e.target.value}`, { method: "PATCH", token: token! });
                            setOrders(prev => prev.map(x => x.id === o.id ? { ...x, status: e.target.value as any } : x));
                            toast("Sipariş durumu güncellendi");
                          } catch { toast("Hata", "error"); }
                        }}>
                        {["PENDING","CONFIRMED","PREPARING","SHIPPED","DELIVERED","CANCELLED"].map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}

      {tab === "report" && (
        reportLoading ? (
          <div style={{ textAlign: "center", padding: 64 }}><Spinner dark /></div>
        ) : (
        <div className="stats-grid">
          {[
            { label: "Bu Ay Satış", val: `₺${(report?.totalSales ?? 0).toLocaleString()}`, icon: "💰", color: "#dcfce7" },
            { label: "Sipariş Sayısı", val: report?.orderCount ?? 0, icon: "📦", color: "#e0f2fe" },
            { label: "Net Kazanç", val: `₺${(report?.netEarnings ?? 0).toLocaleString()}`, icon: "✓", color: "#f3e8ff" },
            { label: "Komisyon Oranı", val: `%${(report?.commissionRate ?? 10)}`, icon: "📊", color: "#fef9c3" },
          ].map(s => (
            <div key={s.label} className="stat-card">
              <div className="stat-card-icon" style={{ background: s.color, fontSize: 20 }}>{s.icon}</div>
              <div className="stat-card-val">{s.val}</div>
              <div className="stat-card-lbl">{s.label}</div>
            </div>
          ))}
        </div>
        )
      )}

      <ProductModal open={showAddProduct} onClose={() => setShowAddProduct(false)} token={token!}
        onSaved={(p) => { setProducts(prev => [p, ...prev]); toast("Ürün eklendi ✓"); setShowAddProduct(false); }} />

      {editProduct && (
        <ProductModal open={!!editProduct} onClose={() => setEditProduct(null)} token={token!}
          product={editProduct}
          onSaved={(p) => { setProducts(prev => prev.map(x => x.id === p.id ? p : x)); toast("Ürün güncellendi ✓"); setEditProduct(null); }} />
      )}
    </div>
  );
}

function ProductModal({ open, onClose, token, product, onSaved }: {
  open: boolean; onClose: () => void; token: string;
  product?: ProductResponse;
  onSaved: (p: ProductResponse) => void;
}) {
  const isEdit = !!product;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState({
    name: product?.name ?? "",
    price: product?.price?.toString() ?? "",
    stock: product?.stockQuantity?.toString() ?? "",
    unit: product?.unit ?? "",
    categoryId: product?.category?.id?.toString() ?? "",
    deliveryType: product?.deliveryType ?? "BOTH",
    imageUrl: product?.imageUrls?.[0] ?? "",
    description: product?.description ?? "",
  });

  // Kategorileri çek — token olmadan da çalışır (public endpoint)
  useEffect(() => {
    if (!open) return;
    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080/api"}/categories`)
      .then(r => r.json())
      .then(json => {
        const data = json?.data ?? json;
        setCategories(Array.isArray(data) ? data : []);
      })
      .catch(() => setCategories([]));
  }, [open]);

  // Edit modunda form'u doldur
  useEffect(() => {
    if (product) {
      setForm({
        name: product.name ?? "",
        price: product.price?.toString() ?? "",
        stock: product.stockQuantity?.toString() ?? "",
        unit: product.unit ?? "",
        categoryId: product.category?.id?.toString() ?? "",
        deliveryType: product.deliveryType ?? "BOTH",
        imageUrl: product.imageUrls?.[0] ?? "",
        description: product.description ?? "",
      });
    }
  }, [product]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError("");
    const body = {
      name: form.name,
      description: form.description,
      price: Number(form.price),
      stockQuantity: Number(form.stock),
      unit: form.unit,
      categoryId: Number(form.categoryId),
      deliveryType: form.deliveryType,
      imageUrls: form.imageUrl ? [form.imageUrl] : [],
    };
    try {
      const p = isEdit
        ? await apiFetch<ProductResponse>(`/products/${product!.id}`, { method: "PUT", token, body })
        : await apiFetch<ProductResponse>("/products", { method: "POST", token, body });
      onSaved(p);
    } catch (err) {
      setError(err instanceof Error ? err.message : "İşlem başarısız");
    } finally { setLoading(false); }
  }

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? "Ürünü Düzenle" : "Yeni Ürün Ekle"}>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {error && <div className="auth-error">{error}</div>}
        <div className="form-group">
          <label className="form-label">Ürün Adı *</label>
          <input className="form-input" value={form.name} onChange={set("name")} required />
        </div>
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">Fiyat (₺) *</label>
            <input className="form-input" value={form.price} onChange={set("price")} type="number" step="0.01" min="0.01" required />
          </div>
          <div className="form-group">
            <label className="form-label">Stok *</label>
            <input className="form-input" value={form.stock} onChange={set("stock")} type="number" min="0" required />
          </div>
        </div>
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">Birim</label>
            <input className="form-input" value={form.unit} onChange={set("unit")} placeholder="kg, adet, lt…" />
          </div>
          <div className="form-group">
            <label className="form-label">Kategori *</label>
            <select className="form-select" value={form.categoryId} onChange={set("categoryId")} required>
              <option value="" disabled>
                {categories.length === 0 ? "Kategoriler yükleniyor…" : "Kategori seçin…"}
              </option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Teslimat Tipi</label>
          <select className="form-select" value={form.deliveryType} onChange={set("deliveryType")}>
            <option value="BOTH">Kargo + Teslim Alma</option>
            <option value="SHIPPING">Sadece Kargo</option>
            <option value="PICKUP">Sadece Teslim Alma</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Resim URL (isteğe bağlı)</label>
          <input className="form-input" value={form.imageUrl} onChange={set("imageUrl")} placeholder="https://…" />
        </div>
        <div className="form-group">
          <label className="form-label">Açıklama</label>
          <textarea className="form-textarea" value={form.description} onChange={set("description")} rows={3} />
        </div>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button type="button" className="btn btn-ghost" onClick={onClose}>İptal</button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? <Spinner /> : isEdit ? "Güncelle" : "Ürünü Ekle"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
