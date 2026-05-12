"use client";
import { useEffect, useState } from "react";
import { apiFetch, qs } from "@/lib/api";
import { useAuth } from "@/components/AuthProvider";
import { useToast, StatusBadge, Spinner, EmptyState } from "@/components/UI";
import type { UserDto, PageResponse } from "@/lib/types";

export default function AdminAdminsPage() {
  const { token, user } = useAuth();
  const { toast } = useToast();
  const [admins, setAdmins] = useState<UserDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [promoting, setPromoting] = useState(false);
  const [email, setEmail] = useState("");
  const [allUsers, setAllUsers] = useState<UserDto[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [selectedRole, setSelectedRole] = useState<"ADMIN" | "SUPER_ADMIN">("ADMIN");

  const isSuperAdmin = user?.role === "SUPER_ADMIN";

  useEffect(() => {
    if (!token) return;
    async function load() {
      setLoading(true);
      try {
        // Admin ve SUPER_ADMIN rolündeki kullanıcıları çek
        const [adminRes, superRes] = await Promise.all([
          apiFetch<PageResponse<UserDto>>(`/admin/users?role=ADMIN&size=50`, { token }),
          apiFetch<PageResponse<UserDto>>(`/admin/users?role=SUPER_ADMIN&size=50`, { token }),
        ]);
        const combined = [...(superRes.content ?? []), ...(adminRes.content ?? [])];
        setAdmins(combined);
      } catch (err: any) {
        toast(err?.message ?? "Yöneticiler yüklenemedi", "error");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [token]);

  useEffect(() => {
    // Rol atamak için tüm kullanıcıları yükle (sadece SUPER_ADMIN için)
    if (!token || !isSuperAdmin) return;
    apiFetch<PageResponse<UserDto>>(`/admin/users?size=100`, { token })
      .then(r => setAllUsers(r.content ?? []))
      .catch(() => {});
  }, [token, isSuperAdmin]);

  async function handleChangeRole(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedUserId) return;
    setPromoting(true);
    try {
      const updated = await apiFetch<UserDto>(
        `/admin/users/${selectedUserId}/role?role=${selectedRole}`,
        { method: "PATCH", token: token! }
      );
      toast(`Kullanıcı rolü ${selectedRole} olarak güncellendi`);
      // Listeyi yenile
      setAdmins(prev => {
        const exists = prev.find(a => a.id === updated.id);
        if (exists) return prev.map(a => a.id === updated.id ? updated : a);
        return [...prev, updated];
      });
      setSelectedUserId("");
    } catch (err: any) {
      toast(err?.message ?? "Hata oluştu", "error");
    } finally {
      setPromoting(false); }
  }

  async function handleDemote(userId: number) {
    try {
      await apiFetch<UserDto>(`/admin/users/${userId}/role?role=CONSUMER`, {
        method: "PATCH", token: token!
      });
      setAdmins(prev => prev.filter(a => a.id !== userId));
      toast("Yönetici yetkisi kaldırıldı");
    } catch (err: any) {
      toast(err?.message ?? "Hata", "error");
    }
  }

  const nonAdminUsers = allUsers.filter(u => u.role !== "ADMIN" && u.role !== "SUPER_ADMIN");

  return (
    <>
      <div className="admin-page-title">
        <h1>Yöneticiler</h1>
        <p>Platform yöneticilerini görüntüleyin ve yönetin.</p>
      </div>

      {isSuperAdmin && (
        <div className="card" style={{ padding: 24, marginBottom: 24 }}>
          <h3 style={{ marginBottom: 16 }}>Yönetici Rolü Ata</h3>
          <form onSubmit={handleChangeRole} style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-end" }}>
            <div className="form-group" style={{ flex: 1, minWidth: 200 }}>
              <label className="form-label">Kullanıcı</label>
              <select className="form-select" value={selectedUserId}
                onChange={e => setSelectedUserId(e.target.value)} required>
                <option value="" disabled>Kullanıcı seçin…</option>
                {nonAdminUsers.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.firstName} {u.lastName} ({u.email}) — {u.role}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Rol</label>
              <select className="form-select" value={selectedRole}
                onChange={e => setSelectedRole(e.target.value as any)}>
                <option value="ADMIN">Admin</option>
                <option value="SUPER_ADMIN">Süper Admin</option>
              </select>
            </div>
            <button className="btn btn-primary" type="submit" disabled={promoting || !selectedUserId}>
              {promoting ? <Spinner /> : "Rolü Ata"}
            </button>
          </form>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: "center", padding: 64 }}><Spinner dark /></div>
      ) : admins.length === 0 ? (
        <EmptyState icon="👤" title="Yönetici bulunamadı" />
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead><tr>
              <th>Yönetici</th><th>E-posta</th><th>Rol</th><th>Durum</th><th>Katılım</th>
              {isSuperAdmin && <th>İşlemler</th>}
            </tr></thead>
            <tbody>
              {admins.map(a => (
                <tr key={a.id}>
                  <td style={{ fontWeight: 600 }}>{a.firstName} {a.lastName}</td>
                  <td style={{ fontSize: 13 }}>{a.email}</td>
                  <td>
                    <span className={`badge ${a.role === "SUPER_ADMIN" ? "badge-SHIPPED" : "badge-CONFIRMED"}`}>
                      {a.role === "SUPER_ADMIN" ? "🔐 Süper Admin" : "⚡ Admin"}
                    </span>
                  </td>
                  <td><StatusBadge status={a.status} /></td>
                  <td style={{ fontSize: 13, color: "var(--text-muted)" }}>
                    {new Date(a.createdAt).toLocaleDateString("tr-TR")}
                  </td>
                  {isSuperAdmin && (
                    <td>
                      {a.email !== user?.email && a.role !== "SUPER_ADMIN" && (
                        <button className="btn btn-ghost btn-sm"
                          onClick={() => handleDemote(a.id)}>
                          Yetkiyi Kaldır
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
