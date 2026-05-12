"use client";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/components/AuthProvider";
import { useToast, Spinner } from "@/components/UI";
import type { SalesReport, ProducerReport, TopProductReport } from "@/lib/types";

export default function AdminReportsPage() {
  const { token } = useAuth();
  const { toast } = useToast();

  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split("T")[0];
  const todayStr = today.toISOString().split("T")[0];

  const [startDate, setStartDate] = useState(firstDay);
  const [endDate, setEndDate] = useState(todayStr);
  const [sales, setSales] = useState<SalesReport | null>(null);
  const [top, setTop] = useState<TopProductReport[]>([]);
  const [producers, setProducers] = useState<ProducerReport[]>([]);
  const [loading, setLoading] = useState(false);

  async function fetchReports() {
    if (!token) return;
    setLoading(true);
    try {
      const [s, t, p] = await Promise.all([
        apiFetch<SalesReport>(`/reports/admin/sales?startDate=${startDate}&endDate=${endDate}`, { token }),
        apiFetch<TopProductReport[]>(`/reports/admin/top-products?limit=10`, { token }),
        apiFetch<{ content: ProducerReport[] }>(`/reports/admin/producers?page=0&size=20`, { token }),
      ]);
      setSales(s);
      setTop(t);
      setProducers(p.content);
    } catch (err) {
      toast(err instanceof Error ? err.message : "Raporlar yüklenemedi", "error");
    } finally { setLoading(false); }
  }

  useEffect(() => { fetchReports(); }, [token]);

  return (
    <>
      <div className="admin-page-title">
        <h1>Raporlar</h1>
        <p>Platform satış ve komisyon raporları.</p>
      </div>

      {/* Tarih filtresi */}
      <div className="card" style={{ padding: 20, marginBottom: 24 }}>
        <div style={{ display: "flex", gap: 12, alignItems: "flex-end", flexWrap: "wrap" }}>
          <div className="form-group" style={{ flex: "none" }}>
            <label className="form-label">Başlangıç</label>
            <input className="form-input" type="date" value={startDate}
              onChange={e => setStartDate(e.target.value)} style={{ width: "auto" }} />
          </div>
          <div className="form-group" style={{ flex: "none" }}>
            <label className="form-label">Bitiş</label>
            <input className="form-input" type="date" value={endDate}
              onChange={e => setEndDate(e.target.value)} style={{ width: "auto" }} />
          </div>
          <button className="btn btn-primary" onClick={fetchReports} disabled={loading}>
            {loading ? <Spinner /> : "📊 Filtrele"}
          </button>
          {/* Hızlı seçimler */}
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {[
              { label: "Bu Ay", start: firstDay, end: todayStr },
              { label: "Bu Yıl", start: `${today.getFullYear()}-01-01`, end: todayStr },
              { label: "Son 7 Gün", start: new Date(today.getTime() - 7*24*60*60*1000).toISOString().split("T")[0], end: todayStr },
              { label: "Son 30 Gün", start: new Date(today.getTime() - 30*24*60*60*1000).toISOString().split("T")[0], end: todayStr },
            ].map(q => (
              <button key={q.label} className="cat-pill btn-sm"
                onClick={() => { setStartDate(q.start); setEndDate(q.end); }}
                style={{ fontSize: 12 }}>{q.label}</button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: 64 }}><Spinner dark /></div>
      ) : (
        <>
          {/* Satış özeti */}
          {sales ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 32 }}>
              {[
                { label: "Toplam Ciro", val: `₺${(sales.totalRevenue ?? 0).toLocaleString("tr-TR", { minimumFractionDigits: 2 })}`, icon: "💰", color: "#dcfce7" },
                { label: "Komisyon Geliri", val: `₺${(sales.totalCommission ?? 0).toLocaleString("tr-TR", { minimumFractionDigits: 2 })}`, icon: "📊", color: "#dbeafe" },
                { label: "Sipariş Sayısı", val: (sales.orderCount ?? 0).toLocaleString(), icon: "📦", color: "#fef9c3" },
                { label: "Ort. Sipariş", val: `₺${(sales.averageOrderValue ?? 0).toLocaleString("tr-TR", { minimumFractionDigits: 2 })}`, icon: "📈", color: "#f3e8ff" },
              ].map(s => (
                <div key={s.label} className="stat-card">
                  <div className="stat-card-icon" style={{ background: s.color, fontSize: 20 }}>{s.icon}</div>
                  <div className="stat-card-val">{s.val}</div>
                  <div className="stat-card-lbl">{s.label}</div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ background: "var(--cream-100)", borderRadius: "var(--radius)", padding: 24, textAlign: "center", marginBottom: 32, color: "var(--text-muted)", fontSize: 14 }}>
              Bu tarih aralığında satış verisi bulunamadı.
            </div>
          )}

          <div className="grid-2" style={{ gap: 24 }}>
            {/* En çok satan ürünler */}
            <div>
              <h3 style={{ marginBottom: 16 }}>🏆 En Çok Satan Ürünler</h3>
              {top.length === 0 ? (
                <div className="card" style={{ padding: 32, textAlign: "center", color: "var(--text-muted)" }}>
                  Henüz satış verisi yok
                </div>
              ) : (
                <div className="table-wrap">
                  <table className="data-table">
                    <thead><tr><th>#</th><th>Ürün</th><th>Satış</th><th>Ciro</th><th>Puan</th></tr></thead>
                    <tbody>
                      {top.map((p, i) => (
                        <tr key={p.productId}>
                          <td style={{ fontWeight: 700, color: i < 3 ? "var(--gold-600)" : "var(--text-muted)", fontSize: 16 }}>
                            {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : i + 1}
                          </td>
                          <td>
                            <div style={{ fontWeight: 600, fontSize: 13 }}>{p.productName}</div>
                            <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{p.storeName}</div>
                          </td>
                          <td style={{ fontWeight: 700 }}>{p.soldCount}</td>
                          <td style={{ fontWeight: 700 }}>₺{(p.totalRevenue ?? 0).toLocaleString("tr-TR")}</td>
                          <td style={{ fontSize: 13, color: "var(--gold-600)" }}>{p.rating ? `★ ${p.rating.toFixed(1)}` : "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Üretici bazlı rapor */}
            <div>
              <h3 style={{ marginBottom: 16 }}>🌿 Üretici Bazlı Rapor</h3>
              {producers.length === 0 ? (
                <div className="card" style={{ padding: 32, textAlign: "center", color: "var(--text-muted)" }}>
                  Henüz üretici verisi yok
                </div>
              ) : (
                <div className="table-wrap">
                  <table className="data-table">
                    <thead><tr><th>Üretici</th><th>Satış</th><th>Komisyon</th><th>Net</th><th>Sipariş</th></tr></thead>
                    <tbody>
                      {producers.map(p => (
                        <tr key={p.producerId}>
                          <td>
                            <div style={{ fontWeight: 600, fontSize: 13 }}>{p.storeName}</div>
                            <div style={{ fontSize: 11, color: "var(--text-muted)" }}>%{p.commissionRate} komisyon</div>
                          </td>
                          <td style={{ fontSize: 13 }}>₺{(p.totalSales ?? 0).toLocaleString("tr-TR")}</td>
                          <td style={{ fontSize: 13, color: "#dc2626" }}>₺{(p.commissionPaid ?? 0).toLocaleString("tr-TR")}</td>
                          <td style={{ fontSize: 13, fontWeight: 700, color: "var(--olive-700)" }}>₺{(p.netEarnings ?? 0).toLocaleString("tr-TR")}</td>
                          <td style={{ fontSize: 13 }}>{p.orderCount}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}
