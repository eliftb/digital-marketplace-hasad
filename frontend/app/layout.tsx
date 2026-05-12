import type { Metadata } from "next";
import { AuthProvider } from "@/components/AuthProvider";
import { ToastProvider } from "@/components/UI";
import { Nav } from "@/components/Nav";
import "./globals.css";

export const metadata: Metadata = {
  title: "Hasad — Yerel Üreticiler Pazaryeri",
  description: "Doğrudan üreticiden taze, organik, doğal ürünler. Türkiye'nin dört bir yanından seçilmiş üreticiler.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body>
        <AuthProvider>
          <ToastProvider>
            <Nav />
            <main className="page">{children}</main>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
