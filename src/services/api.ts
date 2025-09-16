const API_BASE_URL = 'http://localhost:3001/api';

interface Patient {
  id: string;
  name: string;
  date_of_birth: string;
  phone: string;
  email?: string;
  address: string;
  medical_history: string;
  token_number?: number;
  reason_for_visit?: string;
  status?: 'pending' | 'completed';
  consultation_fee?: number;
  issue_time?: string;
  completion_time?: string;
  visit_date?: string;
  created_at?: string;
  updated_at?: string;
}

interface DashboardStats {
  totalPatientsToday: number;
  pendingPatients: number;
  completedToday: number;
}

interface LoginCredentials {
  username: string;
  password: string;
}

interface ApiResponse<T> {
  success?: boolean;
  message?: string;
  data?: T;
  error?: string;
}

class ApiService {
  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`API Request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // Authentication
  async login(credentials: LoginCredentials): Promise<ApiResponse<any>> {
    return this.makeRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  // Dashboard
  async getDashboardStats(): Promise<DashboardStats> {
    return this.makeRequest('/dashboard/stats');
  }

  // Patients
  async getAllPatients(): Promise<Patient[]> {
    return this.makeRequest('/patients');
  }

  async searchPatients(query: string): Promise<Patient[]> {
    return this.makeRequest(`/patients?search=${encodeURIComponent(query)}`);
  }

  async createPatient(patient: Omit<Patient, 'id' | 'created_at' | 'updated_at'>): Promise<Patient> {
    return this.makeRequest('/patients', {
      method: 'POST',
      body: JSON.stringify(patient),
    });
  }

  // Visits
  async createVisit(patientId: string, reasonForVisit: string): Promise<{ id: number; tokenNumber: number }> {
    return this.makeRequest('/visits', {
      method: 'POST',
      body: JSON.stringify({ patientId, reasonForVisit }),
    });
  }

  async completeVisit(visitId: number, consultationFee: number): Promise<ApiResponse<any>> {
    return this.makeRequest(`/visits/${visitId}/complete`, {
      method: 'PUT',
      body: JSON.stringify({ consultationFee }),
    });
  }

  // Health check
  async healthCheck(): Promise<{ status: string; message: string }> {
    return this.makeRequest('/health');
  }
}

export const apiService = new ApiService();
export type { Patient, DashboardStats, LoginCredentials, ApiResponse };