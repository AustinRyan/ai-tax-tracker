import axios from 'axios';

// Determine the API URL based on the environment
const isProduction = import.meta.env.PROD;
// In production, use the environment variable or a default backend URL
const API_URL = isProduction 
  ? 'https://ai-tax-tracker.onrender.com'
  : 'http://localhost:3001';

console.log('Using API URL:', API_URL);

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 second timeout for long-running operations
});

// Add request interceptor for debugging in development
if (!isProduction) {
  api.interceptors.request.use(request => {
    console.log('API Request:', request.method, request.url);
    return request;
  });
  
  api.interceptors.response.use(
    response => {
      console.log('API Response:', response.status, response.config.url);
      return response;
    },
    error => {
      console.error('API Error:', error.response?.status || error.message, error.config?.url);
      return Promise.reject(error);
    }
  );
}

// Receipt processing service
export const receiptService = {
  // Upload and process a receipt
  processReceipt: async (file: File) => {
    const formData = new FormData();
    formData.append('receipt', file);
    
    const response = await api.post('/receipts/process', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  },
};

// Transaction service
export const transactionService = {
  // Categorize a transaction
  categorizeTransaction: async (transactionData: {
    description: string;
    amount?: number;
    date?: string;
    vendor?: string;
  }) => {
    const response = await api.post('/transactions/categorize', transactionData);
    return response.data;
  },
};

// AI Chat service
export const chatService = {
  // Send a message to the AI assistant
  sendMessage: async (message: string, userId: string, chatHistory: any[] = []) => {
    const response = await api.post('/chat', {
      message,
      userId,
      chatHistory,
    });
    
    return response.data;
  },
};

export default api;