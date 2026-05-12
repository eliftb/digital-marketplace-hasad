"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { apiFetch, qs } from "@/lib/api";
import { Spinner, EmptyState } from "@/components/UI";
import type { ProducerProfileResponse, PageResponse } from "@/lib/types";

export default function ProducersPage() {
  const [producers, setProducers] = useState<ProducerProfileResponse[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    const q = qs({ search: search || undefined, page: 0, size: 20 });
    apiFetch<PageResponse<ProducerProfileResponse>>(`/producers/public${q}`)
      .then(r => setProducers(r.content))
      .catch(() => setProducers([]))
      .finally(() => setLoading(false));
  }, [search]);

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [load]);

  return (
    <>
      <div className="hero" style={{ padding: "48px 0 40px" }}>
        <div className="container">
          <div className="hero-content">
            <div className="hero-label">👨‍🌾 Üreticiler</div>
            <h1>Türkiye'nin <span>seçkin çiftçileri</span></h1>
            <p>Her biri bizzat denetlenmiş, kaliteli üreticilerle tanışın.</p>
          </div>
        </div>
      </div>

      <section className="section">
        <div className="container">
          <div style={{ marginBottom: 32 }}>
            <div className="filter-search" style={{ maxWidth: 400 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <input placeholder="Üretici veya şehir ara…" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          </div>

          {loading ? (
            <div style={{ textAlign: "center", padding: 64 }}><Spinner dark /></div>
          ) : producers.length === 0 ? (
            <EmptyState icon="🌿" title="Üretici bulunamadı" desc="Henüz kayıtlı üretici yok veya arama sonucu boş." />
          ) : (
            <div className="grid-4">
              {producers.map(p => (
                <Link key={p.id} href={`/producers/${p.id}`} style={{ textDecoration: "none" }}>
                  <div className="producer-card card-hover">
                    <div className="producer-cover">
                      {p.coverUrl && <img src={p.coverUrl} alt="" />}
                      <div className="producer-cover-overlay" />
                      {p.logoUrl && <img className="producer-logo" src={p.logoUrl} alt="" />}
                    </div>
                    <div className="producer-body">
                      <div className="producer-name">{p.storeName}</div>
                      <div className="producer-city">📍 {p.cityName}{p.districtName ? `, ${p.districtName}` : ""}</div>
                      {p.storeDescription && (
                        <p style={{ fontSize: 13, marginTop: 8, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                          {p.storeDescription}
                        </p>
                      )}
                      <div className="producer-stats">
                        <div>
                          <div className="producer-stat-val">{p.rating?.toFixed(1) ?? "—"} ★</div>
                          <div className="producer-stat-lbl">{p.ratingCount ?? 0} değerlendirme</div>
                        </div>
                        <div>
                          <div className="producer-stat-val">₺{((p.totalSales ?? 0) / 1000).toFixed(0)}K+</div>
                          <div className="producer-stat-lbl">toplam satış</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
