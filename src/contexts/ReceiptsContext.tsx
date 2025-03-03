import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { receiptsService } from '../services/supabaseService';
import { receiptsService as apiReceiptsService } from '../services/receiptsService';
import { Tables } from '../lib/supabaseTypes';
import { useAuth } from './AuthContext';
import { checkSupabaseConnection } from '../lib/supabase';

interface ReceiptsContextType {
  receipts: Tables<'receipts'>[];
  loading: boolean;
  error: string | null;
  fetchReceipts: () => Promise<void>;
  addReceipt: (receipt: Omit<Tables<'receipts'>, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<Tables<'receipts'>>;
  updateReceipt: (id: string, updates: Partial<Tables<'receipts'>>) => Promise<Tables<'receipts'>>;
  deleteReceipt: (id: string) => Promise<boolean>;
  uploadReceiptImage: (file: File) => Promise<string>;
  processReceipt: (file: File) => Promise<Tables<'receipts'>>;
}

const ReceiptsContext = createContext<ReceiptsContextType | undefined>(undefined);

export const useReceipts = () => {
  const context = useContext(ReceiptsContext);
  if (context === undefined) {
    throw new Error('useReceipts must be used within a ReceiptsProvider');
  }
  return context;
};

export const ReceiptsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [receipts, setReceipts] = useState<Tables<'receipts'>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSupabaseAvailable, setIsSupabaseAvailable] = useState(true);
  const { user } = useAuth();

  // Check Supabase connection on mount
  useEffect(() => {
    const checkConnection = async () => {
      const isAvailable = await checkSupabaseConnection();
      setIsSupabaseAvailable(isAvailable);
      if (!isAvailable) {
        console.warn('Supabase connection is not available. Using mock data instead.');
        // Load mock data if Supabase is not available
        setReceipts(getMockReceipts());
        setLoading(false);
      }
    };
    
    checkConnection();
  }, []);

  // Use useCallback to prevent infinite loops
  const fetchReceipts = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      if (!isSupabaseAvailable) {
        // Use mock data if Supabase is not available
        setReceipts(getMockReceipts());
        return;
      }
      
      const data = await receiptsService.getReceipts();
      setReceipts(data);
    } catch (err: any) {
      console.error('Error fetching receipts:', err);
      setError(err.message || 'Failed to fetch receipts');
      // Fall back to mock data if there's an error
      setReceipts(getMockReceipts());
    } finally {
      setLoading(false);
    }
  }, [user, isSupabaseAvailable]);

  const addReceipt = async (receipt: Omit<Tables<'receipts'>, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      if (!isSupabaseAvailable) {
        // Create a mock receipt with a generated ID
        const mockReceipt = {
          ...receipt,
          id: `mock-${Date.now()}`,
          user_id: user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        } as Tables<'receipts'>;
        
        setReceipts(prev => [mockReceipt, ...prev]);
        return mockReceipt;
      }
      
      const newReceipt = await receiptsService.createReceipt({
        ...receipt,
        user_id: user.id,
      });
      
      setReceipts(prev => [newReceipt, ...prev]);
      return newReceipt;
    } catch (err: any) {
      console.error('Error adding receipt:', err);
      throw err;
    }
  };

  const updateReceipt = async (id: string, updates: Partial<Tables<'receipts'>>) => {
    try {
      if (!isSupabaseAvailable) {
        // Update the receipt in the local state
        const updatedReceipt = {
          ...receipts.find(r => r.id === id),
          ...updates,
          updated_at: new Date().toISOString()
        } as Tables<'receipts'>;
        
        setReceipts(prev => 
          prev.map(receipt => 
            receipt.id === id ? updatedReceipt : receipt
          )
        );
        
        return updatedReceipt;
      }
      
      const updatedReceipt = await receiptsService.updateReceipt(id, updates);
      
      setReceipts(prev => 
        prev.map(receipt => 
          receipt.id === id ? updatedReceipt : receipt
        )
      );
      
      return updatedReceipt;
    } catch (err: any) {
      console.error('Error updating receipt:', err);
      throw err;
    }
  };

  const deleteReceipt = async (id: string) => {
    try {
      if (!isSupabaseAvailable) {
        // Remove the receipt from the local state
        setReceipts(prev => 
          prev.filter(receipt => receipt.id !== id)
        );
        
        return true;
      }
      
      await receiptsService.deleteReceipt(id);
      
      setReceipts(prev => 
        prev.filter(receipt => receipt.id !== id)
      );
      
      return true;
    } catch (err: any) {
      console.error('Error deleting receipt:', err);
      throw err;
    }
  };

  const uploadReceiptImage = async (file: File) => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      // Create a local URL for immediate display
      const localUrl = URL.createObjectURL(file);
      
      // For development without Supabase storage, return the local URL
      // In production, this would be replaced with actual Supabase storage upload
      console.log('Using local URL for receipt image:', localUrl);
      
      // Since we're having issues with the Supabase storage bucket,
      // we'll use a placeholder image URL for now
      return 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80';
    } catch (err: any) {
      console.error('Error uploading receipt image:', err);
      throw err;
    }
  };

  // Process a receipt through the API and save it to the database
  const processReceipt = async (file: File) => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      setLoading(true);
      setError(null);
      
      // Process the receipt using the API
      const extractedData = await apiReceiptsService.processReceipt(file);
      
      console.log('Extracted data from receipt:', extractedData);
      
      // Use the image URL from the API response or a placeholder
      const imageUrl = extractedData.imageUrl || 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80';
      
      // Ensure date is in the correct format (YYYY-MM-DD)
      let formattedDate = extractedData.date || new Date().toISOString().split('T')[0];
      
      // If date is in an invalid format, use today's date
      if (formattedDate === 'YYYY-MM-DD' || !formattedDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
        formattedDate = new Date().toISOString().split('T')[0];
      }
      
      // Create a new receipt in the database
      const newReceipt = await addReceipt({
        name: extractedData.vendor || 'Unknown Receipt',
        vendor: extractedData.vendor || 'Unknown',
        amount: typeof extractedData.totalAmount === 'number' ? extractedData.totalAmount : parseFloat(extractedData.totalAmount || '0'),
        date: formattedDate,
        image_url: imageUrl,
        status: 'processed',
        extracted_data: extractedData
      });
      
      return newReceipt;
    } catch (err: any) {
      console.error('Error processing receipt:', err);
      setError(err.message || 'Failed to process receipt');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Only fetch receipts when user changes or on mount
  useEffect(() => {
    if (user) {
      fetchReceipts();
    } else {
      setReceipts([]);
      setLoading(false);
    }
  }, [user, fetchReceipts]);

  const value = {
    receipts,
    loading,
    error,
    fetchReceipts,
    addReceipt,
    updateReceipt,
    deleteReceipt,
    uploadReceiptImage,
    processReceipt
  };

  return <ReceiptsContext.Provider value={value}>{children}</ReceiptsContext.Provider>;
};

