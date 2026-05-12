"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/components/AuthProvider";
import { useToast, Spinner, EmptyState, Modal } from "@/components/UI";
import type { AddressResponse, City, District } from "@/lib/types";

export default function AddressesPage() {
  const { token, user, ready } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const [addresses, setAddresses] = useState<AddressResponse[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editAddress, setEditAddress] = useState<AddressResponse | null>(null);
  const [saving, setSaving] = useState(false);
  const [selectedCityId, setSelectedCityId] = useState<number | "">("");

  // Form fields
  const [form, setForm] = useState({
    title: "", fullName: "", phone: "", cityId: "", districtId: "", address: "", zipCode: "", isDefault: false,
  });

  useEffect(() => {
    if (ready && !user) router.replace("/auth");
  }, [ready, user, router]);

  useEffect(() => {
    if (!token) return;
    Promise.all([
      apiFetch<AddressResponse[]>("/addresses", { token }),
      apiFetch<any>("/cities").then(r => Array.isArray(r) ? r : r.content ?? r.data ?? []),
    ]).then(([addrs, ctys]) => {
      setAddresses(addrs);
      setCities(ctys);
    }).catch(() => {})
    .finally(() => setLoading(false));
  }, [token]);

  useEffect(() => {
    if (!selectedCityId) { setDistricts([]); return; }
    apiFetch<District[]>(`/cities/${selectedCityId}/districts`)
      .then(r => setDistricts(Array.isArray(r) ? r : (r as any).content ?? []))
      .catch(() => setDistricts([]));
  }, [selectedCityId]);

  function openNew() {
    setEditAddress(null);
    setForm({ title: "", fullName: "", phone: "", cityId: "", districtId: "", address: "", zipCode: "", isDefault: false });
    setSelectedCityId("");
    setDistricts([]);
    setShowForm(true);
  }

  function openEdit(a: AddressResponse) {
    setEditAddress(a);
    setForm({
      title: a.title, fullName: a.fullName, phone: a.phone,
      cityId: String(a.cityId), districtId: String(a.districtId),
      address: a.address, zipCode: a.zipCode ?? "", isDefault: a.isDefault,
    });
    setSelectedCityId(a.cityId);
    setShowForm(true);
  }

  async function handleSave() {
    if (!form.title || !form.fullName || !form.phone || !form.cityId || !form.districtId || !form.address) {
      toast("Lütfen tüm zorunlu alanları doldurun", "error"); return;
    }
    setSaving(true);
    const body = {
      title: form.title, fullName: form.fullName, phone: form.phone,
      cityId: Number(form.cityId), districtId: Number(form.districtId),
      address: form.address, zipCode: form.zipCode || undefined,
      isDefault: form.isDefault,
    };
    try {
      if (editAddress) {
        const updated = await apiFetch<AddressResponse>(`/addresses/${editAddress.id}`, { method: "PUT", token: token!, body });
        setAddresses(prev => prev.map(a => a.id === editAddress.id ? updated : a));
        toast("Adres güncellendi ✓");
      } else {
        const created = await apiFetch<AddressResponse>("/addresses", { method: "POST", token: token!, body });
        setAddresses(prev => [...prev, created]);
        toast("Adres eklendi ✓");
      }
      setShowForm(false);
    } catch (err) {
      toast(err instanceof Error ? err.message : "Kaydedilemedi", "error");
    } finally { setSaving(false); }
  }

  async function handleDelete(id: number) {
    try {
      await apiFetch(`/addresses/${id}`, { method: "DELETE", token: token! });
      setAddresses(prev => prev.filter(a => a.id !== id));
      toast("Adres silindi");
    } catch (err) { toast(err instanceof Error ? err.message : "Silinemedi", "error"); }
  }

  async function setDefault(id: number) {
    try {
      await apiFetch(`/addresses/${id}/set-default`, { method: "PATCH", token: token! });
      setAddresses(prev => prev.map(a => ({ ...a, isDefault: a.id === id })));
      toast("Varsayılan adres güncellendi ✓");
    } catch (err) { toast(err instanceof Error ? err.message : "Hata", "error"); }
  }

  if (!ready || loading) return <div style={{ display: "flex", justifyContent: "center", padding: 80 }}><Spinner dark /></div>;

  return (
    <div className="container" style={{ paddingTop: 40, paddingBottom: 64 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32 }}>
        <div>
          <div className="section-label">Hesabım</div>
          <h2>Adreslerim</h2>
        </div>
        <button className="btn btn-primary" onClick={openNew}>+ Yeni Adres</button>
      </div>

      {addresses.length === 0 ? (
        <EmptyState icon="📍" title="Henüz adresiniz yok"
          desc="Sipariş verebilmek için en az bir adres ekleyin."
          action={<button className="btn btn-primary" onClick={openNew}>Adres Ekle</button>} />
      ) : (
        <div className="grid-2">
          {addresses.map(a => (
            <div key={a.id} className="card" style={{ padding: 20, position: "relative", border: a.isDefault ? "2px solid var(--olive-500)" : undefined }}>
              {a.isDefault && (
                <span style={{ position: "absolute", top: 12, right: 12, background: "var(--olive-100)", color: "var(--olive-700)", fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 50 }}>
                  ✓ Varsayılan
                </span>
              )}
              <h4 style={{ marginBottom: 6 }}>{a.title}</h4>
              <div style={{ fontSize: 14, color: "var(--text-secondary)", display: "flex", flexDirection: "column", gap: 3 }}>
                <div>👤 {a.fullName}</div>
                <div>📞 {a.phone}</div>
                <div>📍 {a.address}</div>
                <div>🏙️ {a.districtName} / {a.cityName} {a.zipCode ? `(${a.zipCode})` : ""}</div>
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
                <button className="btn btn-ghost btn-sm" onClick={() => openEdit(a)}>Düzenle</button>
                {!a.isDefault && (
                  <button className="btn btn-outline btn-sm" onClick={() => setDefault(a.id)}>Varsayılan Yap</button>
                )}
                <button className="btn btn-danger btn-sm" style={{ marginLeft: "auto" }} onClick={() => handleDelete(a.id)}>Sil</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Adres Formu Modal */}
      <Modal open={showForm} onClose={() => setShowForm(false)} title={editAddress ? "Adresi Düzenle" : "Yeni Adres Ekle"}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="form-group">
            <label className="form-label">Adres Başlığı *</label>
            <input className="form-input" placeholder="Örn: Ev, İş, Yazlık" value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
          </div>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Ad Soyad *</label>
              <input className="form-input" placeholder="Ayşe Demir" value={form.fullName}
                onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Telefon *</label>
              <input className="form-input" placeholder="05XX XXX XX XX" value={form.phone}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
            </div>
          </div>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Şehir *</label>
              <select className="form-select" value={form.cityId}
                onChange={e => { setForm(f => ({ ...f, cityId: e.target.value, districtId: "" })); setSelectedCityId(Number(e.target.value)); }}>
                <option value="">Şehir seçin…</option>
                {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">İlçe *</label>
              <select className="form-select" value={form.districtId}
                onChange={e => setForm(f => ({ ...f, districtId: e.target.value }))}
                disabled={!form.cityId || districts.length === 0}>
                <option value="">İlçe seçin…</option>
                {districts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Açık Adres *</label>
            <textarea className="form-textarea" rows={3} placeholder="Mahalle, sokak, bina no, daire no…"
              value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} />
          </div>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Posta Kodu</label>
              <input className="form-input" placeholder="34000" value={form.zipCode}
                onChange={e => setForm(f => ({ ...f, zipCode: e.target.value }))} />
            </div>
            <div className="form-group" style={{ justifyContent: "flex-end" }}>
              <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", marginTop: 28 }}>
                <input type="checkbox" checked={form.isDefault}
                  onChange={e => setForm(f => ({ ...f, isDefault: e.target.checked }))} />
                <span style={{ fontSize: 14 }}>Varsayılan adres olarak ayarla</span>
              </label>
            </div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setShowForm(false)}>İptal</button>
            <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleSave} disabled={saving}>
              {saving ? <Spinner /> : editAddress ? "Güncelle" : "Kaydet"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
