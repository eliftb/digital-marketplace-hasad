"use client";
import { useEffect, useState } from "react";
import { apiFetch, qs } from "@/lib/api";
import { useAuth } from "@/components/AuthProvider";
import { useToast, StatusBadge, Stars, Spinner, EmptyState } from "@/components/UI";
import type { ProductResponse, PageResponse } from "@/lib/types";

export default function AdminProductsPage() {
  const { token } = useAuth();
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    const q = qs({ search: search || undefined, page: 0, size: 50 });
    apiFetch<PageResponse<ProductResponse>>(`/products${q}`, { token })
      .then(r => setProducts(r.content))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token, search]);

  return (
    <>
      <div className="admin-page-title">
        <h1>Ürünler</h1>
        <p>Platform ürünlerini görüntüleyin ve yönetin.</p>
      </div>

      <div style={{ marginBottom: 20 }}>
        <div className="filter-search" style={{ maxWidth: 320 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input placeholder="Ürün veya üretici ara…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      {loading ? <div style={{ textAlign: "center", padding: 64 }}><Spinner dark /></div> :
       products.length === 0 ? <EmptyState icon="📦" title="Ürün bulunamadı" /> : (
        <div className="table-wrap">
          <table className="data-table">
            <thead><tr><th>Ürün</th><th>Üretici</th><th>Kategori</th><th>Fiyat</th><th>Stok</th><th>Satış</th><th>Puan</th><th>Durum</th></tr></thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id}>
                  <td>
                    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                      {p.imageUrls?.[0] && <img src={p.imageUrls[0]} alt="" style={{ width: 40, height: 40, borderRadius: 6, objectFit: "cover" }} />}
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>{p.name}</div>
                        {p.featured && <span className="badge badge-active" style={{ fontSize: 10 }}>⭐ Öne Çıkan</span>}
                      </div>
                    </div>
                  </td>
                  <td style={{ fontSize: 13 }}>{p.producer?.storeName ?? "—"}</td>
                  <td style={{ fontSize: 13 }}>{p.category?.name ?? "—"}</td>
                  <td style={{ fontWeight: 700 }}>₺{p.price.toFixed(2)}</td>
                  <td>{p.stockQuantity} {p.unit}</td>
                  <td>{p.soldCount ?? 0}</td>
                  <td>{p.rating ? <Stars rating={p.rating} /> : "—"}</td>
                  <td><StatusBadge status={p.active ? "ACTIVE" : "INACTIVE"} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
