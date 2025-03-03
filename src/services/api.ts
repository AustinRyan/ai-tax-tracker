import axios from 'axios';

// Determine the API URL based on the environment
const isProduction = import.meta.env.PROD;
const API_URL = isProduction ? '/api' : 'http://localhost:3001/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

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