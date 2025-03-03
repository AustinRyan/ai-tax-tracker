import { supabase } from '../lib/supabase';
import { Tables, InsertTables, UpdateTables } from '../lib/supabaseTypes';
import axios from 'axios';

// Helper function to safely serialize data to avoid Symbol() errors
function safeSerialize(obj: any): any {
  try {
    return JSON.parse(JSON.stringify(obj));
  } catch (error) {
    console.error('Error serializing object:', error);
    // Create a simplified version of the object
    const simplified: Record<string, any> = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        try {
          // Try to serialize each property individually
          const serialized = JSON.stringify(obj[key]);
          simplified[key] = JSON.parse(serialized);
        } catch (err) {
          // If a property can't be serialized, use a placeholder
          simplified[key] = '[Unserializable data]';
        }
      }
    }
    return simplified;
  }
}

// Transactions Service
export const transactionsService = {
  // Get all transactions for the current user
  getTransactions: async () => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('date', { ascending: false });
      
      if (error) throw error;
      return data as Tables<'transactions'>[];
    } catch (error) {
      console.error('Error fetching transactions:', error);
      // Return empty array instead of throwing to prevent app crashes
      return [];
    }
  },
  
  // Get a single transaction by ID
  getTransaction: async (id: string) => {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data as Tables<'transactions'>;
  },
  
  // Create a new transaction
  createTransaction: async (transaction: InsertTables<'transactions'>) => {
    const { data, error } = await supabase
      .from('transactions')
      .insert(transaction)
      .select()
      .single();
    
    if (error) throw error;
    return data as Tables<'transactions'>;
  },
  
  // Update an existing transaction
  updateTransaction: async (id: string, updates: UpdateTables<'transactions'>) => {
    const { data, error } = await supabase
      .from('transactions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as Tables<'transactions'>;
  },
  
  // Delete a transaction
  deleteTransaction: async (id: string) => {
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  },

  // Update receipt with transaction ID
  updateReceiptTransaction: async (receiptId: string, transactionId: string) => {
    const { data, error } = await supabase
      .from('receipts')
      .update({ transaction_id: transactionId })
      .eq('id', receiptId)
      .select()
      .single();
    
    if (error) throw error;
    return data as Tables<'receipts'>;
  },

  // Get transactions by date range
  getTransactionsByDateRange: async (startDate: string, endDate: string) => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: false });
      
      if (error) throw error;
      return data as Tables<'transactions'>[];
    } catch (error) {
      console.error('Error fetching transactions by date range:', error);
      return [];
    }
  },

  // Get transactions by category
  getTransactionsByCategory: async (category: string) => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('category', category)
        .order('date', { ascending: false });
      
      if (error) throw error;
      return data as Tables<'transactions'>[];
    } catch (error) {
      console.error('Error fetching transactions by category:', error);
      return [];
    }
  },

  // Get transaction statistics
  getTransactionStats: async () => {
    try {
      // Get all transactions
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('date', { ascending: false });
      
      if (error) throw error;
      
      const transactions = data as Tables<'transactions'>[];
      
      // Calculate statistics
      const totalAmount = transactions.reduce((sum, t) => sum + Number(t.amount), 0);
      
      // Group by category
      const categoryTotals: Record<string, number> = {};
      transactions.forEach(t => {
        if (t.category) {
          categoryTotals[t.category] = (categoryTotals[t.category] || 0) + Number(t.amount);
        }
      });
      
      // Get current month transactions
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      const currentMonthTransactions = transactions.filter(t => {
        const date = new Date(t.date);
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
      });
      
      const currentMonthTotal = currentMonthTransactions.reduce((sum, t) => sum + Number(t.amount), 0);
      
      return {
        totalAmount,
        categoryTotals,
        currentMonthTotal,
        transactionCount: transactions.length,
        recentTransactions: transactions.slice(0, 5)
      };
    } catch (error) {
      console.error('Error calculating transaction statistics:', error);
      return {
        totalAmount: 0,
        categoryTotals: {},
        currentMonthTotal: 0,
        transactionCount: 0,
        recentTransactions: []
      };
    }
  }
};

