# 🌿 Hasad — Yerel Üreticiler Dijital Pazar Yeri

BMB306 Yazılım Mühendisliği dersi kapsamında geliştirilmiş, yerel üreticileri tüketicilerle buluşturan tam yığın (full-stack) bir e-ticaret platformu.

---

## 📋 İçindekiler

- [Proje Hakkında](#proje-hakkında)
- [Teknoloji Yığını](#teknoloji-yığını)
- [Sistem Gereksinimleri](#sistem-gereksinimleri)
- [Kurulum ve Çalıştırma](#kurulum-ve-çalıştırma)
- [Varsayılan Kullanıcılar](#varsayılan-kullanıcılar)
- [Proje Yapısı](#proje-yapısı)
- [API Dokümantasyonu](#api-dokümantasyonu)
- [Özellikler](#özellikler)

---

## Proje Hakkında

**Hasad**, çiftçilerin ve yerel üreticilerin ürünlerini doğrudan tüketicilere ulaştırabildiği bir dijital pazar yeri platformudur. Platform; ürün listeleme, sipariş yönetimi, ödeme takibi, yorum sistemi ve kapsamlı bir yönetim paneli içermektedir.

---

## Teknoloji Yığını

### Backend
| Teknoloji | Versiyon |
|---|---|
| Java | 17 |
| Spring Boot | 3.2.3 |
| Spring Security + JWT | — |
| PostgreSQL | 15 |
| Flyway (DB Migration) | — |
| Maven | 3.8+ |

### Frontend
| Teknoloji | Versiyon |
|---|---|
| Next.js | 15.x |
| React | 19.x |
| TypeScript | 5.7+ |
| Node.js | 18+ |

---

## Sistem Gereksinimleri

Projeyi çalıştırmadan önce aşağıdakilerin kurulu olması gerekmektedir:

- **Java 17** (JDK) — [İndir](https://adoptium.net/)
- **Maven 3.8+** — [İndir](https://maven.apache.org/download.cgi)
- **Node.js 18+** — [İndir](https://nodejs.org/)
- **PostgreSQL 15** — [İndir](https://www.postgresql.org/download/) veya Docker
- **Docker** (isteğe bağlı, önerilen) — [İndir](https://www.docker.com/)

---

## Kurulum ve Çalıştırma

İki yöntem mevcuttur: **Docker ile** (önerilen, daha kolay) veya **manuel**.

---

### 🐳 Yöntem 1: Docker ile (Önerilen)

Bu yöntem PostgreSQL ve backend'i otomatik kurar. Sadece Docker yeterlidir.

**1. Repoyu klonlayın:**
```bash
git clone <repo-url>
cd digital-marketplace-backend
```

**2. Docker ile veritabanı + backend'i başlatın:**
```bash
docker-compose up -d
```

> İlk çalıştırmada Docker image build edilir, birkaç dakika sürebilir.

**3. Frontend'i başlatın:**
```bash
cd frontend
npm install
npm run dev
```

**4. Tarayıcıda açın:**
- 🌐 **Site:** http://localhost:3000
- 📚 **API Swagger:** http://localhost:8080/api/swagger-ui.html

---

### 🔧 Yöntem 2: Manuel Kurulum

#### Adım 1 — Veritabanını Hazırlayın

PostgreSQL kurulduktan sonra bir veritabanı oluşturun:

```sql
CREATE DATABASE pazaryeri_db;
```

> Kullanıcı adı: `postgres`, şifre: `postgres` (varsayılan)

#### Adım 2 — Backend'i Çalıştırın

```bash
cd digital-marketplace-backend

# Bağımlılıkları indirip projeyi derle ve çalıştır
mvn spring-boot:run
```

Backend başarıyla başladığında terminalde şunu görürsünüz:
```
Created ADMIN seed user: admin@pazaryeri.com
Created SUPER_ADMIN seed user: superadmin@pazaryeri.com
Started DijitalPazarYeriApplication in X.XXX seconds
```

> **Not:** Flyway migration'ları otomatik çalışır ve gerekli tabloları oluşturur.

#### Adım 3 — Frontend'i Çalıştırın

Yeni bir terminal açın:

```bash
cd digital-marketplace-backend/frontend

# Bağımlılıkları yükle
npm install

# Geliştirme sunucusunu başlat
npm run dev
```

#### Adım 4 — Tarayıcıda Açın

- 🌐 **Site:** http://localhost:3000
- 📚 **API Swagger:** http://localhost:8080/api/swagger-ui.html

---

### ⚙️ Ortam Değişkenleri (İsteğe Bağlı)

Varsayılan ayarlar çoğu geliştirme ortamı için çalışır. Özelleştirmek isterseniz:

| Değişken | Varsayılan | Açıklama |
|---|---|---|
| `DB_USERNAME` | `postgres` | PostgreSQL kullanıcı adı |
| `DB_PASSWORD` | `postgres` | PostgreSQL şifresi |
| `JWT_SECRET` | (dahili) | JWT imzalama anahtarı |
| `CORS_ORIGINS` | `http://localhost:3000` | İzin verilen frontend adresi |

---

## Varsayılan Kullanıcılar

Sistem ilk çalıştığında aşağıdaki kullanıcılar otomatik oluşturulur:

| Kullanıcı | E-posta | Şifre | Rol | Yetkiler |
|---|---|---|---|---|
| Platform Yöneticisi | `admin@pazaryeri.com` | `Admin123!` | ADMIN | Tüm admin paneli, kullanıcı/ürün/sipariş/yorum yönetimi |
| Süper Admin | `superadmin@pazaryeri.com` | `SuperAdmin123!` | SUPER_ADMIN | Admin yetkileri + rol atama + platform ayarları |

> **Not:** Üretici ve tüketici hesapları kayıt ekranından oluşturulabilir.

---

## Proje Yapısı

```
digital-marketplace-backend/
├── src/
│   ├── main/
│   │   ├── java/com/pazaryeri/
│   │   │   ├── config/          # Security, Seeder yapılandırmaları
│   │   │   ├── controller/      # REST API controller'ları
│   │   │   ├── dto/             # Request/Response DTO'ları
│   │   │   ├── entity/          # JPA entity sınıfları
│   │   │   ├── enums/           # UserRole, AccountStatus vb.
│   │   │   ├── exception/       # Global hata yönetimi
│   │   │   ├── repository/      # Spring Data JPA repository'leri
│   │   │   ├── security/        # JWT filter ve UserDetails
│   │   │   └── service/         # İş mantığı katmanı
│   │   └── resources/
│   │       ├── application.yml  # Uygulama yapılandırması
│   │       └── db/migration/    # Flyway SQL migration'ları
│   └── test/                    # Unit ve entegrasyon testleri
├── frontend/                    # Next.js frontend
│   ├── app/                     # Next.js App Router sayfaları
│   │   ├── admin/               # Yönetim paneli sayfaları
│   │   ├── producer/            # Üretici dashboard'u
│   │   ├── products/            # Ürün listeleme/detay
│   │   └── ...
│   ├── components/              # Paylaşılan UI bileşenleri
│   └── lib/                     # API client, tipler, yardımcılar
├── docker-compose.yml
├── Dockerfile
└── pom.xml
```

---

## API Dokümantasyonu

Backend çalışırken Swagger UI üzerinden tüm endpoint'leri interaktif olarak inceleyebilirsiniz:

**http://localhost:8080/api/swagger-ui.html**

### Temel Endpoint Grupları

| Grup | Prefix | Erişim |
|---|---|---|
| Kimlik Doğrulama | `/api/auth/**` | Herkese açık |
| Ürünler | `/api/products/**` | GET herkese açık, POST üretici |
| Kategoriler | `/api/categories/**` | GET herkese açık, POST/DELETE admin |
| Üreticiler | `/api/producers/**` | Public ve kimlik doğrulama gerektiren |
| Siparişler | `/api/orders/**` | Kimlik doğrulama gerekli |
| Sepet | `/api/cart/**` | Kimlik doğrulama gerekli |
| Yorumlar | `/api/reviews/**` | GET herkese açık, POST tüketici |
| Admin | `/api/admin/**` | Admin/Süper Admin |
| Raporlar | `/api/reports/**` | Admin ve üretici |

---

## Özellikler

### Tüketici
- Ürün arama ve filtreleme (kategori, şehir, fiyat, teslimat tipi)
- Favorilere ekleme
- Sepet yönetimi
- Sipariş verme ve takibi
- Satın alınan ürünlere yorum yapma
- Adres yönetimi

### Üretici
- Mağaza profili oluşturma ve yönetimi
- Ürün ekleme, düzenleme, aktif/pasif yapma
- Sipariş yönetimi ve durum güncelleme
- Aylık satış raporu

### Admin Paneli (`/admin`)
- Dashboard (genel istatistikler)
- Kullanıcı yönetimi (arama, filtreleme, banlama)
- Üretici onay/red sistemi
- Ürün ve sipariş yönetimi
- Yorum onaylama/silme
- Kategori yönetimi
- Şehir yönetimi
- Ödeme takibi
- Raporlar

### Süper Admin (ek yetkiler)
- Kullanıcı rol atama/değiştirme
- Platform ayarları yönetimi
- Komisyon oranı güncelleme

---

## Testleri Çalıştırma

```bash
cd digital-marketplace-backend
mvn test
```

---

## Notlar

- Sistem ilk çalıştığında Flyway migration'ları otomatik uygulanır.
- Yorumlar admin onayından sonra ürün sayfasında görünür hale gelir.
- Ürün yorumu yapabilmek için ilgili ürünü satın almış ve "Teslim Edildi" statüsüne ulaşmış olmak gerekir.
- Ödeme sistemi demo amaçlıdır, gerçek ödeme entegrasyonu kapsam dışındadır.
