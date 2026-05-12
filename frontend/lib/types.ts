// ─── Enums ─────────────────────────────────────────────────────────────────
export type UserRole = "SUPER_ADMIN" | "ADMIN" | "PRODUCER" | "CONSUMER";
export type AccountStatus = "ACTIVE" | "INACTIVE" | "PENDING_APPROVAL" | "BANNED";
export type OrderStatus = "PENDING" | "CONFIRMED" | "PREPARING" | "SHIPPED" | "DELIVERED" | "CANCELLED" | "REFUNDED";
export type DeliveryType = "PICKUP" | "SHIPPING" | "BOTH";
export type PaymentStatus = "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED";

// ─── API Wrapper ───────────────────────────────────────────────────────────
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  timestamp?: string;
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
  first: boolean;
}

// ─── Auth ──────────────────────────────────────────────────────────────────
export interface UserDto {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  status: AccountStatus;
  createdAt: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  user: UserDto;
}

// ─── Category ─────────────────────────────────────────────────────────────
export interface Category {
  id: number;
  name: string;
  slug: string;
  iconUrl?: string;
  sortOrder?: number;
}

export interface City {
  id: number;
  name: string;
}

export interface District {
  id: number;
  name: string;
}

// ─── Producer ─────────────────────────────────────────────────────────────
export interface ProducerProfileResponse {
  id: number;
  userId: number;
  storeName: string;
  storeDescription?: string;
  logoUrl?: string;
  coverUrl?: string;
  cityName?: string;
  districtName?: string;
  address?: string;
  commissionRate?: number;
  approvalStatus: AccountStatus;
  rejectionReason?: string;
  totalSales?: number;
  rating?: number;
  ratingCount?: number;
  ownerName?: string;
  ownerEmail?: string;
  createdAt: string;
}

// ─── Product ──────────────────────────────────────────────────────────────
export interface ProductCategoryResponse {
  id: number;
  name: string;
  slug: string;
}

export interface ProducerSummaryResponse {
  id: number;
  storeName: string;
  logoUrl?: string;
  cityName?: string;
  rating?: number;
}

export interface ProductResponse {
  id: number;
  name: string;
  slug: string;
  description?: string;
  price: number;
  stockQuantity: number;
  unit?: string;
  minOrderQuantity?: number;
  deliveryType: DeliveryType;
  active: boolean;
  featured: boolean;
  soldCount?: number;
  rating?: number;
  ratingCount?: number;
  imageUrls?: string[];
  category?: ProductCategoryResponse;
  producer?: ProducerSummaryResponse;
  createdAt: string;
}

// ─── Order ────────────────────────────────────────────────────────────────
export interface OrderItemResponse {
  id: number;
  productId: number;
  productName: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
  status: OrderStatus;
  producerStoreName: string;
}

export interface OrderResponse {
  id: number;
  orderNumber: string;
  status: OrderStatus;
  deliveryType: DeliveryType;
  subtotal: number;
  commissionTotal: number;
  shippingFee: number;
  totalAmount: number;
  notes?: string;
  items: OrderItemResponse[];
  createdAt: string;
  updatedAt: string;
}

// ─── Payment ──────────────────────────────────────────────────────────────
export interface PaymentResponse {
  id: number;
  orderId: number;
  orderNumber: string;
  amount: number;
  status: PaymentStatus;
  method: string;
  transactionId?: string;
  paidAt?: string;
  createdAt: string;
}

// ─── Review ───────────────────────────────────────────────────────────────
export interface ReviewResponse {
  id: number;
  productId: number;
  productName: string;
  consumerId: number;
  consumerName: string;
  rating: number;
  comment?: string;
  approved: boolean;
  createdAt: string;
}

// ─── Address ──────────────────────────────────────────────────────────────
export interface AddressResponse {
  id: number;
  title: string;
  fullName: string;
  phone: string;
  cityId: number;
  cityName: string;
  districtId: number;
  districtName: string;
  address: string;
  zipCode?: string;
  isDefault: boolean;
}

// ─── Dashboard ────────────────────────────────────────────────────────────
export interface DashboardResponse {
  totalUsers: number;
  totalProducers: number;
  totalConsumers: number;
  pendingProducerApprovals: number;
  totalProducts: number;
  activeProducts: number;
  totalOrders: number;
  pendingOrders: number;
  deliveredOrders: number;
  totalRevenue: number;
  totalCommissionEarned: number;
  monthlyRevenue: number;
  monthlyCommission: number;
}

// ─── Reports ──────────────────────────────────────────────────────────────
export interface SalesReport {
  period: string;
  totalRevenue: number;
  totalCommission: number;
  orderCount: number;
  productCount: number;
  averageOrderValue: number;
}

export interface ProducerReport {
  producerId: number;
  storeName: string;
  totalSales: number;
  commissionPaid: number;
  netEarnings: number;
  orderCount: number;
  commissionRate: number;
}

export interface TopProductReport {
  productId: number;
  productName: string;
  storeName: string;
  soldCount: number;
  totalRevenue: number;
  rating: number;
}
