import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { transactionsService } from '../services/supabaseService';
import { Tables } from '../lib/supabaseTypes';
import { useAuth } from './AuthContext';
import { checkSupabaseConnection } from '../lib/supabase';
import { useReceipts } from './ReceiptsContext';

interface TransactionsContextType {
  transactions: Tables<'transactions'>[];
  loading: boolean;
  error: string | null;
  fetchTransactions: () => Promise<void>;
  addTransaction: (transaction: Omit<Tables<'transactions'>, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<Tables<'transactions'>>;
  updateTransaction: (id: string, updates: Partial<Tables<'transactions'>>) => Promise<Tables<'transactions'>>;
  deleteTransaction: (id: string) => Promise<boolean>;
  syncReceiptsToTransactions: () => Promise<void>;
}

const TransactionsContext = createContext<TransactionsContextType | undefined>(undefined);

export const useTransactions = () => {
  const context = useContext(TransactionsContext);
  if (context === undefined) {
    throw new Error('useTransactions must be used within a TransactionsProvider');
  }
  return context;
};

export const TransactionsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [transactions, setTransactions] = useState<Tables<'transactions'>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSupabaseAvailable, setIsSupabaseAvailable] = useState(true);
  const { user } = useAuth();
  const { receipts } = useReceipts();

  // Check Supabase connection on mount
  useEffect(() => {
    const checkConnection = async () => {
      const isAvailable = await checkSupabaseConnection();
      setIsSupabaseAvailable(isAvailable);
      if (!isAvailable) {
        console.warn('Supabase connection is not available. Using mock data instead.');
        // Load mock data if Supabase is not available
        setTransactions(getMockTransactions());
        setLoading(false);
      }
    };
    
    checkConnection();
  }, []);

  // Use useCallback to prevent infinite loops
  const fetchTransactions = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      if (!isSupabaseAvailable) {
        // Use mock data if Supabase is not available
        setTransactions(getMockTransactions());
        return;
      }
      
      const data = await transactionsService.getTransactions();
      setTransactions(data);
    } catch (err: any) {
      console.error('Error fetching transactions:', err);
      setError(err.message || 'Failed to fetch transactions');
      // Fall back to mock data if there's an error
      setTransactions(getMockTransactions());
    } finally {
      setLoading(false);
    }
  }, [user, isSupabaseAvailable]);

  const addTransaction = async (transaction: Omit<Tables<'transactions'>, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      if (!isSupabaseAvailable) {
        // Create a mock transaction with a generated ID
        const mockTransaction = {
          ...transaction,
          id: `mock-${Date.now()}`,
          user_id: user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        } as Tables<'transactions'>;
        
        setTransactions(prev => [mockTransaction, ...prev]);
        return mockTransaction;
      }
      
      const newTransaction = await transactionsService.createTransaction({
        ...transaction,
        user_id: user.id,
      });
      
      setTransactions(prev => [newTransaction, ...prev]);
      return newTransaction;
    } catch (err: any) {
      console.error('Error adding transaction:', err);
      throw err;
    }
  };

  const updateTransaction = async (id: string, updates: Partial<Tables<'transactions'>>) => {
    try {
      if (!isSupabaseAvailable) {
        // Update the transaction in the local state
        const updatedTransaction = {
          ...transactions.find(t => t.id === id),
          ...updates,
          updated_at: new Date().toISOString()
        } as Tables<'transactions'>;
        
        setTransactions(prev => 
          prev.map(transaction => 
            transaction.id === id ? updatedTransaction : transaction
          )
        );
        
        return updatedTransaction;
      }
      
      const updatedTransaction = await transactionsService.updateTransaction(id, updates);
      
      setTransactions(prev => 
        prev.map(transaction => 
          transaction.id === id ? updatedTransaction : transaction
        )
      );
      
      return updatedTransaction;
    } catch (err: any) {
      console.error('Error updating transaction:', err);
      throw err;
    }
  };

  const deleteTransaction = async (id: string) => {
    try {
      if (!isSupabaseAvailable) {
        // Remove the transaction from the local state
        setTransactions(prev => 
          prev.filter(transaction => transaction.id !== id)
        );
        
        return true;
      }
      
      await transactionsService.deleteTransaction(id);
      
      setTransactions(prev => 
        prev.filter(transaction => transaction.id !== id)
      );
      
      return true;
    } catch (err: any) {
      console.error('Error deleting transaction:', err);
      throw err;
    }
  };

  // New function to sync receipts to transactions
  const syncReceiptsToTransactions = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Get receipts that don't have matching transactions
      const receiptsToSync = receipts.filter(receipt => !receipt.transaction_id);
      
      if (receiptsToSync.length === 0) {
        console.log('No new receipts to sync to transactions');
        return;
      }
      
      console.log(`Syncing ${receiptsToSync.length} receipts to transactions`);
      
      // Create transactions from receipts
      for (const receipt of receiptsToSync) {
        try {
          // Extract tax information from receipt data
          const taxAmount = receipt.extracted_data?.taxAmount || 0;
          const category = receipt.extracted_data?.category || 'Uncategorized';
          const items = receipt.extracted_data?.items || [];
          const paymentMethod = receipt.extracted_data?.paymentMethod || 'Unknown';
          const discountAmount = receipt.extracted_data?.discountAmount || 0;
          
          // Create a single transaction for the entire receipt
          // Instead of creating multiple transactions for each item
          
          // Format items for description
          let itemsDescription = '';
          if (Array.isArray(items) && items.length > 0) {
            itemsDescription = 'Items: ' + items.map((item: any) => {
              if (typeof item === 'string') {
                return item;
              } else if (typeof item === 'object' && item !== null) {
                return `${item.name || 'Unknown item'} - $${typeof item.price === 'number' ? item.price.toFixed(2) : 'N/A'}${item.quantity ? ` (x${item.quantity})` : ''}`;
              }
              return 'Unknown item';
            }).join(', ');
          }
          
          // Create a detailed description
          const description = `Receipt from ${receipt.vendor || 'Unknown Vendor'}\n` +
            (taxAmount ? `Tax: $${parseFloat(String(taxAmount)).toFixed(2)}\n` : '') +
            (discountAmount ? `Discount: $${parseFloat(String(discountAmount)).toFixed(2)}\n` : '') +
            (paymentMethod !== 'Unknown' ? `Payment Method: ${paymentMethod}\n` : '') +
            (itemsDescription ? `${itemsDescription}` : '');
          
          // Get the receipt name for the transaction
          let transactionName = receipt.name;
          
          // If we have items, use the first item name for the transaction
          if (Array.isArray(items) && items.length > 0) {
            const firstItem = items[0];
            if (typeof firstItem === 'string') {
              transactionName = firstItem;
            } else if (typeof firstItem === 'object' && firstItem !== null && firstItem.name) {
              transactionName = firstItem.name;
            }
          }
          
          // Create the transaction with item name - vendor format
          const newTransaction = await addTransaction({
            name: receipt.vendor ? `${transactionName} - ${receipt.vendor}` : transactionName,
            amount: receipt.amount,
            date: receipt.date,
            category: category,
            description: description,
            status: 'categorized'
          });
          
          // Update the receipt with the transaction ID
          if (isSupabaseAvailable && newTransaction) {
            await transactionsService.updateReceiptTransaction(receipt.id, newTransaction.id);
          }
          
          console.log(`Created transaction from receipt: ${receipt.name}`);
        } catch (err: any) {
          console.error(`Error creating transaction from receipt ${receipt.id}:`, err);
        }
      }
      
      // Refresh transactions
      await fetchTransactions();
      
    } catch (err: any) {
      console.error('Error syncing receipts to transactions:', err);
      setError(err.message || 'Failed to sync receipts to transactions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchTransactions();
    } else {
      setTransactions([]);
      setLoading(false);
    }
  }, [user, isSupabaseAvailable, fetchTransactions]);

  // Sync receipts to transactions when receipts change
  useEffect(() => {
    if (user && receipts.length > 0) {
      // Check if we have any receipts without transactions
      const unlinkedReceipts = receipts.filter(receipt => !receipt.transaction_id);
      if (unlinkedReceipts.length > 0) {
        syncReceiptsToTransactions();
      }
    }
  }, [user, receipts]);

  const value = {
    transactions,
    loading,
    error,
    fetchTransactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    syncReceiptsToTransactions
  };

  return <TransactionsContext.Provider value={value}>{children}</TransactionsContext.Provider>;
};

