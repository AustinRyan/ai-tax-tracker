import React, { useState, useRef, useEffect } from 'react';
import {
  Upload,
  Search,
  Filter,
  ChevronDown,
  Eye,
  Download,
  Trash,
  Image,
  FileText,
  CheckCircle,
  AlertCircle,
  Loader
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useReceipts } from '../contexts/ReceiptsContext';
import { Tables } from '../lib/supabaseTypes';

interface ReceiptDisplay {
  id: string;
  name: string;
  vendor: string;
  amount: number;
  date: string;
  status: 'processed' | 'processing' | 'needs-review';
  transactionMatched: boolean;
  imageUrl: string;
  description?: string;
  extractedData?: any;
}

const Receipts: React.FC = () => {
  const { user } = useAuth();
  const { receipts, loading: receiptsLoading, error: receiptsError, fetchReceipts, processReceipt, deleteReceipt } = useReceipts();

  const [displayReceipts, setDisplayReceipts] = useState<ReceiptDisplay[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedReceipt, setSelectedReceipt] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Status options for filter
  const statusOptions = ['All', 'Processed', 'Processing', 'Needs Review'];

  // Load receipts from database only once on component mount
  useEffect(() => {
    fetchReceipts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Convert database receipts to display format
  useEffect(() => {
    if (receipts && receipts.length > 0) {
      const formattedReceipts: ReceiptDisplay[] = receipts.map(receipt => ({
        id: receipt.id,
        name: receipt.name,
        vendor: receipt.vendor || 'Unknown',
        amount: receipt.amount,
        date: receipt.date,
        status: (receipt.status as 'processed' | 'processing' | 'needs-review') || 'processed',
        transactionMatched: receipt.transaction_id ? true : false,
        imageUrl: receipt.image_url || 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80',
        description: receipt.extracted_data?.description || 'No description available',
        extractedData: receipt.extracted_data
      }));

      setDisplayReceipts(formattedReceipts);

      // If we have receipts but no selected receipt, select the first one
      if (formattedReceipts.length > 0 && !selectedReceipt) {
        setSelectedReceipt(formattedReceipts[0].id);
      }
    } else {
      setDisplayReceipts([]);
    }
  }, [receipts, selectedReceipt]);

  // Filter receipts
  const filteredReceipts = displayReceipts.filter(receipt =>
    (selectedStatus === 'All' || receipt.status.toLowerCase() === selectedStatus.toLowerCase()) &&
    (receipt.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      receipt.vendor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (receipt.description && receipt.description.toLowerCase().includes(searchTerm.toLowerCase())))
  );

  // Handle receipt selection for preview
  const handleReceiptSelect = (id: string) => {
    setSelectedReceipt(id === selectedReceipt ? null : id);
  };

  // Get selected receipt data
  const selectedReceiptData = selectedReceipt
    ? displayReceipts.find(receipt => receipt.id === selectedReceipt)
    : null;

  // Handle file upload button click
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  // Handle file change
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    setIsUploading(true);
    setUploadError(null);

    try {
      // Process the receipt and save to database
      const newReceipt = await processReceipt(file);

      // Select the new receipt
      setSelectedReceipt(newReceipt.id);

    } catch (error: any) {
      console.error('Error processing receipt:', error);
      setUploadError(error.message || 'Failed to process receipt. Please try again.');
    } finally {
      setIsUploading(false);
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Handle receipt deletion
  const handleDeleteReceipt = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this receipt? This action cannot be undone.')) {
      try {
        await deleteReceipt(id);

        // If the deleted receipt was selected, clear the selection
        if (selectedReceipt === id) {
          setSelectedReceipt(null);
        }
      } catch (error: any) {
        console.error('Error deleting receipt:', error);
        alert('Failed to delete receipt: ' + error.message);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="py-6 pl-64">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-semibold text-gray-900">Receipts</h1>
            <button
              type="button"
              onClick={handleUploadClick}
              disabled={isUploading}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isUploading ? (
                <>
                  <Loader className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Receipt
                </>
              )}
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*,application/pdf"
              className="hidden"
            />
          </div>

          {/* Error message */}
          {uploadError && (
            <div className="mt-4 bg-red-50 border-l-4 border-red-400 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-red-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{uploadError}</p>
                </div>
              </div>
            </div>
          )}

          {/* Loading state */}
          {receiptsLoading && (
            <div className="mt-4 flex justify-center">
              <div className="flex items-center space-x-2">
                <Loader className="h-5 w-5 text-blue-500 animate-spin" />
                <span className="text-sm text-gray-600">Loading receipts...</span>
              </div>
            </div>
          )}

          {/* Error state */}
          {receiptsError && (
            <div className="mt-4 bg-red-50 border-l-4 border-red-400 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-red-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{receiptsError}</p>
                  <button
                    onClick={() => fetchReceipts()}
                    className="mt-1 text-sm font-medium text-red-700 hover:text-red-600"
                  >
                    Try again
                  </button>
                </div>
              </div>
            </div>
          )}

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
                    placeholder="Search receipts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex space-x-4">
                <div className="relative inline-block text-left">
                  <div>
                    <button
                      type="button"
                      className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <Filter className="h-4 w-4 mr-2" />
                      Status: {selectedStatus}
                      <ChevronDown className="h-4 w-4 ml-2" />
                    </button>
                  </div>
                  <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10 hidden">
                    <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                      {statusOptions.map((status) => (
                        <button
                          key={status}
                          onClick={() => setSelectedStatus(status)}
                          className={`${selectedStatus === status ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                            } block px-4 py-2 text-sm w-full text-left hover:bg-gray-100`}
                          role="menuitem"
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-col lg:flex-row space-y-4 lg:space-y-0 lg:space-x-4">
            {/* Receipts grid */}
            <div className="lg:w-2/3">
              <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                  {filteredReceipts.map((receipt) => (
                    <div
                      key={receipt.id}
                      className={`border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer ${selectedReceipt === receipt.id ? 'ring-2 ring-blue-500' : ''
                        }`}
                      onClick={() => handleReceiptSelect(receipt.id)}
                    >
                      <div className="h-40 bg-gray-200 relative">
                        <img
                          src={receipt.imageUrl}
                          alt={receipt.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2 right-2">
                          {receipt.status === 'processed' && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Processed
                            </span>
                          )}
                          {receipt.status === 'processing' && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              <svg className="animate-spin h-3 w-3 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Processing
                            </span>
                          )}
                          {receipt.status === 'needs-review' && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              <AlertCircle className="h-3 w-3 mr-1" />
                              Review
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="p-3">
                        <h3 className="text-sm font-medium text-gray-900 truncate">{receipt.name}</h3>
                        <p className="text-xs text-gray-500">{receipt.vendor}</p>
                        <div className="mt-1 flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-900">${receipt.amount.toFixed(2)}</span>
                          <span className="text-xs text-gray-500">{receipt.date}</span>
                        </div>
                        <div className="mt-2 flex justify-between">
                          <span className={`text-xs ${receipt.transactionMatched ? 'text-green-600' : 'text-gray-500'}`}>
                            {receipt.transactionMatched ? 'Matched' : 'Unmatched'}
                          </span>
                          <div className="flex space-x-1">
                            <button
                              className="text-gray-400 hover:text-gray-600"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleReceiptSelect(receipt.id);
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              className="text-red-400 hover:text-red-600"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteReceipt(receipt.id);
                              }}
                            >
                              <Trash className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {filteredReceipts.length === 0 && !receiptsLoading && (
                  <div className="p-8 text-center">
                    <Image className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No receipts found</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {displayReceipts.length === 0
                        ? "Upload your first receipt to get started."
                        : "Try adjusting your search or filter to find what you're looking for."}
                    </p>
                    {displayReceipts.length === 0 && (
                      <button
                        type="button"
                        onClick={handleUploadClick}
                        className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Receipt
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Receipt preview */}
            <div className="lg:w-1/3">
              <div className="bg-white shadow rounded-lg h-full sticky top-6">
                {selectedReceiptData ? (
                  <div className="h-full flex flex-col">
                    <div className="p-4 border-b border-gray-200">
                      <div className="flex justify-between items-start">
                        <div>
                          <h2 className="text-lg font-medium text-gray-900">{selectedReceiptData.name}</h2>
                          <p className="text-sm text-gray-500">{selectedReceiptData.vendor}</p>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            className="text-red-400 hover:text-red-600"
                            onClick={() => handleDeleteReceipt(selectedReceiptData.id)}
                          >
                            <Trash className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                      <div className="mt-2 flex justify-between">
                        <div>
                          <p className="text-sm text-gray-500">Amount</p>
                          <p className="text-lg font-medium text-gray-900">${selectedReceiptData.amount.toFixed(2)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">Date</p>
                          <p className="text-sm font-medium text-gray-900">{selectedReceiptData.date}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex-1 overflow-auto p-4">
                      <div className="bg-gray-100 rounded-lg overflow-hidden max-h-[400px]">
                        <img
                          src={selectedReceiptData.imageUrl}
                          alt={selectedReceiptData.name}
                          className="w-full h-full object-contain max-h-[400px]"
                        />
                      </div>
                      <div className="mt-4">
                        <h3 className="text-sm font-medium text-gray-900">Extracted Information</h3>
                        <div className="mt-2 space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-500">Vendor:</span>
                            <span className="text-sm text-gray-900">{selectedReceiptData.vendor}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-500">Date:</span>
                            <span className="text-sm text-gray-900">{selectedReceiptData.date}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-500">Total:</span>
                            <span className="text-sm text-gray-900">${selectedReceiptData.amount.toFixed(2)}</span>
                          </div>
                          {selectedReceiptData.extractedData?.taxAmount && (
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-500">Tax:</span>
                              <span className="text-sm text-gray-900">${parseFloat(selectedReceiptData.extractedData.taxAmount).toFixed(2)}</span>
                            </div>
                          )}
                          {selectedReceiptData.extractedData?.items && (
                            <div className="mt-2">
                              <span className="text-sm text-gray-500">Items:</span>
                              <ul className="mt-1 text-sm text-gray-900 list-disc list-inside">
                                {Array.isArray(selectedReceiptData.extractedData.items) ?
                                  selectedReceiptData.extractedData.items.map((item: any, index: number) => (
                                    <li key={index} className="truncate">
                                      {typeof item === 'string'
                                        ? item
                                        : typeof item === 'object' && item !== null
                                          ? `${item.name || 'Item'} ${item.price ? `$${item.price}` : ''} ${item.quantity ? `x${item.quantity}` : ''}`
                                          : 'Unknown item'}
                                    </li>
                                  )) :
                                  <li>No items detected</li>
                                }
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="mt-4">
                        <h3 className="text-sm font-medium text-gray-900">Transaction Match</h3>
                        {selectedReceiptData.transactionMatched ? (
                          <div className="mt-2 p-3 bg-green-50 rounded-lg border border-green-200">
                            <div className="flex items-start">
                              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                              <div className="ml-3">
                                <p className="text-sm font-medium text-green-800">Matched to transaction</p>
                                <p className="mt-1 text-sm text-green-700">
                                  This receipt has been automatically matched to a transaction in your account.
                                </p>
                                <button className="mt-2 text-sm font-medium text-green-700 hover:text-green-900">
                                  View Transaction
                                </button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="mt-2 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                            <div className="flex items-start">
                              <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5" />
                              <div className="ml-3">
                                <p className="text-sm font-medium text-yellow-800">No transaction match found</p>
                                <p className="mt-1 text-sm text-yellow-700">
                                  We couldn't automatically match this receipt to a transaction.
                                </p>
                                <button className="mt-2 text-sm font-medium text-yellow-700 hover:text-yellow-900">
                                  Match Manually
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {selectedReceiptData.extractedData?.category && (
                        <div className="mt-4">
                          <h3 className="text-sm font-medium text-gray-900">Tax Category</h3>
                          <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                            <p className="text-sm font-medium text-blue-800">
                              {selectedReceiptData.extractedData.category}
                            </p>
                            {selectedReceiptData.extractedData.deductible && (
                              <p className="mt-1 text-sm text-blue-700">
                                {selectedReceiptData.extractedData.deductiblePercentage === 100
                                  ? 'Fully deductible'
                                  : `${selectedReceiptData.extractedData.deductiblePercentage}% deductible`}
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="p-4 border-t border-gray-200">
                      <button
                        type="button"
                        className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        {selectedReceiptData.status === 'needs-review' ? 'Approve Receipt' : 'Edit Receipt'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center p-8 text-center">
                    <FileText className="h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No receipt selected</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {displayReceipts.length === 0
                        ? "Upload your first receipt to get started."
                        : "Select a receipt from the list to view details."}
                    </p>
                    {displayReceipts.length === 0 && (
                      <button
                        type="button"
                        onClick={handleUploadClick}
                        className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Receipt
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Receipts;