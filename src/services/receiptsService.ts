import axios from 'axios';

// Determine the API URL based on the environment
const isProduction = import.meta.env.PROD;
// In production, use the environment variable or a default backend URL
const API_URL = isProduction 
  ? 'https://ai-tax-tracker.onrender.com' 
  : 'http://localhost:3001';

// Receipt processing service
export const receiptsService = {
  // Process a receipt with the API
  processReceipt: async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('receipt', file);
      
      console.log('Uploading receipt for processing via API...');
      
      const response = await axios.post(`${API_URL}/receipts/process`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        // Add timeout to prevent hanging requests
        timeout: 120000 // 120 seconds timeout for larger files
      });
      
      console.log('Receipt processed successfully:', response.data);
      
      // Ensure the response has the expected structure
      const data = response.data;
      if (!data.vendor) data.vendor = "Unknown Vendor";
      
      // Ensure date is in the correct format (YYYY-MM-DD)
      if (!data.date || data.date === "YYYY-MM-DD") {
        data.date = new Date().toISOString().split('T')[0]; // Use current date as fallback
      }
      
      if (!data.totalAmount) data.totalAmount = 0;
      if (!data.items) data.items = [];
      if (!data.category) data.category = "Office Expenses";
      if (data.deductible === undefined) data.deductible = true;
      if (!data.deductiblePercentage) data.deductiblePercentage = 100;
      
      return data;
    } catch (error: any) {
      console.error('Error processing receipt with API:', error);
      
      // Create a fallback response with default values
      const fallbackResponse = {
        vendor: "Unknown Vendor",
        date: new Date().toISOString().split('T')[0],
        totalAmount: 0,
        items: [],
        category: "Office Expenses",
        deductible: true,
        deductiblePercentage: 100,
        error: error.message || 'Failed to process receipt'
      };
      
      // If we have a response from the server, use that error message
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      
      // If it's a timeout error, provide a more specific message
      if (error.code === 'ECONNABORTED') {
        throw new Error('Receipt processing timed out. Please try again with a smaller image.');
      }
      
      // For network errors
      if (error.message.includes('Network Error')) {
        throw new Error('Network error. Please check your connection to the server.');
      }
      
      throw new Error(error.message || 'Failed to process receipt');
    }
  }
};

export default receiptsService;