// Mock data for when Supabase is unavailable
const getMockTransactions = (): Tables<'transactions'>[] => {
  return [
    {
      id: '1',
      user_id: 'mock-user',
      name: 'Paper - Staples',
      amount: 245.99,
      date: '2025-03-15',
      category: 'Office Expenses',
      description: 'Purchased office supplies including paper, pens, and folders.',
      status: 'categorized',
      created_at: '2025-03-15T12:00:00Z',
      updated_at: '2025-03-15T12:00:00Z'
    },
    {
      id: '2',
      user_id: 'mock-user',
      name: 'Appetizers - Olive Garden',
      amount: 189.75,
      date: '2025-03-12',
      category: 'Meals & Entertainment',
      description: 'Business dinner with potential client to discuss project requirements.',
      status: 'categorized',
      created_at: '2025-03-12T19:30:00Z',
      updated_at: '2025-03-12T19:30:00Z'
    },
    {
      id: '3',
      user_id: 'mock-user',
      name: 'Cloud Hosting - AWS',
      amount: 432.10,
      date: '2025-03-10',
      category: 'Software & Services',
      description: 'Monthly cloud hosting services for company website and applications.',
      status: 'categorized',
      created_at: '2025-03-10T08:15:00Z',
      updated_at: '2025-03-10T08:15:00Z'
    },
    {
      id: '4',
      user_id: 'mock-user',
      name: 'Ride - Uber',
      amount: 28.50,
      date: '2025-03-08',
      category: 'Travel',
      description: 'Transportation to client meeting downtown.',
      status: 'needs-review',
      created_at: '2025-03-08T14:45:00Z',
      updated_at: '2025-03-08T14:45:00Z'
    },
    {
      id: '5',
      user_id: 'mock-user',
      name: 'Conference Ticket - Marketing Summit',
      amount: 899.00,
      date: '2025-03-05',
      category: 'Professional Development',
      description: 'Ticket for annual marketing conference in Chicago.',
      status: 'needs-receipt',
      created_at: '2025-03-05T09:20:00Z',
      updated_at: '2025-03-05T09:20:00Z'
    }
  ];
};