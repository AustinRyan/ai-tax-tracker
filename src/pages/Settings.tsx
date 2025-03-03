import React, { useState } from 'react';
import { 
  User, 
  Lock, 
  CreditCard, 
  Bell, 
  Shield, 
  HelpCircle, 
  Eye, 
  EyeOff, 
  Plus, 
  Trash, 
  Check, 
  X, 
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Settings: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Mock data for settings
  const subscriptionPlan = {
    name: 'Business Pro',
    price: '$29.99',
    billingCycle: 'monthly',
    nextBillingDate: '2025-04-15',
    features: [
      'Unlimited transactions',
      'AI tax categorization',
      'Receipt scanning & matching',
      'Tax chat assistant',
      'Priority support'
    ]
  };
  
  const paymentMethods = [
    { id: 1, type: 'card', last4: '4242', expiry: '04/26', isDefault: true },
    { id: 2, type: 'card', last4: '1234', expiry: '09/25', isDefault: false }
  ];
  
  const billingHistory = [
    { id: 1, date: '2025-03-15', amount: '$29.99', status: 'paid', invoice: '#INV-2025-001' },
    { id: 2, date: '2025-02-15', amount: '$29.99', status: 'paid', invoice: '#INV-2025-002' },
    { id: 3, date: '2025-01-15', amount: '$29.99', status: 'paid', invoice: '#INV-2025-003' }
  ];
  
  const activeSessions = [
    { id: 1, device: 'Chrome on Windows', location: 'New York, USA', lastActive: '2 minutes ago', current: true },
    { id: 2, device: 'Safari on iPhone', location: 'Boston, USA', lastActive: '2 days ago', current: false }
  ];
  
  const faqs = [
    { 
      question: 'How do I change my subscription plan?', 
      answer: 'You can change your subscription plan by going to the Billing tab in Settings. Click on "Change Plan" and select the new plan that best fits your needs.' 
    },
    { 
      question: 'Can I download my invoice history?', 
      answer: 'Yes, you can download your invoices individually by clicking the "Download" button next to each invoice in the Billing History section.' 
    },
    { 
      question: 'How do I enable two-factor authentication?', 
      answer: 'To enable two-factor authentication, go to the Security tab and click on "Enable" under the Two-Factor Authentication section. Follow the prompts to set it up using an authenticator app.' 
    },
    { 
      question: 'What happens if I delete my account?', 
      answer: 'Deleting your account will permanently remove all your data, including transaction history, receipts, and settings. This action cannot be undone. Any active subscription will be canceled.' 
    }
  ];

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
        
        <div className="mt-4 bg-white shadow rounded-lg">
          <div className="md:grid md:grid-cols-12 md:gap-x-5">
            {/* Sidebar */}
            <aside className="py-6 px-4 sm:px-6 md:py-0 md:px-0 md:col-span-3 border-b md:border-b-0 md:border-r border-gray-200">
              <nav className="space-y-1">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-md w-full ${
                    activeTab === 'profile'
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <User className={`mr-3 h-5 w-5 ${
                    activeTab === 'profile' ? 'text-blue-500' : 'text-gray-400'
                  }`} />
                  Profile
                </button>
                <button
                  onClick={() => setActiveTab('password')}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-md w-full ${
                    activeTab === 'password'
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Lock className={`mr-3 h-5 w-5 ${
                    activeTab === 'password' ? 'text-blue-500' : 'text-gray-400'
                  }`} />
                  Password
                </button>
                <button
                  onClick={() => setActiveTab('billing')}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-md w-full ${
                    activeTab === 'billing'
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <CreditCard className={`mr-3 h-5 w-5 ${
                    activeTab === 'billing' ? 'text-blue-500' : 'text-gray-400'
                  }`} />
                  Billing
                </button>
                <button
                  onClick={() => setActiveTab('notifications')}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-md w-full ${
                    activeTab === 'notifications'
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Bell className={`mr-3 h-5 w-5 ${
                    activeTab === 'notifications' ? 'text-blue-500' : 'text-gray-400'
                  }`} />
                  Notifications
                </button>
                <button
                  onClick={() => setActiveTab('security')}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-md w-full ${
                    activeTab === 'security'
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Shield className={`mr-3 h-5 w-5 ${
                    activeTab === 'security' ? 'text-blue-500' : 'text-gray-400'
                  }`} />
                  Security
                </button>
                <button
                  onClick={() => setActiveTab('help')}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-md w-full ${
                    activeTab === 'help'
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <HelpCircle className={`mr-3 h-5 w-5 ${
                    activeTab === 'help' ? 'text-blue-500' : 'text-gray-400'
                  }`} />
                  Help & Support
                </button>
              </nav>
            </aside>
            
            {/* Content area */}
            <div className="py-6 px-4 sm:p-6 md:pb-8 md:col-span-9">
              {/* Profile Settings */}
              {activeTab === 'profile' && (
                <div>
                  <h2 className="text-lg leading-6 font-medium text-gray-900">Profile Information</h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Update your personal and business information.
                  </p>
                  
                  <form className="mt-6 space-y-6">
                    <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                      <div className="sm:col-span-3">
                        <label htmlFor="first-name" className="block text-sm font-medium text-gray-700">
                          First name
                        </label>
                        <div className="mt-1">
                          <input
                            type="text"
                            name="first-name"
                            id="first-name"
                            defaultValue={user?.name.split(' ')[0]}
                            className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                          />
                        </div>
                      </div>

                      <div className="sm:col-span-3">
                        <label htmlFor="last-name" className="block text-sm font-medium text-gray-700">
                          Last name
                        </label>
                        <div className="mt-1">
                          <input
                            type="text"
                            name="last-name"
                            id="last-name"
                            defaultValue={user?.name.split(' ')[1] || ''}
                            className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                          />
                        </div>
                      </div>

                      <div className="sm:col-span-4">
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                          Email address
                        </label>
                        <div className="mt-1">
                          <input
                            id="email"
                            name="email"
                            type="email"
                            defaultValue={user?.email}
                            className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                          />
                        </div>
                      </div>

                      <div className="sm:col-span-3">
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                          Phone number
                        </label>
                        <div className="mt-1">
                          <input
                            type="text"
                            name="phone"
                            id="phone"
                            defaultValue="(555) 123-4567"
                            className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                          />
                        </div>
                      </div>

                      <div className="sm:col-span-6">
                        <label htmlFor="company" className="block text-sm font-medium text-gray-700">
                          Company name
                        </label>
                        <div className="mt-1">
                          <input
                            type="text"
                            name="company"
                            id="company"
                            defaultValue="Acme Inc."
                            className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                          />
                        </div>
                      </div>

                      <div className="sm:col-span-6">
                        <label htmlFor="business-type" className="block text-sm font-medium text-gray-700">
                          Business type
                        </label>
                        <div className="mt-1">
                          <select
                            id="business-type"
                            name="business-type"
                            className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                            defaultValue="llc"
                          >
                            <option value="sole-prop">Sole Proprietorship</option>
                            <option value="llc">LLC</option>
                            <option value="s-corp">S Corporation</option>
                            <option value="c-corp">C Corporation</option>
                            <option value="partnership">Partnership</option>
                          </select>
                        </div>
                      </div>

                      <div className="sm:col-span-6">
                        <label htmlFor="tax-id" className="block text-sm font-medium text-gray-700">
                          Tax ID (EIN/SSN)
                        </label>
                        <div className="mt-1">
                          <input
                            type="text"
                            name="tax-id"
                            id="tax-id"
                            defaultValue="XX-XXXXXXX"
                            className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                          />
                        </div>
                        <p className="mt-2 text-sm text-gray-500">
                          Your tax ID is encrypted and securely stored.
                        </p>
                      </div>
                    </div>

                    <div className="pt-5">
                      <div className="flex justify-end">
                        <button
                          type="button"
                          className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              )}
              
              {/* Password Settings */}
              {activeTab === 'password' && (
                <div>
                  <h2 className="text-lg leading-6 font-medium text-gray-900">Change Password</h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Update your password to keep your account secure.
                  </p>
                  
                  <form className="mt-6 space-y-6">
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="current-password" className="block text-sm font-medium text-gray-700">
                          Current password
                        </label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                          <input
                            id="current-password"
                            name="current-password"
                            type={showPassword ? "text" : "password"}
                            className="focus:ring-blue-500 focus:border-blue-500 block w-full pr-10 sm:text-sm border-gray-300 rounded-md"
                          />
                          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="text-gray-400 hover:text-gray-500 focus:outline-none"
                            >
                              {showPassword ? (
                                <EyeOff className="h-5 w-5" />
                              ) : (
                                <Eye className="h-5 w-5" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <label htmlFor="new-password" className="block text-sm font-medium text-gray-700">
                          New password
                        </label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                          <input
                            id="new-password"
                            name="new-password"
                            type={showNewPassword ? "text" : "password"}
                            className="focus:ring-blue-500 focus:border-blue-500 block w-full pr-10 sm:text-sm border-gray-300 rounded-md"
                          />
                          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                            <button
                              type="button"
                              onClick={() => setShowNewPassword(!showNewPassword)}
                              className="text-gray-400 hover:text-gray-500 focus:outline-none"
                            >
                              {showNewPassword ? (
                                <EyeOff className="h-5 w-5" />
                              ) : (
                                <Eye className="h-5 w-5" />
                              )}
                            </button>
                          </div>
                        </div>
                        <p className="mt-2 text-sm text-gray-500">
                          Password must be at least 8 characters and include a number and a special character.
                        </p>
                      </div>
                      
                      <div>
                        <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700">
                          Confirm new password
                        </label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                          <input
                            id="confirm-password"
                            name="confirm-password"
                            type={showConfirmPassword ? "text" : "password"}
                            className="focus:ring-blue-500 focus:border-blue-500 block w-full pr-10 sm:text-sm border-gray-300 rounded-md"
                          />
                          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                            <button
                              type="button"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              className="text-gray-400 hover:text-gray-500 focus:outline-none"
                            >
                              {showConfirmPassword ? (
                                <EyeOff className="h-5 w-5" />
                              ) : (
                                <Eye className="h-5 w-5" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-5">
                      <div className="flex justify-end">
                        <button
                          type="button"
                          className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          Update Password
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              )}
              
              {/* Billing Settings */}
              {activeTab === 'billing' && (
                <div>
                  <h2 className="text-lg leading-6 font-medium text-gray-900">Billing Information</h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Manage your subscription and payment methods.
                  </p>
                  
                  {/* Current Plan */}
                  <div className="mt-6 bg-white shadow sm:rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">Current Plan</h3>
                      <div className="mt-4 flex items-baseline">
                        <p className="text-4xl font-extrabold text-gray-900">{subscriptionPlan.price}</p>
                        <p className="ml-1 text-xl font-semibold text-gray-500">/{subscriptionPlan.billingCycle}</p>
                      </div>
                      <p className="mt-1 text-sm text-gray-500">
                        {subscriptionPlan.name} • Next billing date: {subscriptionPlan.nextBillingDate}
                      </p>
                      
                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-gray-900">Included features</h4>
                        <ul className="mt-2 space-y-2">
                          {subscriptionPlan.features.map((feature, index) => (
                            <li key={index} className="flex items-start">
                              <div className="flex-shrink-0">
                                <Check className="h-5 w-5 text-green-500" />
                              </div>
                              <p className="ml-2 text-sm text-gray-500">{feature}</p>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div className="mt-5">
                        <button
                          type="button"
                          className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          Change Plan
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Payment Methods */}
                  <div className="mt-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Payment Methods</h3>
                    <div className="mt-2 divide-y divide-gray-200 border-t border-b border-gray-200">
                      {paymentMethods.map((method) => (
                        <div key={method.id} className="py-4 flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="bg-gray-100 rounded p-2 flex-shrink-0">
                              <CreditCard className="h-5 w-5 text-gray-500" />
                            </div>
                            <div className="ml-4">
                              <p className="text-sm font-medium text-gray-900">
                                •••• •••• •••• {method.last4}
                              </p>
                              <p className="text-sm text-gray-500">
                                Expires {method.expiry}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center">
                            {method.isDefault && (
                              <span className="mr-4 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Default
                              </span>
                            )}
                            <button
                              type="button"
                              className="ml-2 text-sm font-medium text-blue-600 hover:text-blue-500"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              className="ml-2 text-sm font-medium text-red-600 hover:text-red-500"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4">
                      <button
                        type="button"
                        className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Payment Method
                      </button>
                    </div>
                  </div>
                  
                  {/* Billing History */}
                  <div className="mt-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Billing History</h3>
                    <div className="mt-2 flex flex-col">
                      <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                        <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                          <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                            <table className="min-w-full divide-y divide-gray-200">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Invoice
                                  </th>
                                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Date
                                  </th>
                                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Amount
                                  </th>
                                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                  </th>
                                  <th scope="col" className="relative px-6 py-3">
                                    <span className="sr-only">Download</span>
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                {billingHistory.map((invoice) => (
                                  <tr key={invoice.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                      {invoice.invoice}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                      {invoice.date}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                      {invoice.amount}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                        {invoice.status}
                                      </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                      <button className="text-blue-600 hover:text-blue-900">
                                        Download
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Notification Settings */}
              {activeTab === 'notifications' && (
                <div>
                  <h2 className="text-lg leading-6 font-medium text-gray-900">Notification Preferences</h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Manage how and when you receive notifications.
                  </p>
                  
                  <div className="mt-6 space-y-6">
                    <fieldset>
                      <legend className="text-base font-medium text-gray-900">Email Notifications</legend>
                      <div className="mt-4 space-y-4">
                        <div className="flex items-start">
                          <div className="flex items-center h-5">
                            <input
                              id="tax-alerts"
                              name="tax-alerts"
                              type="checkbox"
                              defaultChecked
                              className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                            />
                          </div>
                          <div className="ml-3 text-sm">
                            <label htmlFor="tax-alerts" className="font-medium text-gray-700">Tax alerts</label>
                            <p className="text-gray-500">Receive notifications about tax deadlines and important updates.</p>
                          </div>
                        </div>
                        <div className="flex items-start">
                          <div className="flex items-center h-5">
                            <input
                              id="receipt-reminders"
                              name="receipt-reminders"
                              type="checkbox"
                              defaultChecked
                              className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                            />
                          </div>
                          <div className="ml-3 text-sm">
                            <label htmlFor="receipt-reminders" className="font-medium text-gray-700">Receipt reminders</label>
                            <p className="text-gray-500">Get reminders when transactions need receipts.</p>
                          </div>
                        </div>
                        <div className="flex items-start">
                          <div className="flex items-center h-5">
                            <input
                              id="quarterly-reports"
                              name="quarterly-reports"
                              type="checkbox"
                              defaultChecked
                              className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                            />
                          </div>
                          <div className="ml-3 text-sm">
                            <label htmlFor="quarterly-reports" className="font-medium text-gray-700">Quarterly tax reports</label>
                            <p className="text-gray-500">Receive quarterly summaries of your tax situation.</p>
                          </div>
                        </div>
                        <div className="flex items-start">
                          <div className="flex items-center h-5">
                            <input
                              id="marketing"
                              name="marketing"
                              type="checkbox"
                              className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                            />
                          </div>
                          <div className="ml-3 text-sm">
                            <label htmlFor="marketing" className="font-medium text-gray-700">Marketing communications</label>
                            <p className="text-gray-500">Receive updates about new features and promotions.</p>
                          </div>
                        </div>
                      </div>
                    </fieldset>
                    
                    <fieldset>
                      <legend className="text-base font-medium text-gray-900">Push Notifications</legend>
                      <div className="mt-4 space-y-4">
                        <div className="flex items-start">
                          <div className="flex items-center h-5">
                            <input
                              id="push-tax-alerts"
                              name="push-tax-alerts"
                              type="checkbox"
                              defaultChecked
                              className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                            />
                          </div>
                          <div className="ml-3 text-sm">
                            <label htmlFor="push-tax-alerts" className="font-medium text-gray-700">Tax alerts</label>
                            <p className="text-gray-500">Receive push notifications for important tax deadlines.</p>
                          </div>
                        </div>
                        <div className="flex items-start">
                          <div className="flex items-center h-5">
                            <input
                              id="push-receipt-reminders"
                              name="push-receipt-reminders"
                              type="checkbox"
                              defaultChecked
                              className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                            />
                          </div>
                          <div className="ml-3 text-sm">
                            <label htmlFor="push-receipt-reminders" className="font-medium text-gray-700">Receipt reminders</label>
                            <p className="text-gray-500">Get push notifications for missing receipts.</p>
                          </div>
                        </div>
                      </div>
                    </fieldset>
                    
                    <div className="pt-5">
                      <div className="flex justify-end">
                        <button
                          type="button"
                          className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Security Settings */}
              {activeTab === 'security' && (
                <div>
                  <h2 className="text-lg leading-6 font-medium text-gray-900">Security Settings</h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Manage your account security and privacy.
                  </p>
                  
                  {/* Two-Factor Authentication */}
                  <div className="mt-6 bg-white shadow sm:rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">Two-factor authentication</h3>
                      <div className="mt-2 max-w-xl text-sm text-gray-500">
                        <p>
                          Add an extra layer of security to your account by requiring both a password and verification code.
                        </p>
                      </div>
                      <div className="mt-5">
                        <button
                          type="button"
                          className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          Enable two-factor authentication
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Active Sessions */}
                  <div className="mt-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Active Sessions</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      These are the devices that are currently logged into your account.
                    </p>
                    <div className="mt-4 space-y-4">
                      {activeSessions.map((session) => (
                        <div key={session.id} className="bg-white shadow overflow-hidden sm:rounded-md">
                          <div className="px-4 py-5 sm:px-6">
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="text-sm font-medium text-gray-900">{session.device}</h4>
                                <p className="mt-1 text-xs text-gray-500">
                                  {session.location} • Last active {session.lastActive}
                                </p>
                              </div>
                              <div className="flex items-center">
                                {session.current && (
                                  <span className="mr-4 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    Current session
                                  </span>
                                )}
                                {!session.current && (
                                  <button
                                    type="button"
                                    className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                  >
                                    <X className="h-4 w-4 mr-1" />
                                    Log out
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Delete Account */}
                  <div className="mt-6 bg-white shadow sm:rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">Delete account</h3>
                      <div className="mt-2 max-w-xl text-sm text-gray-500">
                        <p>
                          Once you delete your account, you will lose all data associated with it.
                        </p>
                      </div>
                      <div className="mt-5">
                        <button
                          type="button"
                          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                          <Trash className="h-4 w-4 mr-2" />
                          Delete account
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Help & Support */}
              {activeTab === 'help' && (
                <div>
                  <h2 className="text-lg leading-6 font-medium text-gray-900">Help & Support</h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Find answers to common questions or contact our support team.
                  </p>
                  
                  {/* FAQs */}
                  <div className="mt-6">
                    <h3 className="text-base font-medium text-gray-900">Frequently Asked Questions</h3>
                    <dl className="mt-4 space-y-6 divide-y divide-gray-200">
                      {faqs.map((faq, index) => (
                        <div key={index} className="pt-6">
                          <dt className="text-sm font-medium text-gray-900">
                            {faq.question}
                          </dt>
                          <dd className="mt-2 text-sm text-gray-500">
                            {faq.answer}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                  
                  {/* Contact Support */}
                  <div className="mt-8 bg-white shadow sm:rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">Contact Support</h3>
                      <div className="mt-2 max-w-xl text-sm text-gray-500">
                        <p>
                          Can't find what you're looking for? Send us a message and we'll get back to you.
                        </p>
                      </div>
                      <div className="mt-5">
                        <form className="space-y-4">
                          <div>
                            <label htmlFor="subject" className="block text-sm font-medium text-gray-700">
                              Subject
                            </label>
                            <div className="mt-1">
                              <input
                                type="text"
                                name="subject"
                                id="subject"
                                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                placeholder="What can we help you with?"
                              />
                            </div>
                          </div>
                          <div>
                            <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                              Message
                            </label>
                            <div className="mt-1">
                              <textarea
                                id="message"
                                name="message"
                                rows={4}
                                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                placeholder="Describe your issue in detail"
                              />
                            </div>
                          </div>
                          <div>
                            <label htmlFor="priority" className="block text-sm font-medium text-gray-700">
                              Priority
                            </label>
                            <div className="mt-1">
                              <select
                                id="priority"
                                name="priority"
                                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                              >
                                <option>Low</option>
                                <option>Medium</option>
                                <option>High</option>
                              </select>
                            </div>
                          </div>
                          <div className="flex justify-end">
                            <button
                              type="submit"
                              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                              Send Message
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                    
                    <div className="bg-blue-50 p-4 rounded-lg mt-6">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <HelpCircle className="h-5 w-5 text-blue-400" />
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-blue-800">Need immediate assistance?</h3>
                          <div className="mt-2 text-sm text-blue-700">
                            <p>Our support team is available Monday-Friday, 9am-5pm ET.</p>
                            <p className="mt-1">
                              Email: <a href="mailto:support@taxai.com" className="font-medium">support@taxai.com</a>
                            </p>
                            <p className="mt-1">
                              Phone: <a href="tel:+18005551234" className="font-medium">(800) 555-1234</a>
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;