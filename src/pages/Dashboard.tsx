import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTransactions } from '../contexts/TransactionsContext';
import { useReceipts } from '../contexts/ReceiptsContext';
import { 
  DollarSign, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  FileText,
  Receipt,
  CreditCard,
  BarChart2
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { transactions, loading: transactionsLoading } = useTransactions();
  const { receipts, loading: receiptsLoading } = useReceipts();
  
  const [stats, setStats] = useState([
    { name: 'Total Transactions', value: '0', icon: FileText, color: 'bg-blue-100 text-blue-600' },
    { name: 'Potential Deductions', value: '$0', icon: DollarSign, color: 'bg-green-100 text-green-600' },
    { name: 'Estimated Tax Savings', value: '$0', icon: TrendingUp, color: 'bg-purple-100 text-purple-600' },
    { name: 'Pending Receipts', value: '0', icon: Clock, color: 'bg-yellow-100 text-yellow-600' },
  ]);
  
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [taxAlerts, setTaxAlerts] = useState([
    { id: 1, message: 'Quarterly estimated tax payment due in 15 days', type: 'warning' },
    { id: 2, message: 'New potential deduction found: Home office expenses', type: 'success' },
    { id: 3, message: '5 transactions need receipts for proper documentation', type: 'warning' },
  ]);
  
  const [categoryTotals, setCategoryTotals] = useState<{[key: string]: number}>({});
  const [totalSpending, setTotalSpending] = useState(0);
  const [taxSavings, setTaxSavings] = useState(0);
  const [pendingReceiptsCount, setPendingReceiptsCount] = useState(0);

  // Calculate dashboard statistics based on actual data
  useEffect(() => {
    if (transactions.length > 0) {
      // Calculate total spending
      const total = transactions.reduce((sum, t) => sum + Number(t.amount), 0);
      setTotalSpending(total);
      
      // Group by category
      const catTotals: {[key: string]: number} = {};
      transactions.forEach(t => {
        if (t.category) {
          catTotals[t.category] = (catTotals[t.category] || 0) + Number(t.amount);
        }
      });
      setCategoryTotals(catTotals);
      
      // Calculate estimated tax savings (simplified calculation)
      // Assuming 25% tax rate for business expenses
      const deductibleAmount = transactions.reduce((sum, t) => {
        // Meals & Entertainment are 50% deductible
        if (t.category === 'Meals & Entertainment') {
          return sum + (Number(t.amount) * 0.5);
        }
        return sum + Number(t.amount);
      }, 0);
      
      const estimatedSavings = deductibleAmount * 0.25;
      setTaxSavings(estimatedSavings);
      
      // Get recent transactions
      const recent = [...transactions]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5);
      setRecentTransactions(recent);
      
      // Update stats
      setStats([
        { name: 'Total Transactions', value: transactions.length.toString(), icon: FileText, color: 'bg-blue-100 text-blue-600' },
        { name: 'Potential Deductions', value: `$${deductibleAmount.toFixed(2)}`, icon: DollarSign, color: 'bg-green-100 text-green-600' },
        { name: 'Estimated Tax Savings', value: `$${estimatedSavings.toFixed(2)}`, icon: TrendingUp, color: 'bg-purple-100 text-purple-600' },
        { name: 'Pending Receipts', value: pendingReceiptsCount.toString(), icon: Clock, color: 'bg-yellow-100 text-yellow-600' },
      ]);
    }
  }, [transactions, pendingReceiptsCount]);
  
  // Calculate pending receipts
  useEffect(() => {
    if (receipts.length > 0 && transactions.length > 0) {
      // Count receipts that don't have a transaction match
      const pending = receipts.filter(r => !r.transaction_id).length;
      setPendingReceiptsCount(pending);
      
      // Update tax alerts based on pending receipts
      const updatedAlerts = [...taxAlerts];
      if (pending > 0) {
        // Replace the third alert with actual pending receipts count
        updatedAlerts[2] = { 
          id: 3, 
          message: `${pending} transaction${pending === 1 ? '' : 's'} need${pending === 1 ? 's' : ''} receipts for proper documentation`, 
          type: 'warning' 
        };
      } else {
        // All receipts are matched
        updatedAlerts[2] = { 
          id: 3, 
          message: 'All transactions have proper receipt documentation', 
          type: 'success' 
        };
      }
      setTaxAlerts(updatedAlerts);
    }
  }, [receipts, transactions]);

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        
        {/* Welcome message */}
        <div className="mt-4 bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900">Welcome back, {user?.user_metadata?.name || user?.email || 'User'}!</h2>
          <p className="mt-1 text-sm text-gray-600">
            Here's an overview of your tax situation and recent activity.
          </p>
        </div>
        
        {/* Stats */}
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.name} className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className={`flex-shrink-0 rounded-md p-3 ${stat.color}`}>
                    <stat.icon className="h-6 w-6" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">{stat.name}</dt>
                      <dd>
                        <div className="text-lg font-medium text-gray-900">{stat.value}</div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Alerts */}
        <div className="mt-6">
          <h2 className="text-lg font-medium text-gray-900">Tax Alerts</h2>
          <div className="mt-2 space-y-4">
            {taxAlerts.map((alert) => (
              <div 
                key={alert.id} 
                className={`p-4 rounded-md ${
                  alert.type === 'warning' 
                    ? 'bg-yellow-50 border-l-4 border-yellow-400' 
                    : 'bg-green-50 border-l-4 border-green-400'
                }`}
              >
                <div className="flex">
                  <div className="flex-shrink-0">
                    {alert.type === 'warning' ? (
                      <AlertCircle className="h-5 w-5 text-yellow-400" />
                    ) : (
                      <CheckCircle className="h-5 w-5 text-green-400" />
                    )}
                  </div>
                  <div className="ml-3">
                    <p className={`text-sm ${
                      alert.type === 'warning' ? 'text-yellow-700' : 'text-green-700'
                    }`}>
                      {alert.message}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Recent Transactions */}
        <div className="mt-6">
          <h2 className="text-lg font-medium text-gray-900">Recent Transactions</h2>
          {transactionsLoading ? (
            <div className="mt-4 flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : recentTransactions.length > 0 ? (
            <div className="mt-2 flex flex-col">
              <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                  <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Transaction
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Amount
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Category
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {recentTransactions.map((transaction) => (
                          <tr key={transaction.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {transaction.name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              ${Number(transaction.amount).toFixed(2)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {transaction.category}
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
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-4 bg-white p-6 rounded-lg shadow text-center">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No transactions yet</h3>
              <p className="mt-1 text-sm text-gray-500">
                Start by adding transactions or uploading receipts.
              </p>
            </div>
          )}
          <div className="mt-4">
            <a href="/transactions" className="text-sm font-medium text-blue-600 hover:text-blue-500">
              View all transactions <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>
        
        {/* Spending by Category */}
        <div className="mt-6 bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900">Spending by Category</h2>
          {Object.keys(categoryTotals).length > 0 ? (
            <div className="mt-4 space-y-4">
              {Object.entries(categoryTotals)
                .sort(([, a], [, b]) => b - a)
                .map(([category, amount]) => (
                  <div key={category}>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">{category}</span>
                      <span className="text-sm font-medium text-gray-900">${amount.toFixed(2)}</span>
                    </div>
                    <div className="mt-1 relative pt-1">
                      <div className="overflow-hidden h-2 text-xs flex rounded bg-blue-200">
                        <div 
                          style={{ width: `${(amount / totalSpending) * 100}%` }} 
                          className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"
                        ></div>
                      </div>
                    </div>
                  </div>
                ))
              }
            </div>
          ) : (
            <div className="mt-4 text-center py-4">
              <BarChart2 className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-sm text-gray-500">No category data available yet</p>
            </div>
          )}
        </div>
        
        {/* Recent Receipts */}
        <div className="mt-6 bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900">Recent Receipts</h2>
          {receiptsLoading ? (
            <div className="mt-4 flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : receipts.length > 0 ? (
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {receipts.slice(0, 3).map((receipt) => (
                <div key={receipt.id} className="border rounded-lg overflow-hidden shadow-sm">
                  <div className="h-32 bg-gray-200 relative">
                    <img 
                      src={receipt.image_url || 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80'} 
                      alt={receipt.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-3">
                    <h3 className="text-sm font-medium text-gray-900 truncate">{receipt.name}</h3>
                    <p className="text-xs text-gray-500">{receipt.vendor || 'Unknown Vendor'}</p>
                    <div className="mt-1 flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-900">${Number(receipt.amount).toFixed(2)}</span>
                      <span className="text-xs text-gray-500">{receipt.date}</span>
                    </div>
                   <div className="mt-2 flex justify-between">
                      <span className={`text-xs ${receipt.transaction_id ? 'text-green-600' : 'text-gray-500'}`}>
                        {receipt.transaction_id ? 'Matched' : 'Unmatched'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-4 text-center py-4">
              <Receipt className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-sm text-gray-500">No receipts uploaded yet</p>
            </div>
          )}
          <div className="mt-4">
            <a href="/receipts" className="text-sm font-medium text-blue-600 hover:text-blue-500">
              View all receipts <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>
        
        {/* Tax Savings Projection */}
        <div className="mt-6 bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900">Tax Savings Projection</h2>
          <p className="mt-1 text-sm text-gray-600">
            Based on your current deductions and expenses, we project the following tax savings:
          </p>
          <div className="mt-4 flex items-baseline">
            <p className="text-4xl font-semibold text-gray-900">${taxSavings.toFixed(2)}</p>
            <p className="ml-2 text-sm font-medium text-green-600">+12% from last year</p>
          </div>
          <div className="mt-4">
            <div className="relative pt-1">
              <div className="flex mb-2 items-center justify-between">
                <div>
                  <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-600 bg-blue-200">
                    {Math.min(Math.round((transactions.length / (transactions.length + pendingReceiptsCount || 1)) * 100), 100)}% of potential deductions claimed
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold inline-block text-blue-600">
                    {Math.min(Math.round((transactions.length / (transactions.length + pendingReceiptsCount || 1)) * 100), 100)}%
                  </span>
                </div>
              </div>
              <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-200">
                <div 
                  style={{ width: `${Math.min(Math.round((transactions.length / (transactions.length + pendingReceiptsCount || 1)) * 100), 100)}%` }} 
                  className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"
                ></div>
              </div>
            </div>
          </div>
          <div className="mt-4">
            <a href="/tax-chat" className="text-sm font-medium text-blue-600 hover:text-blue-500">
              See how to maximize your tax savings <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;