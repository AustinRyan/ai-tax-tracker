import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Download,
  Plus,
  ChevronDown,
  ChevronUp,
  Edit,
  Trash,
  FileText,
  Loader
} from 'lucide-react';
import { useTransactions } from '../contexts/TransactionsContext';
import { Tables } from '../lib/supabaseTypes';
import AddTransactionModal from '../components/AddTransactionModal';

const Transactions: React.FC = () => {
  const { transactions, loading, error, deleteTransaction } = useTransactions();

  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('date');
  const [sortDirection, setSortDirection] = useState('desc');
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editTransaction, setEditTransaction] = useState<Tables<'transactions'> | undefined>(undefined);

  // Get unique categories from transactions
  const [categories, setCategories] = useState<string[]>(['All']);

  useEffect(() => {
    if (transactions.length > 0) {
      const uniqueCategories = ['All', ...new Set(transactions.map(t => t.category).filter(Boolean) as string[])];
      setCategories(uniqueCategories);
    }
  }, [transactions]);

  // Handle sort
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Filter and sort transactions
  const filteredTransactions = transactions
    .filter(transaction =>
      (selectedCategory === 'All' || transaction.category === selectedCategory) &&
      (transaction.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (transaction.category && transaction.category.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (transaction.description && transaction.description.toLowerCase().includes(searchTerm.toLowerCase())))
    )
    .sort((a, b) => {
      if (sortField === 'amount') {
        return sortDirection === 'asc' ? Number(a.amount) - Number(b.amount) : Number(b.amount) - Number(a.amount);
      } else if (sortField === 'date') {
        return sortDirection === 'asc'
          ? new Date(a.date).getTime() - new Date(b.date).getTime()
          : new Date(b.date).getTime() - new Date(a.date).getTime();
      } else {
        const aValue = a[sortField as keyof typeof a] || '';
        const bValue = b[sortField as keyof typeof b] || '';
        return sortDirection === 'asc'
          ? String(aValue).localeCompare(String(bValue))
          : String(bValue).localeCompare(String(aValue));
      }
    });

  // Toggle row expansion
  const toggleRowExpansion = (id: string) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  // Handle edit transaction
  const handleEditTransaction = (transaction: Tables<'transactions'>) => {
    setEditTransaction(transaction);
    setIsAddModalOpen(true);
  };

  // Handle delete transaction
  const handleDeleteTransaction = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this transaction? This action cannot be undone.')) {
      try {
        await deleteTransaction(id);
      } catch (error: any) {
        console.error('Error deleting transaction:', error);
        alert('Failed to delete transaction: ' + error.message);
      }
    }
  };

  // Export transactions as CSV
  const exportTransactions = () => {
    // Create CSV content
    const headers = ['Transaction', 'Amount', 'Category', 'Date', 'Status', 'Description'];
    const csvContent = [
      headers.join(','),
      ...filteredTransactions.map(t => [
        `"${t.name.replace(/"/g, '""')}"`,
        t.amount,
        `"${t.category || ''}".replace(/"/g, '""')`,
        t.date,
        t.status,
        `"${t.description?.replace(/"/g, '""') || ''}"`
      ].join(','))
    ].join('\n');

    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `transactions_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="py-6 pl-64">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-semibold text-gray-900">Transactions</h1>
            <button
              type="button"
              onClick={() => {
                setEditTransaction(undefined);
                setIsAddModalOpen(true);
              }}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Transaction
            </button>
          </div>

          {/* Filters and search */}
          <div className="mt-4 bg-white shadow rounded-lg p-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
              <div className="flex-1 max-w-md">
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                    placeholder="Search transactions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex space-x-4">
                <div className="relative inline-block text-left">
                  <select
                    className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  type="button"
                  onClick={exportTransactions}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </button>
              </div>
            </div>
          </div>

          {/* Loading state */}
          {loading && (
            <div className="mt-4 flex justify-center">
              <div className="flex items-center space-x-2">
                <Loader className="h-5 w-5 text-blue-500 animate-spin" />
                <span className="text-sm text-gray-600">Loading transactions...</span>
              </div>
            </div>
          )}

          {/* Error state */}
          {error && (
            <div className="mt-4 bg-red-50 border-l-4 border-red-400 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Transactions table */}
          {!loading && !error && (
            <div className="mt-4 flex flex-col">
              <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                  <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                    {filteredTransactions.length > 0 ? (
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              <button
                                className="group inline-flex items-center"
                                onClick={() => handleSort('name')}
                              >
                                Transaction
                                <span className="ml-1 flex-none rounded text-gray-400">
                                  {sortField === 'name' ? (
                                    sortDirection === 'asc' ? (
                                      <ChevronUp className="h-4 w-4" />
                                    ) : (
                                      <ChevronDown className="h-4 w-4" />
                                    )
                                  ) : (
                                    <ChevronDown className="h-4 w-4 opacity-0 group-hover:opacity-100" />
                                  )}
                                </span>
                              </button>
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              <button
                                className="group inline-flex items-center"
                                onClick={() => handleSort('amount')}
                              >
                                Amount
                                <span className="ml-1 flex-none rounded text-gray-400">
                                  {sortField === 'amount' ? (
                                    sortDirection === 'asc' ? (
                                      <ChevronUp className="h-4 w-4" />
                                    ) : (
                                      <ChevronDown className="h-4 w-4" />
                                    )
                                  ) : (
                                    <ChevronDown className="h-4 w-4 opacity-0 group-hover:opacity-100" />
                                  )}
                                </span>
                              </button>
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              <button
                                className="group inline-flex items-center"
                                onClick={() => handleSort('category')}
                              >
                                Category
                                <span className="ml-1 flex-none rounded text-gray-400">
                                  {sortField === 'category' ? (
                                    sortDirection === 'asc' ? (
                                      <ChevronUp className="h-4 w-4" />
                                    ) : (
                                      <ChevronDown className="h-4 w-4" />
                                    )
                                  ) : (
                                    <ChevronDown className="h-4 w-4 opacity-0 group-hover:opacity-100" />
                                  )}
                                </span>
                              </button>
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              <button
                                className="group inline-flex items-center"
                                onClick={() => handleSort('date')}
                              >
                                Date
                                <span className="ml-1 flex-none rounded text-gray-400">
                                  {sortField === 'date' ? (
                                    sortDirection === 'asc' ? (
                                      <ChevronUp className="h-4 w-4" />
                                    ) : (
                                      <ChevronDown className="h-4 w-4" />
                                    )
                                  ) : (
                                    <ChevronDown className="h-4 w-4 opacity-0 group-hover:opacity-100" />
                                  )}
                                </span>
                              </button>
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {filteredTransactions.map((transaction) => (
                            <React.Fragment key={transaction.id}>
                              <tr className="hover:bg-gray-50 cursor-pointer" onClick={() => toggleRowExpansion(transaction.id)}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                  <div className="flex items-center">
                                    <FileText className="h-5 w-5 text-gray-400 mr-2" />
                                    {transaction.name}
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  ${Number(transaction.amount).toFixed(2)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {transaction.category || 'Uncategorized'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {transaction.date}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  {transaction.status === 'categorized' && (
                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                      Categorized
                                    </span>
                                  )}
                                  {transaction.status === 'needs-review' && (
                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                      Needs Review
                                    </span>
                                  )}
                                  {transaction.status === 'needs-receipt' && (
                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                                      Needs Receipt
                                    </span>
                                  )}
                                  {transaction.status === 'pending' && (
                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                                      Pending
                                    </span>
                                  )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  <div className="flex items-center space-x-2">
                                    <button
                                      className="text-blue-600 hover:text-blue-900"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleEditTransaction(transaction);
                                      }}
                                    >
                                      <Edit className="h-4 w-4" />
                                    </button>
                                    <button
                                      className="text-red-600 hover:text-red-900"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteTransaction(transaction.id);
                                      }}
                                    >
                                      <Trash className="h-4 w-4" />
                                    </button>
                                    <button className="text-gray-600 hover:text-gray-900">
                                      {expandedRow === transaction.id ? (
                                        <ChevronUp className="h-4 w-4" />
                                      ) : (
                                        <ChevronDown className="h-4 w-4" />
                                      )}
                                    </button>
                                  </div>
                                </td>
                              </tr>
                              {expandedRow === transaction.id && (
                                <tr>
                                  <td colSpan={6} className="px-6 py-4 bg-gray-50">
                                    <div className="text-sm text-gray-700">
                                      <div className="font-medium">Description:</div>
                                      <p className="whitespace-pre-line">{transaction.description || 'No description available'}</p>
                                      <div className="mt-2 font-medium">Tax Notes:</div>
                                      <p>
                                        {transaction.category === 'Meals & Entertainment'
                                          ? 'This expense is 50% deductible for business meals.'
                                          : transaction.category === 'Travel'
                                            ? 'Business travel expenses are fully deductible when properly documented.'
                                            : 'This expense may be fully deductible as an ordinary business expense.'}
                                      </p>
                                      <div className="mt-2">
                                        <button className="text-blue-600 hover:text-blue-900 text-sm font-medium">
                                          Attach Receipt
                                        </button>
                                        {transaction.status === 'needs-review' && (
                                          <button className="ml-4 text-green-600 hover:text-green-900 text-sm font-medium">
                                            Approve Category
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </React.Fragment>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <div className="p-8 text-center">
                        <FileText className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No transactions found</h3>
                        <p className="mt-1 text-sm text-gray-500">
                          {transactions.length === 0
                            ? "Add your first transaction to get started."
                            : "Try adjusting your search or filter to find what you're looking for."}
                        </p>
                        {transactions.length === 0 && (
                          <button
                            type="button"
                            onClick={() => setIsAddModalOpen(true)}
                            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Transaction
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Pagination */}
          {filteredTransactions.length > 0 && (
            <div className="mt-4 flex items-center justify-between">
              <div className="flex-1 flex justify-between sm:hidden">
                <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                  Previous
                </button>
                <button className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">1</span> to <span className="font-medium">{Math.min(filteredTransactions.length, 10)}</span> of{' '}
                    <span className="font-medium">{filteredTransactions.length}</span> results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                      <span className="sr-only">Previous</span>
                      <ChevronDown className="h-5 w-5 rotate-90" />
                    </button>
                    <button className="relative inline-flex items-center px-4 py-2 border border-blue-500 bg-blue-50 text-sm font-medium text-blue-600">
                      1
                    </button>
                    {filteredTransactions.length > 10 && (
                      <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                        2
                      </button>
                    )}
                    <button className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                      <span className="sr-only">Next</span>
                      <ChevronDown className="h-5 w-5 -rotate-90" />
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Add/Edit Transaction Modal */}
        <AddTransactionModal
          isOpen={isAddModalOpen}
          onClose={() => {
            setIsAddModalOpen(false);
            setEditTransaction(undefined);
          }}
          editTransaction={editTransaction}
        />
      </div>
    </div>
  );
};

export default Transactions;