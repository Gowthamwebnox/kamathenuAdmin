// services/product.service.ts

import axiosInstance from "@/app/utils/axiosInstance"
import axios from "axios"


export class Product {
  static async getProducts(params: {
    categoryId?: string
    fromPrice?: number
    toPrice?: number
    search?: string
    limit?: number
    offset?: number
    isApproved?: boolean
    sellerType?: string
    userId?: string
  }) {
    console.log("params",params);
      const response = await axios.get("http://localhost:8000/api/admin/fetchAllProduct", {
      params
      // headers: {
      //   'x-session-data': session ? JSON.stringify(session) : '{}'
      // }
    })

    return response
  }

  static async approveProduct({ id, isApproved }: {
    id: string,
    isApproved: boolean
  }) {
      const response = await axiosInstance.patch(`/admin/approveProduct/${id}`, {
       isApproved 
    })

    return response.data
  }


  static async createProduct(productData: {
    sellerId: string;
    categoryId: string;
    name: string;
    productSKU: string;
    description: string;
    aboutProduct: any;
    isApproved: boolean;
    images: { imageUrl: string; isPrimary: boolean }[];
    variants: {
      title: string;
      productVariantSKU: string;
      description: string;
      price: number;
      stockQuantity: number;
      variantType: string;
      variantValue: string;
      additionalPrice: number;
    }[];
    discounts: any[];
  }) {
    const response = await axios.post("/api/admin/products", productData);
    return response.data;
  }




  


}
