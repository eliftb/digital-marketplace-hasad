"use client";
import { createContext, useCallback, useContext, useState, useEffect } from "react";
import type { OrderStatus, AccountStatus, DeliveryType } from "@/lib/types";

// ── Toast ────────────────────────────────────────────────
type Toast = { id: number; msg: string; type: "success" | "error" | "info" };
type ToastCtx = { toast: (msg: string, type?: Toast["type"]) => void };
const ToastContext = createContext<ToastCtx>({ toast: () => {} });

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  let next = 0;

  const toast = useCallback((msg: string, type: Toast["type"] = "success") => {
    const id = ++next;
    setToasts(t => [...t, { id, msg, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500);
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast ${t.type}`}>
            {t.type === "success" ? "✓" : t.type === "error" ? "✕" : "ℹ"} {t.msg}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
export const useToast = () => useContext(ToastContext);

// ── Modal ────────────────────────────────────────────────
export function Modal({ open, onClose, title, children }: {
  open: boolean; onClose: () => void; title?: string; children: React.ReactNode;
}) {
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        {title && (
          <div className="modal-header">
            <h3>{title}</h3>
            <button className="modal-close" onClick={onClose}>×</button>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}

// ── Stars ────────────────────────────────────────────────
export function Stars({ rating, count }: { rating?: number; count?: number }) {
  if (!rating) return null;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
      <div className="stars">
        {[1,2,3,4,5].map(i => (
          <span key={i} className={`star${i <= Math.round(rating) ? "" : " empty"}`}>★</span>
        ))}
      </div>
      <span style={{ fontSize: 12, color: "var(--gold-600)", fontWeight: 700 }}>{rating.toFixed(1)}</span>
      {count !== undefined && <span style={{ fontSize: 12, color: "var(--text-muted)" }}>({count})</span>}
    </div>
  );
}

// ── Pagination ───────────────────────────────────────────
export function Pagination({ page, totalPages, onChange }: {
  page: number; totalPages: number; onChange: (p: number) => void;
}) {
  if (totalPages <= 1) return null;
  const pages = Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i);
  return (
    <div className="pagination">
      <button className="page-btn" disabled={page === 0} onClick={() => onChange(page - 1)}>‹</button>
      {pages.map(p => (
        <button key={p} className={`page-btn${p === page ? " active" : ""}`} onClick={() => onChange(p)}>{p + 1}</button>
      ))}
      <button className="page-btn" disabled={page >= totalPages - 1} onClick={() => onChange(page + 1)}>›</button>
    </div>
  );
}

// ── Badge ────────────────────────────────────────────────
const STATUS_LABELS: Record<string, string> = {
  ACTIVE: "Aktif", INACTIVE: "Pasif", PENDING_APPROVAL: "Onay Bekliyor", BANNED: "Banlı",
  PENDING: "Bekliyor", CONFIRMED: "Onaylandı", PREPARING: "Hazırlanıyor",
  SHIPPED: "Kargoda", DELIVERED: "Teslim Edildi", CANCELLED: "İptal", REFUNDED: "İade",
  COMPLETED: "Tamamlandı", FAILED: "Başarısız",
  PICKUP: "Teslim Alma", SHIPPING: "Kargo", BOTH: "Her İkisi",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`badge badge-${status}`}>
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}

// ── Empty State ──────────────────────────────────────────
export function EmptyState({ icon, title, desc, action }: {
  icon: string; title: string; desc?: string; action?: React.ReactNode;
}) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">{icon}</div>
      <h3>{title}</h3>
      {desc && <p>{desc}</p>}
      {action && <div style={{ marginTop: 16 }}>{action}</div>}
    </div>
  );
}

// ── Spinner ──────────────────────────────────────────────
export function Spinner({ dark }: { dark?: boolean }) {
  return <span className={`spinner${dark ? " dark" : ""}`} />;
}

// ── Confirm Modal ────────────────────────────────────────
export function ConfirmModal({ open, onClose, onConfirm, title, desc, danger }: {
  open: boolean; onClose: () => void; onConfirm: () => void;
  title: string; desc?: string; danger?: boolean;
}) {
  return (
    <Modal open={open} onClose={onClose} title={title}>
      {desc && <p style={{ marginBottom: 24, color: "var(--text-secondary)" }}>{desc}</p>}
      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
        <button className="btn btn-ghost" onClick={onClose}>İptal</button>
        <button className={`btn ${danger ? "btn-danger" : "btn-primary"}`} onClick={onConfirm}>Onayla</button>
      </div>
    </Modal>
  );
}
