"use client";
import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";

const NAV = [
  { section: "Genel", items: [
    { href: "/admin", label: "Dashboard", icon: "📊" },
    { href: "/admin/reports", label: "Raporlar", icon: "📈" },
  ]},
  { section: "Kullanıcılar", items: [
    { href: "/admin/users", label: "Kullanıcılar", icon: "👥" },
    { href: "/admin/producers", label: "Üreticiler", icon: "🌿" },
  ]},
  { section: "Ürünler & Siparişler", items: [
    { href: "/admin/products", label: "Ürünler", icon: "📦" },
    { href: "/admin/orders", label: "Siparişler", icon: "🚚" },
    { href: "/admin/payments", label: "Ödemeler", icon: "💳" },
    { href: "/admin/reviews", label: "Değerlendirmeler", icon: "⭐" },
  ]},
  { section: "Ayarlar", items: [
    { href: "/admin/cities", label: "Şehirler", icon: "🏙️" },
    { href: "/admin/categories", label: "Kategoriler", icon: "🗂️" },
    { href: "/admin/admins", label: "Yöneticiler", icon: "🔐" },
  ]},
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, ready } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (ready && (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN"))) {
      router.replace("/");
    }
  }, [ready, user, router]);

  if (!ready) return null;

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-brand">⚡ Hasad Admin</div>
        {NAV.map(group => (
          <div key={group.section}>
            <div className="admin-sidebar-section">{group.section}</div>
            {group.items.map(item => (
              <Link key={item.href} href={item.href}
                className={`admin-nav-link${pathname === item.href ? " active" : ""}`}>
                <span>{item.icon}</span> {item.label}
              </Link>
            ))}
          </div>
        ))}
      </aside>
      <div className="admin-content">{children}</div>
    </div>
  );
}
