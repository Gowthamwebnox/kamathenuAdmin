import axios from "axios";

export class Commission {
  static async getCommissions() {
    const response = await axios.get("api/admin/commission");
    return response.data;
  }

  static async getCommissionById(id: string) {
    const response = await axios.get(`api/admin/commission?id=${id}`);
    return response.data;
  }

  static async createCommission(commissionData: { percentage: number }) {
    const response = await axios.post("api/admin/commission", commissionData);
    return response.data;
  }

  static async updateCommission(commissionData: { id: string; percentage: number }) {
    const response = await axios.put("api/admin/commission", commissionData);
    return response.data;
  }

  static async deleteCommission(id: string) {
    const response = await axios.delete(`api/admin/commission?id=${id}`);
    return response.data;
  }
} 