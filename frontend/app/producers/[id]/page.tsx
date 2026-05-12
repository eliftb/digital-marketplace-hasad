"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { apiFetch, qs } from "@/lib/api";
import { Stars, Spinner } from "@/components/UI";
import type { ProducerProfileResponse, ProductResponse, PageResponse } from "@/lib/types";

export default function ProducerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [producer, setProducer] = useState<ProducerProfileResponse | null>(null);
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiFetch<ProducerProfileResponse>(`/producers/public/${id}`),
      apiFetch<PageResponse<ProductResponse>>(`/products${qs({ producerId: id, page: 0, size: 20 })}`),
    ]).then(([p, prods]) => {
      setProducer(p);
      setProducts(prods.content);
    }).catch(() => {})
    .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div style={{ display: "flex", justifyContent: "center", padding: 80 }}><Spinner dark /></div>;
  if (!producer) return (
    <div className="container" style={{ padding: "64px 0", textAlign: "center" }}>
      <h2>Üretici bulunamadı</h2>
      <Link href="/producers" className="btn btn-outline" style={{ marginTop: 16 }}>← Üreticilere Dön</Link>
    </div>
  );

  return (
    <>
      <div style={{ height: 280, background: "var(--olive-800)", position: "relative", overflow: "hidden" }}>
        {producer.coverUrl && <img src={producer.coverUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 30%, rgba(28,36,16,.7))" }} />
      </div>

      <div className="container" style={{ position: "relative" }}>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 20, marginTop: -48, marginBottom: 32, flexWrap: "wrap" }}>
          {producer.logoUrl
            ? <img src={producer.logoUrl} alt="" style={{ width: 96, height: 96, borderRadius: "50%", border: "4px solid white", objectFit: "cover", boxShadow: "var(--shadow)", background: "var(--cream-200)" }} />
            : <div style={{ width: 96, height: 96, borderRadius: "50%", border: "4px solid white", background: "var(--olive-200)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36 }}>🌿</div>
          }
          <div style={{ flex: 1, paddingBottom: 8 }}>
            <h2 style={{ marginBottom: 4 }}>{producer.storeName}</h2>
            <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
              <span style={{ fontSize: 14, color: "var(--text-muted)" }}>📍 {producer.cityName}{producer.districtName ? `, ${producer.districtName}` : ""}</span>
              {producer.rating && <Stars rating={producer.rating} count={producer.ratingCount} />}
            </div>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <div style={{ textAlign: "center", padding: "8px 20px", background: "var(--cream-100)", borderRadius: "var(--radius)", border: "1px solid var(--border-light)" }}>
              <div style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem", fontWeight: 700, color: "var(--olive-700)" }}>
                ₺{((producer.totalSales ?? 0) / 1000).toFixed(0)}K
              </div>
              <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Toplam Satış</div>
            </div>
            <div style={{ textAlign: "center", padding: "8px 20px", background: "var(--cream-100)", borderRadius: "var(--radius)", border: "1px solid var(--border-light)" }}>
              <div style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem", fontWeight: 700, color: "var(--olive-700)" }}>
                {products.length}
              </div>
              <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Ürün</div>
            </div>
          </div>
        </div>

        {producer.storeDescription && (
          <div className="card" style={{ padding: 24, marginBottom: 32 }}>
            <h3 style={{ marginBottom: 12 }}>Hakkında</h3>
            <p style={{ lineHeight: 1.8 }}>{producer.storeDescription}</p>
          </div>
        )}

        <div className="section-header"><h3>Ürünleri</h3></div>
        {products.length === 0 ? (
          <div className="empty-state"><div className="empty-state-icon">📦</div><h3>Henüz ürün yok</h3></div>
        ) : (
          <div className="grid-4" style={{ marginBottom: 48 }}>
            {products.map(p => (
              <Link key={p.id} href={`/products/${p.id}`} style={{ textDecoration: "none" }}>
                <div className="product-card">
                  <div className="product-img-wrap">
                    <img src={p.imageUrls?.[0] ?? "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop"} alt={p.name} />
                  </div>
                  <div className="product-body">
                    <div className="product-name">{p.name}</div>
                    {p.rating && <Stars rating={p.rating} count={p.ratingCount} />}
                    <div className="product-footer">
                      <div>
                        <div className="product-price">₺{p.price.toFixed(2)}</div>
                        {p.unit && <div className="product-unit">/ {p.unit}</div>}
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