// Receipts Service
export const receiptsService = {
  // Get all receipts for the current user
  getReceipts: async () => {
    try {
      const { data, error } = await supabase
        .from('receipts')
        .select('*')
        .order('date', { ascending: false });
      
      if (error) throw error;
      return data as Tables<'receipts'>[];
    } catch (error) {
      console.error('Error fetching receipts:', error);
      // Return empty array instead of throwing to prevent app crashes
      return [];
    }
  },
  
  // Get a single receipt by ID
  getReceipt: async (id: string) => {
    const { data, error } = await supabase
      .from('receipts')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data as Tables<'receipts'>;
  },
  
  // Create a new receipt
  createReceipt: async (receipt: InsertTables<'receipts'>) => {
    // Ensure the data is safely serializable
    const safeReceipt = safeSerialize(receipt);
    
    const { data, error } = await supabase
      .from('receipts')
      .insert(safeReceipt)
      .select()
      .single();
    
    if (error) throw error;
    return data as Tables<'receipts'>;
  },
  
  // Update an existing receipt
  updateReceipt: async (id: string, updates: UpdateTables<'receipts'>) => {
    // Ensure the data is safely serializable
    const safeUpdates = safeSerialize(updates);
    
    const { data, error } = await supabase
      .from('receipts')
      .update(safeUpdates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as Tables<'receipts'>;
  },
  
  // Delete a receipt
  deleteReceipt: async (id: string) => {
    const { error } = await supabase
      .from('receipts')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  },
  
  // Upload a receipt image to Supabase Storage
  uploadReceiptImage: async (file: File, userId: string) => {
    try {
      // For development without Supabase storage, return a placeholder image
      console.log('Using placeholder image URL for receipt');
      return 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80';
    } catch (error: any) {
      console.error('Error uploading receipt image:', error);
      // Return a placeholder image on error
      return 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80';
    }
  },
  
  // Process a receipt with the API and return the extracted data
  processReceiptWithAPI: async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('receipt', file);
      
      console.log('Uploading receipt for processing via API...');
      
      const response = await axios.post('http://localhost:3001/api/receipts/process', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      console.log('Receipt processed successfully via API');
      
      // Safely serialize the response data
      return safeSerialize(response.data);
    } catch (error: any) {
      console.error('Error processing receipt with API:', error);
      throw new Error(error.response?.data?.error || error.message || 'Failed to process receipt');
    }
  },

  // Get receipt statistics
  getReceiptStats: async () => {
    try {
      // Get all receipts
      const { data, error } = await supabase
        .from('receipts')
        .select('*')
        .order('date', { ascending: false });
      
      if (error) throw error;
      
      const receipts = data as Tables<'receipts'>[];
      
      // Calculate statistics
      const totalAmount = receipts.reduce((sum, r) => sum + Number(r.amount), 0);
      
      // Group by vendor
      const vendorTotals: Record<string, number> = {};
      receipts.forEach(r => {
        const vendor = r.vendor || 'Unknown';
        vendorTotals[vendor] = (vendorTotals[vendor] || 0) + Number(r.amount);
      });
      
      // Get receipts with tax information
      const receiptsWithTax = receipts.filter(r => 
        r.extracted_data && 
        typeof r.extracted_data === 'object' && 
        r.extracted_data !== null && 
        'taxAmount' in r.extracted_data
      );
      
      const totalTax = receiptsWithTax.reduce((sum, r) => {
        const taxAmount = r.extracted_data?.taxAmount;
        return sum + (typeof taxAmount === 'number' ? taxAmount : 0);
      }, 0);
      
      return {
        totalAmount,
        vendorTotals,
        totalTax,
        receiptCount: receipts.length,
        recentReceipts: receipts.slice(0, 5)
      };
    } catch (error) {
      console.error('Error calculating receipt statistics:', error);
      return {
        totalAmount: 0,
        vendorTotals: {},
        totalTax: 0,
        receiptCount: 0,
        recentReceipts: []
      };
    }
  }
};

// Tax Categories Service
export const taxCategoriesService = {
  // Get all tax categories
  getTaxCategories: async () => {
    try {
      const { data, error } = await supabase
        .from('tax_categories')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data as Tables<'tax_categories'>[];
    } catch (error) {
      console.error('Error fetching tax categories:', error);
      // Return empty array instead of throwing to prevent app crashes
      return [];
    }
  }
};

// Chat History Service
export const chatHistoryService = {
  // Get chat history for the current user
  getChatHistory: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('chat_history')
        .select('*')
        .eq('user_id', user.id)
        .order('timestamp');
      
      if (error) throw error;
      return data as Tables<'chat_history'>[];
    } catch (error) {
      console.error('Error fetching chat history:', error);
      // Return empty array instead of throwing to prevent app crashes
      return [];
    }
  },
  
  // Add a message to chat history
  addChatMessage: async (message: InsertTables<'chat_history'>) => {
    const { data, error } = await supabase
      .from('chat_history')
      .insert(message)
      .select()
      .single();
    
    if (error) throw error;
    return data as Tables<'chat_history'>;
  },
  
  // Clear chat history for the current user
  clearChatHistory: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('User not authenticated');
      
      const { error } = await supabase
        .from('chat_history')
        .delete()
        .eq('user_id', user.id);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error clearing chat history:', error);
      return false;
    }
  }
};

// User Profile Service
export const profileService = {
  // Get the current user's profile
  getProfile: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (error) throw error;
      return data as Tables<'profiles'>;
    } catch (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
  },
  
  // Update the current user's profile
  updateProfile: async (updates: UpdateTables<'profiles'>) => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) throw new Error('User not authenticated');
    
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single();
    
    if (error) throw error;
    return data as Tables<'profiles'>;
  }
};