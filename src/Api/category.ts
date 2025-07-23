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
    const response = await axios.post("http://localhost:8000/api/admin/newCategory", categoryData);
    return response.data.categories;
  }

  static async updateCategory(categoryData: { 
    id: string;
    name: string;
    description?: string;
    imageUrl?: string;
  }) {
    const response = await axios.put("http://localhost:8000/api/admin/updateCategory", categoryData);
    return response.data.categories;
  }
}