// src/services/sales.ts
import axios from "axios";
import { useQuery } from "@tanstack/react-query";

// Updated interfaces based on actual API response structure
export interface Address {
  id: string;
  userId: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  profile: string;
  firstName: string | null;
  lastName: string | null;
  name: string;
  roleId: string;
  isEmailVerified: boolean;
  emailVerifiedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface Seller {
  id: string;
  userId: string;
  storeName: string;
  storeDescription: string;
  bankAccountId: string;
  upiId: string;
  isApproved: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductImage {
  id: string;
  productId: string;
  imageUrl: string;
  isPrimary: boolean;
  createdAt: string;
}

export interface Product {
  id: string;
  sellerId: string;
  categoryId: string;
  name: string;
  description: string;
  isApproved: boolean;
  createdAt: string;
  updatedAt: string;
  aboutProduct: any;
  productSKU: string;
  images: ProductImage[];
}

export interface ProductVariant {
  id: string;
  productId: string;
  variantType: string;
  variantValue: string;
  additionalPrice: string;
  createdAt: string;
  updatedAt: string;
  description: string;
  price: string;
  stockQuantity: number;
  title: string;
  productVariantSKU: string;
  product: Product;
}

export interface Order {
  shippingAddress: Address;
  paymentStatus: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  sellerId: string;
  quantity: number;
  priceAtPurchase: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  productVariantId: string;
  status: string;
  order: Order;
  User: User;
  seller: Seller;
  productVariant: ProductVariant;
}

export interface OrdersResponse {
  count: {
    total: number;
  };
  orders: OrderItem[];
}

interface ApiResponse {
  version: string;
  validationErrors: any;
  code: number;
  status: string;
  message: string;
  data: OrdersResponse;
}

interface GetOrdersParams {
  productOwner?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export class SalesService {
  static async getOrders(params: GetOrdersParams) {
    try {
      const response = await axios.get("/api/admin/orders", {
        params: {
          productOwner: params.productOwner || undefined,
          search: params.search || undefined,
          limit: params.limit,
          offset: params.offset
        },
      });
      
      const apiResponse = response.data as ApiResponse;
      
      // Check if the response indicates an error
      if (apiResponse.status === 'error' || apiResponse.code >= 400) {
        throw new Error(apiResponse.message || 'Failed to fetch orders');
      }
      
      // Check if data is null or undefined
      if (!apiResponse.data) {
        return {
          data: [],
          totalCount: 0
        };
      }
      
      return {
        data: apiResponse.data.orders || [],
        totalCount: apiResponse.data.count?.total || 0
      };
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw error;
    }
  }

  static useOrdersQuery(params: GetOrdersParams) {
    return useQuery({
      queryKey: ["orders", params],
      queryFn: () => this.getOrders(params),
      retry: 1, // Only retry once on failure
      refetchOnWindowFocus: false, // Don't refetch when window regains focus
    });
  }
  
  static async getOrderById(id: string) {
    try {
      const response = await axios.get(`/api/admin/orders/${id}`);
      const apiResponse = response.data;
      
      // Check if the response indicates an error
      if (apiResponse.status === 'error' || apiResponse.code >= 400) {
        throw new Error(apiResponse.message || 'Failed to fetch order details');
      }
      
      // Check if data is null or undefined
      if (!apiResponse.data) {
        throw new Error('Order not found');
      }
      
      return apiResponse.data;
    } catch (error) {
      console.error('Error fetching order details:', error);
      throw error;
    }
  }
}