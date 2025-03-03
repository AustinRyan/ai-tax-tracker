import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X } from 'lucide-react';
import { useTransactions } from '../contexts/TransactionsContext';
import { taxCategoriesService } from '../services/supabaseService';
import { Tables } from '../lib/supabaseTypes';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  editTransaction?: Tables<'transactions'>;
}

interface TransactionFormData {
  name: string;
  amount: number;
  date: string;
  category: string;
  description: string;
}

const AddTransactionModal: React.FC<AddTransactionModalProps> = ({ isOpen, onClose, editTransaction }) => {
  const { addTransaction, updateTransaction } = useTransactions();
  const [categories, setCategories] = useState<Tables<'tax_categories'>[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm<TransactionFormData>({
    defaultValues: {
      name: editTransaction?.name || '',
      amount: editTransaction?.amount || 0,
      date: editTransaction?.date ? new Date(editTransaction.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      category: editTransaction?.category || '',
      description: editTransaction?.description || '',
    }
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await taxCategoriesService.getTaxCategories();
        setCategories(data);
      } catch (err: any) {
        console.error('Error fetching categories:', err);
        setError('Failed to load categories');
      }
    };

    if (isOpen) {
      fetchCategories();
      
      // Reset form when editing a transaction
      if (editTransaction) {
        reset({
          name: editTransaction.name,
          amount: editTransaction.amount,
          date: new Date(editTransaction.date).toISOString().split('T')[0],
          category: editTransaction.category || '',
          description: editTransaction.description || '',
        });
      } else {
        reset({
          name: '',
          amount: 0,
          date: new Date().toISOString().split('T')[0],
          category: '',
          description: '',
        });
      }
    }
  }, [isOpen, editTransaction, reset]);

  const onSubmit = async (data: TransactionFormData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (editTransaction) {
        await updateTransaction(editTransaction.id, {
          ...data,
          status: 'categorized',
        });
      } else {
        await addTransaction({
          ...data,
          status: 'categorized',
        });
      }
      
      onClose();
    } catch (err: any) {
      console.error('Error saving transaction:', err);
      setError(err.message || 'Failed to save transaction');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex justify-between items-center pb-3 border-b">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                {editTransaction ? 'Edit Transaction' : 'Add Transaction'}
              </h3>
              <button
                onClick={onClose}
                className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {error && (
              <div className="mt-3 bg-red-50 border-l-4 border-red-400 p-4">
                <div className="flex">
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Transaction Name
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    id="name"
                    className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                      errors.name ? 'border-red-300' : ''
                    }`}
                    {...register('name', { required: 'Transaction name is required' })}
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                  Amount
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">$</span>
                  </div>
                  <input
                    type="number"
                    id="amount"
                    step="0.01"
                    className={`pl-7 focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                      errors.amount ? 'border-red-300' : ''
                    }`}
                    {...register('amount', { 
                      required: 'Amount is required',
                      min: { value: 0.01, message: 'Amount must be greater than 0' }
                    })}
                  />
                  {errors.amount && (
                    <p className="mt-1 text-sm text-red-600">{errors.amount.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                  Date
                </label>
                <div className="mt-1">
                  <input
                    type="date"
                    id="date"
                    className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                      errors.date ? 'border-red-300' : ''
                    }`}
                    {...register('date', { required: 'Date is required' })}
                  />
                  {errors.date && (
                    <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                  Category
                </label>
                <div className="mt-1">
                  <select
                    id="category"
                    className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                      errors.category ? 'border-red-300' : ''
                    }`}
                    {...register('category', { required: 'Category is required' })}
                  >
                    <option value="">Select a category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.name}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  {errors.category && (
                    <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <div className="mt-1">
                  <textarea
                    id="description"
                    rows={3}
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    {...register('description')}
                  ></textarea>
                </div>
              </div>

              <div className="pt-5">
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={onClose}
                    className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    {isLoading ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Saving...
                      </span>
                    ) : (
                      'Save'
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddTransactionModal;