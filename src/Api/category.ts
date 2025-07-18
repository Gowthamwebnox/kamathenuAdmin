import axios from "axios";

export class Category {
  static async getCategories() {
    const response = await axios.get("/api/admin/category");
    return response.data.data; 
  } 
  
  
  static async createCategory(categoryData: { 
    name: string; 
    description?: string;
    imageUrl?: string;
  }) {
    const response = await axios.post("/api/admin/category", categoryData);
    return response.data.data;
  }

  static async updateCategory(categoryData: { 
    id: string;
    name: string;
    description?: string;
    imageUrl?: string;
  }) {
    const response = await axios.put("/api/admin/category", categoryData);
    return response.data.data;
  }
}