"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "./AuthProvider";
import { apiFetch } from "@/lib/api";

export function Nav() {
  const { user, logout, ready, token } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [cartCount, setCartCount] = useState(0);

  const a = (href: string) => pathname === href || pathname.startsWith(href + "/") ? "nav-link active" : "nav-link";
  const isAdmin = user?.role === "ADMIN" || user?.role === "SUPER_ADMIN";
  const isProducer = user?.role === "PRODUCER";
  const isConsumer = user?.role === "CONSUMER";

  // Sepet sayısını her sayfa değişiminde güncelle
  useEffect(() => {
    if (!token || !isConsumer) { setCartCount(0); return; }
    apiFetch<{ count: number }>("/cart/count", { token })
      .then(r => setCartCount(r.count))
      .catch(() => {});
  }, [token, isConsumer, pathname]);

  return (
    <header className="nav">
      <Link href="/" className="nav-brand">
        Hasa<span>d</span>
      </Link>

      <nav className="nav-links">
        <Link href="/" className={a("/")}>Ürünler</Link>
        <Link href="/producers" className={a("/producers")}>Üreticiler</Link>
        {user && <Link href="/favorites" className={a("/favorites")}>Favoriler</Link>}
        {user && <Link href="/orders" className={a("/orders")}>Siparişlerim</Link>}
        {user && <Link href="/addresses" className={a("/addresses")}>Adreslerim</Link>}
        {isProducer && <Link href="/producer/dashboard" className={a("/producer/dashboard")}>Mağazam</Link>}
        {isAdmin && <Link href="/admin" className={a("/admin")}>Yönetim</Link>}
      </nav>

      <div className="nav-right">
        {!ready ? null : user ? (
          <>
            {/* Sepet butonu — sadece tüketici */}
            {isConsumer && (
              <Link href="/cart" style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center", width: 40, height: 40, borderRadius: "var(--radius-sm)", background: pathname === "/cart" ? "var(--olive-100)" : "transparent", transition: "var(--transition)" }}>
                <span style={{ fontSize: 20 }}>🛒</span>
                {cartCount > 0 && (
                  <span style={{
                    position: "absolute", top: 2, right: 2,
                    background: "var(--gold-500)", color: "var(--olive-900)",
                    borderRadius: "50%", width: 18, height: 18,
                    fontSize: 10, fontWeight: 800,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    border: "2px solid white"
                  }}>{cartCount > 9 ? "9+" : cartCount}</span>
                )}
              </Link>
            )}

            {isConsumer && (
              <Link href="/producer/register" className="btn btn-gold btn-sm">
                🌿 Üretici Ol
              </Link>
            )}
            <div className="user-chip">
              <div className="user-avatar">
                {user.firstName?.[0]}{user.lastName?.[0]}
              </div>
              <span className="user-name">{user.firstName}</span>
              <button className="btn btn-ghost btn-sm" onClick={() => { logout(); router.push("/"); }}>
                Çıkış
              </button>
            </div>
          </>
        ) : (
          <>
            <Link href="/producer/register" className="btn btn-ghost btn-sm">🌿 Üretici Ol</Link>
            <Link href="/auth" className="btn btn-primary btn-sm">Giriş / Kayıt</Link>
          </>
        )}
      </div>
    </header>
  );
}