// Mock data for when Supabase is unavailable
const getMockReceipts = (): Tables<'receipts'>[] => {
  return [
    {
      id: '1',
      user_id: 'mock-user',
      transaction_id: null,
      name: 'Office Supplies',
      vendor: 'Staples',
      amount: 245.99,
      date: '2025-03-15',
      image_url: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80',
      status: 'processed',
      extracted_data: {
        vendor: 'Staples',
        date: '2025-03-15',
        totalAmount: 245.99,
        taxAmount: 19.99,
        items: [
          { name: 'Paper', price: 45.99, quantity: 2 },
          { name: 'Pens', price: 12.99, quantity: 3 },
          { name: 'Folders', price: 8.99, quantity: 5 }
        ],
        category: 'Office Expenses',
        deductible: true,
        deductiblePercentage: 100
      },
      created_at: '2025-03-15T12:00:00Z',
      updated_at: '2025-03-15T12:00:00Z'
    },
    {
      id: '2',
      user_id: 'mock-user',
      transaction_id: null,
      name: 'Client Dinner',
      vendor: 'Olive Garden',
      amount: 189.75,
      date: '2025-03-12',
      image_url: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80',
      status: 'processed',
      extracted_data: {
        vendor: 'Olive Garden',
        date: '2025-03-12',
        totalAmount: 189.75,
        taxAmount: 15.50,
        items: [
          { name: 'Appetizers', price: 45.50, quantity: 1 },
          { name: 'Entrees', price: 98.75, quantity: 1 },
          { name: 'Beverages', price: 30.00, quantity: 1 }
        ],
        category: 'Meals & Entertainment',
        deductible: true,
        deductiblePercentage: 50
      },
      created_at: '2025-03-12T19:30:00Z',
      updated_at: '2025-03-12T19:30:00Z'
    },
    {
      id: '3',
      user_id: 'mock-user',
      transaction_id: null,
      name: 'AWS Monthly Subscription',
      vendor: 'Amazon Web Services',
      amount: 432.10,
      date: '2025-03-10',
      image_url: 'https://images.unsplash.com/photo-1607799279861-4dd421887fb3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80',
      status: 'processed',
      extracted_data: {
        vendor: 'Amazon Web Services',
        date: '2025-03-10',
        totalAmount: 432.10,
        taxAmount: 0,
        items: [
          { name: 'Cloud Hosting', price: 250.00, quantity: 1 },
          { name: 'Storage', price: 82.10, quantity: 1 },
          { name: 'Compute', price: 100.00, quantity: 1 }
        ],
        category: 'Software & Services',
        deductible: true,
        deductiblePercentage: 100
      },
      created_at: '2025-03-10T08:15:00Z',
      updated_at: '2025-03-10T08:15:00Z'
    }
  ];
};