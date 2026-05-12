"use client";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/components/AuthProvider";
import { useToast, Spinner } from "@/components/UI";
import type { Category } from "@/lib/types";

export default function AdminCategoriesPage() {
  const { token } = useAuth();
  const { toast } = useToast();
  const [cats, setCats] = useState<Category[]>([]);
  const [newName, setNewName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    apiFetch<any>("/categories")
      .then(r => setCats(Array.isArray(r) ? r : r.content ?? r.data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function addCategory() {
    if (!newName.trim() || !token) return;
    setSaving(true);
    try {
      const saved = await apiFetch<Category>("/categories", {
        method: "POST",
        token,
        body: { name: newName.trim() },
      });
      setCats(prev => [...prev, saved]);
      setNewName("");
      toast("Kategori eklendi ✓");
    } catch (err: any) {
      toast(err?.message ?? "Kategori eklenemedi", "error");
    } finally {
      setSaving(false);
    }
  }

  async function deleteCategory(id: number) {
    if (!token) return;
    try {
      await apiFetch(`/categories/${id}`, { method: "DELETE", token });
      setCats(prev => prev.filter(c => c.id !== id));
      toast("Kategori silindi");
    } catch (err: any) {
      toast(err?.message ?? "Silinemedi", "error");
    }
  }

  return (
    <>
      <div className="admin-page-title"><h1>Kategoriler</h1><p>Ürün kategorilerini yönetin.</p></div>

      <div className="card" style={{ padding: 24, marginBottom: 24 }}>
        <h3 style={{ marginBottom: 16 }}>Yeni Kategori</h3>
        <div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
          <div className="form-group" style={{ flex: 1 }}>
            <label className="form-label">Kategori Adı</label>
            <input className="form-input" value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={e => e.key === "Enter" && addCategory()}
              placeholder="Örn: Kuruyemiş" disabled={saving} />
          </div>
          <button className="btn btn-primary" onClick={addCategory}
            disabled={!newName.trim() || saving}>
            {saving ? <Spinner /> : "+ Ekle"}
          </button>
        </div>
      </div>

      {loading ? <div style={{ textAlign: "center", padding: 64 }}><Spinner dark /></div> : (
        <div className="table-wrap">
          <table className="data-table">
            <thead><tr><th>ID</th><th>Kategori Adı</th><th>Slug</th><th>İşlemler</th></tr></thead>
            <tbody>
              {cats.map(c => (
                <tr key={c.id}>
                  <td style={{ color: "var(--text-muted)", fontSize: 13 }}>{c.id}</td>
                  <td style={{ fontWeight: 600 }}>{c.name}</td>
                  <td><code style={{ fontSize: 12, background: "var(--cream-100)", padding: "2px 6px", borderRadius: 4 }}>{c.slug}</code></td>
                  <td>
                    <button className="btn btn-danger btn-sm"
                      onClick={() => deleteCategory(c.id)}>Sil</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
