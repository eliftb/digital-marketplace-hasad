"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { apiFetch, qs } from "@/lib/api";
import { useAuth } from "@/components/AuthProvider";
import { useToast, Stars, EmptyState, Spinner } from "@/components/UI";
import type { ProductResponse, ProducerProfileResponse, PageResponse, Category } from "@/lib/types";

export default function HomePage() {
  const { token } = useAuth();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [catId, setCatId] = useState<number | undefined>();
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [producers, setProducers] = useState<ProducerProfileResponse[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<Set<number>>(new Set());

  // Kategorileri yükle
  useEffect(() => {
    apiFetch<any>("/categories").then(r => setCategories(Array.isArray(r) ? r : r.content ?? r.data ?? [])).catch(() => {});
  }, []);

  // Öne çıkan üreticileri yükle
  useEffect(() => {
    apiFetch<PageResponse<ProducerProfileResponse>>("/producers/public?size=4")
      .then(r => setProducers(r.content))
      .catch(() => {});
  }, []);

  // Ürünleri yükle
  const loadProducts = useCallback(() => {
    setLoading(true);
    const q = qs({ search: search || undefined, categoryId: catId, page: 0, size: 12 });
    apiFetch<PageResponse<ProductResponse>>(`/products${q}`)
      .then(r => setProducts(r.content))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [search, catId]);

  useEffect(() => {
    const timer = setTimeout(loadProducts, 300);
    return () => clearTimeout(timer);
  }, [loadProducts]);

  async function toggleFav(productId: number) {
    if (!token) { toast("Favoriye eklemek için giriş yapın", "error"); return; }
    const isFav = favorites.has(productId);
    setFavorites(prev => { const next = new Set(prev); isFav ? next.delete(productId) : next.add(productId); return next; });
    try {
      if (isFav) {
        await apiFetch(`/favorites/${productId}`, { method: "DELETE", token });
        toast("Favorilerden çıkarıldı");
      } else {
        await apiFetch(`/favorites/${productId}`, { method: "POST", token });
        toast("Favorilere eklendi ❤️");
      }
    } catch (err) {
      setFavorites(prev => { const next = new Set(prev); isFav ? next.add(productId) : next.delete(productId); return next; });
      toast(err instanceof Error ? err.message : "Hata", "error");
    }
  }

  return (
    <>
      {/* Hero */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <div className="hero-label">🌾 Tarladan Sofraya</div>
            <h1>Doğanın en<br /><span>taze hediyeleri</span></h1>
            <p>Türkiye'nin dört bir yanındaki seçilmiş üreticilerden, hiç aracı olmadan en taze ve doğal ürünler.</p>
            <div className="hero-actions">
              <Link href="#products" className="btn btn-gold btn-lg">Ürünleri Keşfet</Link>
              <Link href="/producers" className="btn btn-outline btn-lg" style={{ borderColor: "rgba(255,255,255,.4)", color: "white" }}>
                Üreticiler
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <div className="stats-bar">
        <div className="container">
          <div className="stats-bar-inner">
            {[
              { val: "120+", lbl: "Aktif Üretici" },
              { val: "2.400+", lbl: "Ürün Çeşidi" },
              { val: "15.000+", lbl: "Mutlu Müşteri" },
              { val: "81 İl", lbl: "Teslimat" },
            ].map(s => (
              <div key={s.lbl} className="stat-item">
                <div className="stat-val">{s.val}</div>
                <div className="stat-lbl">{s.lbl}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="filter-bar" id="products">
        <div className="container">
          <div className="filter-inner">
            <div className="filter-search">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <input placeholder="Ürün veya üretici ara…" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <div className="cat-pills">
              <button className={`cat-pill${!catId ? " active" : ""}`} onClick={() => setCatId(undefined)}>Tümü</button>
              {categories.map(c => (
                <button key={c.id} className={`cat-pill${catId === c.id ? " active" : ""}`}
                  onClick={() => setCatId(catId === c.id ? undefined : c.id)}>
                  {c.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Products */}
      <section className="section">
        <div className="container">
          {loading ? (
            <div style={{ textAlign: "center", padding: 64 }}><Spinner dark /></div>
          ) : products.length === 0 ? (
            <EmptyState icon="🔍" title="Ürün bulunamadı" desc="Farklı bir arama deneyin" />
          ) : (
            <div className="grid-4">
              {products.map(p => (
                <ProductCard key={p.id} product={p} isFav={favorites.has(p.id)} onFav={toggleFav} onAddCart={async () => {
                  if (!token) { toast("Sepete eklemek için giriş yapın", "error"); return; }
                  try {
                    await apiFetch("/cart/items", { method: "POST", token, body: { productId: p.id, quantity: 1 } });
                    toast(`${p.name} sepete eklendi 🛒`);
                  } catch (err) { toast(err instanceof Error ? err.message : "Hata", "error"); }
                }} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Featured Producers */}
      {producers.length > 0 && (
        <section className="section" style={{ background: "var(--cream-100)", borderTop: "1px solid var(--border-light)" }}>
          <div className="container">
            <div className="section-header">
              <div>
                <div className="section-label">Seçilmiş Üreticiler</div>
                <h2>Güvenilir çiftçilerle tanışın</h2>
              </div>
              <Link href="/producers" className="btn btn-outline btn-sm">Tümünü Gör →</Link>
            </div>
            <div className="grid-4">
              {producers.map(p => <ProducerCard key={p.id} producer={p} />)}
            </div>
          </div>
        </section>
      )}

      {/* Why Hasad */}
      <section className="section">
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <div className="section-label">Neden Hasad?</div>
            <h2>Doğanın gücü, sofranda</h2>
          </div>
          <div className="grid-4">
            {[
              { icon: "🌱", title: "Organik & Doğal", desc: "Hiçbir katkı maddesi, hiçbir koruyucu. Sadece toprağın ve güneşin verdiği." },
              { icon: "🚚", title: "Hızlı Teslimat", desc: "Hasattan 48 saat içinde kapınızda. Soğuk zincir korunarak." },
              { icon: "👨‍🌾", title: "Doğrudan Üretici", desc: "Aracı yok. Paranın büyük kısmı doğrudan çiftçiye gidiyor." },
              { icon: "✓", title: "Kalite Garantisi", desc: "Her üretici bizzat denetleniyor. Memnun kalmazsanız para iadesi." },
            ].map(f => (
              <div key={f.title} className="card" style={{ padding: 24 }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>{f.icon}</div>
                <h4 style={{ marginBottom: 8 }}>{f.title}</h4>
                <p style={{ fontSize: 14 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

function ProductCard({ product: p, isFav, onFav, onAddCart }: {
  product: ProductResponse; isFav: boolean;
  onFav: (id: number) => void; onAddCart: () => void;
}) {
  const img = p.imageUrls?.[0] ?? "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop";
  return (
    <Link href={`/products/${p.id}`} style={{ textDecoration: "none" }}>
      <div className="product-card">
        <div className="product-img-wrap">
          <img src={img} alt={p.name} loading="lazy" />
          {p.featured && <span className="product-badge">⭐ Öne Çıkan</span>}
          <button className={`product-fav-btn${isFav ? " active" : ""}`}
            onClick={e => { e.preventDefault(); onFav(p.id); }}>
            {isFav ? "❤️" : "🤍"}
          </button>
        </div>
        <div className="product-body">
          {p.producer && (
            <div className="product-producer">
              {p.producer.logoUrl && <img className="producer-mini-logo" src={p.producer.logoUrl} alt="" />}
              <span className="producer-mini-name">{p.producer.storeName}</span>
              {p.producer.cityName && <span style={{ fontSize: 11, color: "var(--text-muted)" }}>• {p.producer.cityName}</span>}
            </div>
          )}
          <div className="product-name">{p.name}</div>
          {p.rating && <Stars rating={p.rating} count={p.ratingCount} />}
          <div className="product-footer">
            <div>
              <div className="product-price">₺{p.price.toFixed(2)}</div>
              {p.unit && <div className="product-unit">/ {p.unit}</div>}
            </div>
            <button className="btn btn-primary btn-sm" onClick={e => { e.preventDefault(); onAddCart(); }}>
              🛒 Ekle
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}

function ProducerCard({ producer: p }: { producer: ProducerProfileResponse }) {
  return (
    <Link href={`/producers/${p.id}`} style={{ textDecoration: "none" }}>
      <div className="producer-card">
        <div className="producer-cover">
          {p.coverUrl && <img src={p.coverUrl} alt="" />}
          <div className="producer-cover-overlay" />
          {p.logoUrl && <img className="producer-logo" src={p.logoUrl} alt="" />}
        </div>
        <div className="producer-body">
          <div className="producer-name">{p.storeName}</div>
          <div className="producer-city">📍 {p.cityName}{p.districtName ? `, ${p.districtName}` : ""}</div>
          <div className="producer-stats">
            <div>
              <div className="producer-stat-val">{p.rating?.toFixed(1) ?? "—"} ★</div>
              <div className="producer-stat-lbl">{p.ratingCount ?? 0} değerlendirme</div>
            </div>
            <div>
              <div className="producer-stat-val">₺{((p.totalSales ?? 0) / 1000).toFixed(0)}K</div>
              <div className="producer-stat-lbl">toplam satış</div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
