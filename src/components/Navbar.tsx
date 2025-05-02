import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Home,
  Receipt,
  FileText,
  MessageSquare,
  Settings,
  LogOut,
  Menu,
  X,
  DollarSign,
  User
} from 'lucide-react';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [userInitial, setUserInitial] = useState('U');

  useEffect(() => {
    // Safely get the first letter of the user's name or email
    if (user) {
      if (user.user_metadata?.name) {
        setUserInitial(user.user_metadata.name.charAt(0).toUpperCase());
      } else if (user.email) {
        setUserInitial(user.email.charAt(0).toUpperCase());
      }
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Mobile menu button */}
      <div className="fixed top-4 right-4 z-50 md:hidden">
        <button
          onClick={toggleMenu}
          className="p-2 rounded-md bg-blue-600 text-white"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar for desktop */}
      <div className="hidden md:flex md:flex-col md:fixed md:inset-y-0 md:w-64">
        <div className="flex-1 flex flex-col min-h-0 bg-blue-700">
          <div className="flex items-center h-16 flex-shrink-0 px-4 bg-blue-800">
            <DollarSign className="h-8 w-8 text-white" />
            <span className="ml-2 text-xl font-semibold text-white">TaxAI</span>
          </div>
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            <nav className="mt-5 flex-1 px-2 space-y-1">
              <Link
                to="/dashboard"
                className="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-white hover:bg-blue-600"
              >
                <Home className="mr-3 h-6 w-6" />
                Dashboard
              </Link>
              <Link
                to="/transactions"
                className="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-white hover:bg-blue-600"
              >
                <FileText className="mr-3 h-6 w-6" />
                Transactions
              </Link>
              <Link
                to="/receipts"
                className="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-white hover:bg-blue-600"
              >
                <Receipt className="mr-3 h-6 w-6" />
                Receipts
              </Link>
              <Link
                to="/tax-chat"
                className="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-white hover:bg-blue-600"
              >
                <MessageSquare className="mr-3 h-6 w-6" />
                Tax Chat
              </Link>
              <Link
                to="/settings"
                className="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-white hover:bg-blue-600"
              >
                <Settings className="mr-3 h-6 w-6" />
                Settings
              </Link>
            </nav>
          </div>
          <div className="flex-shrink-0 flex border-t border-blue-800 p-4">
            <div className="flex items-center w-full">
              <div>
                <div className="bg-blue-900 rounded-full h-9 w-9 flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {userInitial}
                  </span>
                </div>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-white">
                  {user?.user_metadata?.name || user?.email || 'User'}
                </p>
                <button
                  onClick={handleLogout}
                  className="flex items-center text-xs font-medium text-blue-200 hover:text-white"
                >
                  <LogOut className="mr-1 h-4 w-4" />
                  Sign out
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={toggleMenu}></div>
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-blue-700">
            <div className="flex items-center h-16 flex-shrink-0 px-4 bg-blue-800">
              <DollarSign className="h-8 w-8 text-white" />
              <span className="ml-2 text-xl font-semibold text-white">TaxAI</span>
            </div>
            <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
              <nav className="mt-5 px-2 space-y-1">
                <Link
                  to="/dashboard"
                  className="group flex items-center px-2 py-2 text-base font-medium rounded-md text-white hover:bg-blue-600"
                  onClick={toggleMenu}
                >
                  <Home className="mr-4 h-6 w-6" />
                  Dashboard
                </Link>
                <Link
                  to="/transactions"
                  className="group flex items-center px-2 py-2 text-base font-medium rounded-md text-white hover:bg-blue-600"
                  onClick={toggleMenu}
                >
                  <FileText className="mr-4 h-6 w-6" />
                  Transactions
                </Link>
                <Link
                  to="/receipts"
                  className="group flex items-center px-2 py-2 text-base font-medium rounded-md text-white hover:bg-blue-600"
                  onClick={toggleMenu}
                >
                  <Receipt className="mr-4 h-6 w-6" />
                  Receipts
                </Link>
                <Link
                  to="/tax-chat"
                  className="group flex items-center px-2 py-2 text-base font-medium rounded-md text-white hover:bg-blue-600"
                  onClick={toggleMenu}
                >
                  <MessageSquare className="mr-4 h-6 w-6" />
                  Tax Chat
                </Link>
                <Link
                  to="/settings"
                  className="group flex items-center px-2 py-2 text-base font-medium rounded-md text-white hover:bg-blue-600"
                  onClick={toggleMenu}
                >
                  <Settings className="mr-4 h-6 w-6" />
                  Settings
                </Link>
              </nav>
            </div>
            <div className="flex-shrink-0 flex border-t border-blue-800 p-4">
              <div className="flex items-center">
                <div>
                  <div className="bg-blue-900 rounded-full h-10 w-10 flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {userInitial}
                    </span>
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-base font-medium text-white">
                    {user?.user_metadata?.name || user?.email || 'User'}
                  </p>
                  <button
                    onClick={() => {
                      handleLogout();
                      toggleMenu();
                    }}
                    className="flex items-center text-sm font-medium text-blue-200 hover:text-white"
                  >
                    <LogOut className="mr-1 h-4 w-4" />
                    Sign out
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="md:pl-64 flex flex-col flex-1">
        <main className="flex-1">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              {/* Content goes here */}
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default Navbar;