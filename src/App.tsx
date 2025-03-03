import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ReceiptsProvider } from './contexts/ReceiptsContext';
import { TransactionsProvider } from './contexts/TransactionsContext';
import { ChatProvider } from './contexts/ChatContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import Transactions from './pages/Transactions';
import Receipts from './pages/Receipts';
import TaxChat from './pages/TaxChat';
import Settings from './pages/Settings';
import LandingPage from './pages/LandingPage';

function App() {
  return (
    <AuthProvider>
      <ReceiptsProvider>
        <TransactionsProvider>
          <ChatProvider>
            <Router>
              <div className="min-h-screen bg-gray-50">
                <Routes>
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute>
                        <Navbar />
                        <Dashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/transactions"
                    element={
                      <ProtectedRoute>
                        <Navbar />
                        <Transactions />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/receipts"
                    element={
                      <ProtectedRoute>
                        <Navbar />
                        <Receipts />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/tax-chat"
                    element={
                      <ProtectedRoute>
                        <Navbar />
                        <TaxChat />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/settings"
                    element={
                      <ProtectedRoute>
                        <Navbar />
                        <Settings />
                      </ProtectedRoute>
                    }
                  />
                </Routes>
              </div>
            </Router>
          </ChatProvider>
        </TransactionsProvider>
      </ReceiptsProvider>
    </AuthProvider>
  );
}

export default App;