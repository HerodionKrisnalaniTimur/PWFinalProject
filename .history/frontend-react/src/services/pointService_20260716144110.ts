import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

export interface PointActivityData {
  id?: number;
  user_id?: number | null;
  wallet_address?: string | null;
  activity_type: string;
  description: string;
  points: number;
  chain?: string | null;
  created_at?: string;
}

/**
 * Mengambil riwayat poin untuk user/wallet tertentu
 */
export const fetchPointActivities = async (filters: { wallet_address?: string; user_id?: number; limit?: number }) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/point-activities`, {
      params: filters
    });
    return response.data;
  } catch (error) {
    console.error("Gagal mengambil aktivitas poin dari database:", error);
    throw error;
  }
};

/**
 * Mencatat aktivitas poin baru ke database.
 * Response-nya membawa 'total_points' hasil hitungan resmi dari backend.
 */
export const storePointActivity = async (data: PointActivityData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/point-activities`, data);
    return response.data;
  } catch (error) {
    console.error("Gagal mencatat aktivitas poin ke database:", error);
    throw error;
  }
};

/**
 * Mengambil total poin sebuah wallet LANGSUNG dari kolom users.points di database.
 * Ini sumber kebenaran untuk saldo poin, bukan hasil hitung manual dari daftar aktivitas.
 */
export const fetchWalletPoints = async (walletAddress: string) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/wallet-points/${walletAddress}`);
    return response.data; // { success, wallet_address, points }
  } catch (error) {
    console.error("Gagal mengambil total poin wallet dari database:", error);
    throw error;
  }
};