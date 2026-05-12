"use client";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { Spinner } from "@/components/UI";
import type { City } from "@/lib/types";

export default function AdminCitiesPage() {
  const [cities, setCities] = useState<City[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<any>("/cities").then(r => setCities(Array.isArray(r) ? r : r.content ?? r.data ?? [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const filtered = cities.filter(c => !search || c.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <>
      <div className="admin-page-title"><h1>Şehirler</h1><p>Platform şehir listesi ({cities.length} şehir).</p></div>

      <div style={{ marginBottom: 20 }}>
        <div className="filter-search" style={{ maxWidth: 280 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input placeholder="Şehir ara…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      {loading ? <div style={{ textAlign: "center", padding: 64 }}><Spinner dark /></div> : (
        <div className="grid-3" style={{ gap: 12 }}>
          {filtered.map(c => (
            <div key={c.id} className="card" style={{ padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <span style={{ fontWeight: 600 }}>{c.name}</span>
                <span style={{ fontSize: 12, color: "var(--text-muted)", marginLeft: 8 }}>ID: {c.id}</span>
              </div>
              <span style={{ fontSize: 18 }}>🏙️</span>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
