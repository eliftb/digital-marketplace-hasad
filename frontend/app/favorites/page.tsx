"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/components/AuthProvider";
import { useToast, Stars, Spinner, EmptyState } from "@/components/UI";
import type { ProductResponse, PageResponse } from "@/lib/types";

export default function FavoritesPage() {
  const { token, user, ready } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (ready && !user) router.replace("/auth");
  }, [ready, user, router]);

  useEffect(() => {
    if (!token) return;
    apiFetch<PageResponse<ProductResponse>>("/favorites?page=0&size=50", { token })
      .then(r => setProducts(r.content))
      .catch(() => toast("Favoriler yüklenemedi", "error"))
      .finally(() => setLoading(false));
  }, [token]);

  async function remove(productId: number) {
    try {
      await apiFetch(`/favorites/${productId}`, { method: "DELETE", token: token! });
      setProducts(prev => prev.filter(p => p.id !== productId));
      toast("Favorilerden çıkarıldı");
    } catch { toast("Hata oluştu", "error"); }
  }

  if (!ready || loading) return <div style={{ display: "flex", justifyContent: "center", padding: 80 }}><Spinner dark /></div>;

  return (
    <div className="container" style={{ paddingTop: 40, paddingBottom: 64 }}>
      <div className="section-header" style={{ marginBottom: 32 }}>
        <div>
          <div className="section-label">Hesabım</div>
          <h2>Favorilerim</h2>
        </div>
        <span style={{ color: "var(--text-muted)", fontSize: 14 }}>{products.length} ürün</span>
      </div>

      {products.length === 0 ? (
        <EmptyState icon="❤️" title="Henüz favori ürününüz yok"
          desc="Beğendiğiniz ürünleri favorilere ekleyin."
          action={<Link href="/" className="btn btn-primary">Ürünleri Keşfet</Link>} />
      ) : (
        <div className="grid-4">
          {products.map(p => {
            const img = p.imageUrls?.[0] ?? "";
            return (
              <div key={p.id} className="product-card">
                <Link href={`/products/${p.id}`}>
                  <div className="product-img-wrap">
                    {img && <img src={img} alt={p.name} />}
                    <button className="product-fav-btn active" onClick={e => { e.preventDefault(); remove(p.id); }}>❤️</button>
                  </div>
                </Link>
                <div className="product-body">
                  {p.producer && <div className="product-producer"><span className="producer-mini-name">{p.producer.storeName}</span></div>}
                  <Link href={`/products/${p.id}`}><div className="product-name">{p.name}</div></Link>
                  {p.rating && <Stars rating={p.rating} count={p.ratingCount} />}
                  <div className="product-footer">
                    <div>
                      <div className="product-price">₺{p.price.toFixed(2)}</div>
                      {p.unit && <div className="product-unit">/ {p.unit}</div>}
                    </div>
                    <Link href={`/products/${p.id}`} className="btn btn-primary btn-sm">Sipariş Ver</Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
