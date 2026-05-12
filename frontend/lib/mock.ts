import type { ProductResponse, ProducerProfileResponse, Category } from "./types";

export const MOCK_CATEGORIES: Category[] = [
  { id: 1, name: "Meyve & Sebze", slug: "meyve-sebze" },
  { id: 2, name: "Süt & Peynir", slug: "sut-peynir" },
  { id: 3, name: "Tahıl & Bakliyat", slug: "tahil-bakliyat" },
  { id: 4, name: "Bal & Reçel", slug: "bal-recel" },
  { id: 5, name: "Zeytin & Yağ", slug: "zeytin-yag" },
  { id: 6, name: "Et & Tavuk", slug: "et-tavuk" },
  { id: 7, name: "Kuruyemiş", slug: "kuruyemis" },
  { id: 8, name: "Baharat & Ot", slug: "baharat-ot" },
];

export const MOCK_PRODUCERS: ProducerProfileResponse[] = [
  {
    id: 1, userId: 10,
    storeName: "Ege'nin Bereketi",
    storeDescription: "Ege'nin bereketli topraklarından doğrudan sofralarınıza. 3. nesil zeytinliklerimizden sıkma yağlar ve organik sebzeler.",
    logoUrl: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=150&h=150&fit=crop&crop=center",
    coverUrl: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=800&h=300&fit=crop",
    cityName: "İzmir", districtName: "Selçuk",
    commissionRate: 8, approvalStatus: "ACTIVE",
    totalSales: 48750, rating: 4.9, ratingCount: 312,
    ownerName: "Mehmet Yılmaz", ownerEmail: "mehmet@egebeberketi.com",
    createdAt: "2024-01-15T10:00:00"
  },
  {
    id: 2, userId: 11,
    storeName: "Karadeniz Sofrası",
    storeDescription: "Karadeniz'in serin iklimiyle büyüyen fındık, çay ve organik bal. Doğanın hediyeleri doğrudan size.",
    logoUrl: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=150&h=150&fit=crop&crop=center",
    coverUrl: "https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?w=800&h=300&fit=crop",
    cityName: "Trabzon", districtName: "Araklı",
    commissionRate: 10, approvalStatus: "ACTIVE",
    totalSales: 32100, rating: 4.7, ratingCount: 198,
    ownerName: "Ayşe Demir", ownerEmail: "ayse@karadenizsofrasi.com",
    createdAt: "2024-02-20T10:00:00"
  },
  {
    id: 3, userId: 12,
    storeName: "Anadolu Bağları",
    storeDescription: "Orta Anadolu'nun güneş alan bağlarında yetişen üzüm ve kurutulmuş meyveler. Hiçbir katkı maddesi yok.",
    logoUrl: "https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=150&h=150&fit=crop&crop=center",
    coverUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=300&fit=crop",
    cityName: "Nevşehir", districtName: "Ürgüp",
    commissionRate: 9, approvalStatus: "ACTIVE",
    totalSales: 21500, rating: 4.8, ratingCount: 143,
    ownerName: "Ali Kaya", ownerEmail: "ali@anadoluboglari.com",
    createdAt: "2024-03-10T10:00:00"
  },
  {
    id: 4, userId: 13,
    storeName: "Çukurova Çiftliği",
    storeDescription: "Adana ovasının verimli topraklarından taze narenciye, nar ve kışlık sebzeler.",
    logoUrl: "https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=150&h=150&fit=crop&crop=center",
    coverUrl: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&h=300&fit=crop",
    cityName: "Adana", districtName: "Yüreğir",
    commissionRate: 10, approvalStatus: "ACTIVE",
    totalSales: 15800, rating: 4.6, ratingCount: 87,
    ownerName: "Fatma Şahin", ownerEmail: "fatma@cukurovaciftligi.com",
    createdAt: "2024-04-05T10:00:00"
  },
];

