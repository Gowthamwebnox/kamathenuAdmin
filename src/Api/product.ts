// services/product.service.ts

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
  }, session?: any) {
    const response = await axios.get("api/admin/products", {
      params,
      headers: {
        'x-session-data': session ? JSON.stringify(session) : '{}'
      }
    })

    return response.data
  }

  static async approveProduct({ id, isApproved }: {
    id: string,
    isApproved: boolean
  }) {
    const response = await axios.patch(`api/admin/products/${id}/approve`, {
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
