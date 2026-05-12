"use client";
import { useEffect, useState } from "react";
import { apiFetch, qs } from "@/lib/api";
import { useAuth } from "@/components/AuthProvider";
import { useToast, StatusBadge, Spinner, EmptyState, Pagination } from "@/components/UI";
import type { UserDto, PageResponse } from "@/lib/types";

export default function AdminUsersPage() {
  const { token } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState<UserDto[]>([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    // Backend UserRole enum: CONSUMER, PRODUCER, ADMIN, SUPER_ADMIN
    // Backend AccountStatus enum: ACTIVE, BANNED, PENDING
    const q = qs({ search: search || undefined, role: roleFilter || undefined, page, size: 20 });
    apiFetch<PageResponse<UserDto>>(`/admin/users${q}`, { token })
      .then(r => { setUsers(r.content ?? []); setTotalPages(r.totalPages ?? 1); })
      .catch((err) => { toast(err?.message ?? "Kullanıcılar yüklenemedi", "error"); setUsers([]); })
      .finally(() => setLoading(false));
  }, [token, search, roleFilter, page]);

  async function ban(id: number) {
    try {
      await apiFetch(`/admin/users/${id}/ban`, { method: "POST", token: token! });
      setUsers(prev => prev.map(u => u.id === id ? { ...u, status: "BANNED" } : u));
      toast("Kullanıcı banlandı");
    } catch (err) { toast(err instanceof Error ? err.message : "Hata", "error"); }
  }

  async function activate(id: number) {
    try {
      await apiFetch(`/admin/users/${id}/activate`, { method: "POST", token: token! });
      setUsers(prev => prev.map(u => u.id === id ? { ...u, status: "ACTIVE" } : u));
      toast("Kullanıcı aktifleştirildi");
    } catch (err) { toast(err instanceof Error ? err.message : "Hata", "error"); }
  }

  return (
    <>
      <div className="admin-page-title"><h1>Kullanıcılar</h1><p>Platform kullanıcılarını yönetin.</p></div>

      <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
        <div className="filter-search" style={{ maxWidth: 280 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input placeholder="E-posta veya ad ara…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="form-select" style={{ width: "auto" }} value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
          <option value="">Tüm Roller</option>
          <option value="CONSUMER">Tüketici</option>
          <option value="PRODUCER">Üretici</option>
          <option value="ADMIN">Admin</option>
          <option value="SUPER_ADMIN">Süper Admin</option>
        </select>
      </div>

      {loading ? <div style={{ textAlign: "center", padding: 64 }}><Spinner dark /></div> :
       users.length === 0 ? <EmptyState icon="👥" title="Kullanıcı bulunamadı" /> : (
        <>
          <div className="table-wrap">
            <table className="data-table">
              <thead><tr><th>Kullanıcı</th><th>Rol</th><th>Durum</th><th>Kayıt Tarihi</th><th>İşlemler</th></tr></thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{u.firstName} {u.lastName}</div>
                      <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{u.email}</div>
                    </td>
                    <td><span className="badge badge-CONFIRMED">{u.role}</span></td>
                    <td><StatusBadge status={u.status} /></td>
                    <td style={{ fontSize: 13, color: "var(--text-muted)" }}>{new Date(u.createdAt).toLocaleDateString("tr-TR")}</td>
                    <td>
                      {u.status === "BANNED"
                        ? <button className="btn btn-primary btn-sm" onClick={() => activate(u.id)}>Aktifleştir</button>
                        : u.role !== "SUPER_ADMIN" && <button className="btn btn-danger btn-sm" onClick={() => ban(u.id)}>Banla</button>
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </>
      )}
    </>
  );
}