export const MOCK_PRODUCTS: ProductResponse[] = [
  // Zeytin & Yağ
  {
    id: 1, name: "Erken Hasat Zeytinyağı", slug: "erken-hasat-zeytinyagi",
    description: "Kasım ayında toplanmış, soğuk sıkım Memecik zeytinlerinden üretilmiş. Koyu yeşil rengi ve meyvemsi aromasıyla en kaliteli zeytinyağı.",
    price: 245, stockQuantity: 48, unit: "lt", minOrderQuantity: 1,
    deliveryType: "BOTH", active: true, featured: true, soldCount: 234, rating: 4.9, ratingCount: 87,
    imageUrls: [
      "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1522992319-0365e5f11656?w=600&h=600&fit=crop"
    ],
    category: { id: 5, name: "Zeytin & Yağ", slug: "zeytin-yag" },
    producer: { id: 1, storeName: "Ege'nin Bereketi", logoUrl: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=80&h=80&fit=crop", cityName: "İzmir", rating: 4.9 },
    createdAt: "2025-01-10T10:00:00"
  },
  {
    id: 2, name: "Sele Siyah Zeytin", slug: "sele-siyah-zeytin",
    description: "Kış günlerine özel, doğal salamura ile hazırlanmış Gemlik zeytini. İri taneli ve dolgun etli yapısıyla sofraların vazgeçilmezi.",
    price: 89, stockQuantity: 120, unit: "kg", minOrderQuantity: 1,
    deliveryType: "BOTH", active: true, featured: true, soldCount: 456, rating: 4.8, ratingCount: 145,
    imageUrls: ["https://images.unsplash.com/photo-1601648764658-cf37e8c89b70?w=600&h=600&fit=crop"],
    category: { id: 5, name: "Zeytin & Yağ", slug: "zeytin-yag" },
    producer: { id: 1, storeName: "Ege'nin Bereketi", logoUrl: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=80&h=80&fit=crop", cityName: "İzmir", rating: 4.9 },
    createdAt: "2025-01-12T10:00:00"
  },
  // Bal & Reçel
  {
    id: 3, name: "Karakovan Çiçek Balı", slug: "karakovan-cicek-bali",
    description: "Karadeniz yaylalarında geleneksel karakovan yöntemiyle üretilmiş. Hiçbir işlem görmemiş, doğal enzimler korunmuş saf bal.",
    price: 320, stockQuantity: 30, unit: "kg", minOrderQuantity: 1,
    deliveryType: "SHIPPING", active: true, featured: true, soldCount: 189, rating: 5.0, ratingCount: 78,
    imageUrls: ["https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=600&h=600&fit=crop"],
    category: { id: 4, name: "Bal & Reçel", slug: "bal-recel" },
    producer: { id: 2, storeName: "Karadeniz Sofrası", logoUrl: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=80&h=80&fit=crop", cityName: "Trabzon", rating: 4.7 },
    createdAt: "2025-02-01T10:00:00"
  },
  {
    id: 4, name: "Güllü Reçel", slug: "gullu-recel",
    description: "Isparta'dan getirilen yağlı gül yapraklarıyla yapılan geleneksel gül reçeli. Kokusunu ve rengini yıl boyu koruyan özel tarif.",
    price: 75, stockQuantity: 80, unit: "adet", minOrderQuantity: 1,
    deliveryType: "SHIPPING", active: true, featured: false, soldCount: 112, rating: 4.7, ratingCount: 43,
    imageUrls: ["https://images.unsplash.com/photo-1563636619-e9143da7973b?w=600&h=600&fit=crop"],
    category: { id: 4, name: "Bal & Reçel", slug: "bal-recel" },
    producer: { id: 2, storeName: "Karadeniz Sofrası", logoUrl: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=80&h=80&fit=crop", cityName: "Trabzon", rating: 4.7 },
    createdAt: "2025-02-15T10:00:00"
  },
  // Meyve & Sebze
  {
    id: 5, name: "Organik Domates (Çeri)", slug: "organik-domates-ceri",
    description: "Güneş altında olgunlaşmış, hiç ilaçlanmamış çeri domates. Sera değil, açık tarla. Kendi tohumundan yetişen ata tohumu çeşidi.",
    price: 35, stockQuantity: 200, unit: "kg", minOrderQuantity: 2,
    deliveryType: "BOTH", active: true, featured: true, soldCount: 678, rating: 4.8, ratingCount: 234,
    imageUrls: ["https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=600&h=600&fit=crop"],
    category: { id: 1, name: "Meyve & Sebze", slug: "meyve-sebze" },
    producer: { id: 4, storeName: "Çukurova Çiftliği", logoUrl: "https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=80&h=80&fit=crop", cityName: "Adana", rating: 4.6 },
    createdAt: "2025-03-01T10:00:00"
  },
  {
    id: 6, name: "Taze Narenciye Kutusu (5 kg)", slug: "taze-narenciye-kutusu",
    description: "Portakal, mandarin ve limondan oluşan mevsim narenciye kutusu. Her hafta tarladan toplanıp gönderilir.",
    price: 125, stockQuantity: 65, unit: "kutu", minOrderQuantity: 1,
    deliveryType: "SHIPPING", active: true, featured: false, soldCount: 345, rating: 4.6, ratingCount: 98,
    imageUrls: ["https://images.unsplash.com/photo-1547514701-42782101795e?w=600&h=600&fit=crop"],
    category: { id: 1, name: "Meyve & Sebze", slug: "meyve-sebze" },
    producer: { id: 4, storeName: "Çukurova Çiftliği", logoUrl: "https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=80&h=80&fit=crop", cityName: "Adana", rating: 4.6 },
    createdAt: "2025-03-10T10:00:00"
  },
  // Tahıl & Bakliyat
  {
    id: 7, name: "Taş Değirmende Tam Buğday Unu", slug: "tas-degirmende-tam-bugday-unu",
    description: "Geleneksel taş değirmende öğütülmüş, tam tahıl unu. Kepek ayrılmamış, vitamin ve mineraller korunmuş.",
    price: 42, stockQuantity: 300, unit: "kg", minOrderQuantity: 5,
    deliveryType: "BOTH", active: true, featured: false, soldCount: 156, rating: 4.7, ratingCount: 67,
    imageUrls: ["https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&h=600&fit=crop"],
    category: { id: 3, name: "Tahıl & Bakliyat", slug: "tahil-bakliyat" },
    producer: { id: 3, storeName: "Anadolu Bağları", logoUrl: "https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=80&h=80&fit=crop", cityName: "Nevşehir", rating: 4.8 },
    createdAt: "2025-01-20T10:00:00"
  },
  {
    id: 8, name: "Ev Yapımı Kuru Fasulye", slug: "ev-yapimi-kuru-fasulye",
    description: "Ata tohumu Dermason fasulye. Kimyasal gübre kullanılmamış, yavaş büyütülmüş. Pişerken dağılmaz, lezzetlidir.",
    price: 55, stockQuantity: 180, unit: "kg", minOrderQuantity: 2,
    deliveryType: "BOTH", active: true, featured: false, soldCount: 289, rating: 4.9, ratingCount: 112,
    imageUrls: ["https://images.unsplash.com/photo-1515543904379-3d757abe528b?w=600&h=600&fit=crop"],
    category: { id: 3, name: "Tahıl & Bakliyat", slug: "tahil-bakliyat" },
    producer: { id: 3, storeName: "Anadolu Bağları", logoUrl: "https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=80&h=80&fit=crop", cityName: "Nevşehir", rating: 4.8 },
    createdAt: "2025-02-05T10:00:00"
  },
  // Kuruyemiş
  {
    id: 9, name: "Giresun Tombul Fındık", slug: "giresun-tombul-findik",
    description: "Coğrafi işaretli Giresun tombul fındığı. 2024 hasat, kavurma yok, çiğ. Omega-3 ve vitamin E zengini.",
    price: 185, stockQuantity: 90, unit: "kg", minOrderQuantity: 1,
    deliveryType: "SHIPPING", active: true, featured: true, soldCount: 423, rating: 4.9, ratingCount: 178,
    imageUrls: ["https://images.unsplash.com/photo-1567529684892-09290a1b2d05?w=600&h=600&fit=crop"],
    category: { id: 7, name: "Kuruyemiş", slug: "kuruyemis" },
    producer: { id: 2, storeName: "Karadeniz Sofrası", logoUrl: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=80&h=80&fit=crop", cityName: "Trabzon", rating: 4.7 },
    createdAt: "2024-11-01T10:00:00"
  },
  {
    id: 10, name: "Sultani Üzüm (Kurutulmuş)", slug: "sultani-uzum-kurutulmus",
    description: "Manisa'nın meşhur Sultani çekirdeksiz üzümü. Güneşte kurutulmuş, hiç kükürt kullanılmamış. Doğal sarı rengi.",
    price: 68, stockQuantity: 140, unit: "kg", minOrderQuantity: 1,
    deliveryType: "BOTH", active: true, featured: false, soldCount: 267, rating: 4.7, ratingCount: 89,
    imageUrls: ["https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=600&h=600&fit=crop"],
    category: { id: 7, name: "Kuruyemiş", slug: "kuruyemis" },
    producer: { id: 3, storeName: "Anadolu Bağları", logoUrl: "https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=80&h=80&fit=crop", cityName: "Nevşehir", rating: 4.8 },
    createdAt: "2024-10-15T10:00:00"
  },
  // Süt & Peynir
  {
    id: 11, name: "Ezine Beyaz Peyniri", slug: "ezine-beyaz-peyniri",
    description: "Koyun, keçi ve inek sütünün özel karışımından yapılan Ezine peyniri. Coğrafi işaretli, 6 ay salamurada bekletilmiş.",
    price: 145, stockQuantity: 55, unit: "kg", minOrderQuantity: 1,
    deliveryType: "SHIPPING", active: true, featured: true, soldCount: 198, rating: 4.8, ratingCount: 65,
    imageUrls: ["https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=600&h=600&fit=crop"],
    category: { id: 2, name: "Süt & Peynir", slug: "sut-peynir" },
    producer: { id: 1, storeName: "Ege'nin Bereketi", logoUrl: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=80&h=80&fit=crop", cityName: "İzmir", rating: 4.9 },
    createdAt: "2025-01-05T10:00:00"
  },
  {
    id: 12, name: "Doğal Yoğurt (Kaymak Üstü)", slug: "dogal-yogurt-kaymak-ustu",
    description: "Serbest gezen ineklerin günlük sütünden yapılan ev yoğurdu. Kaymak üstü, katkısız. Soğuk zincir korunarak gönderilir.",
    price: 48, stockQuantity: 80, unit: "kg", minOrderQuantity: 2,
    deliveryType: "BOTH", active: true, featured: false, soldCount: 334, rating: 4.9, ratingCount: 143,
    imageUrls: ["https://images.unsplash.com/photo-1488477181228-de49aa98fe5a?w=600&h=600&fit=crop"],
    category: { id: 2, name: "Süt & Peynir", slug: "sut-peynir" },
    producer: { id: 4, storeName: "Çukurova Çiftliği", logoUrl: "https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=80&h=80&fit=crop", cityName: "Adana", rating: 4.6 },
    createdAt: "2025-02-20T10:00:00"
  },
];

export function getMockProducts(opts?: {
  search?: string;
  categoryId?: number;
  featured?: boolean;
  page?: number;
  size?: number;
}): { content: ProductResponse[]; totalElements: number; totalPages: number; page: number; size: number; first: boolean; last: boolean } {
  const { search = "", categoryId, featured, page = 0, size = 12 } = opts ?? {};
  let list = [...MOCK_PRODUCTS];
  if (search) list = list.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
  if (categoryId) list = list.filter(p => p.category?.id === categoryId);
  if (featured !== undefined) list = list.filter(p => p.featured === featured);
  const total = list.length;
  const sliced = list.slice(page * size, page * size + size);
  return {
    content: sliced,
    totalElements: total,
    totalPages: Math.ceil(total / size),
    page, size,
    first: page === 0,
    last: (page + 1) * size >= total,
  };
}
