import axios from "axios";

export class Category {
  static async getCategories() {
    const response = await axios.get("http://localhost:8000/api/admin/fetchCategory");
    return response.data.categories; 
  } 
  
  
  static async createCategory(categoryData: { 
    name: string; 
    description?: string;
    imageUrl?: string;
  }) {
    const response = await axios.post("/api/admin/category", categoryData);
    return response.data.categories;
  }

  static async updateCategory(categoryData: { 
    id: string;
    name: string;
    description?: string;
    imageUrl?: string;
  }) {
    const response = await axios.put("/api/admin/category", categoryData);
    return response.data.categories;
  }
}