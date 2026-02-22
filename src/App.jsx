import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import NotificationContainer from './components/ui/NotificationContainer';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import Users from './pages/users/Users';
import Admin from './pages/admin/Admin';
import TanantManagement from './pages/TenantManagement/tanantmanagement';
import UserFeedback from './pages/UserFeedback/UserFeedback';
import Product from './pages/Product/Product';
import Plan from './pages/paymentPlan/plan';
import Categories from './pages/category/Categories';
import Settings from './pages/settings/Settings';

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Router>
          <div className="App">
            <NotificationContainer />
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/users"
                element={
                  <ProtectedRoute>
                    <Users />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/administrators"
                element={
                  <ProtectedRoute>
                    <Admin />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/tenant_management"
                element={
                  <ProtectedRoute>
                    <TanantManagement />
                  </ProtectedRoute>
                }
              />            
              <Route
                path="/user_feedback"
                element={
                  <ProtectedRoute>
                    <UserFeedback />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/products"
                element={
                  <ProtectedRoute>
                    <Product />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/subscription_plan"
                element={
                  <ProtectedRoute>
                    <Plan />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/categories"
                element={
                  <ProtectedRoute>
                    <Categories />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <Settings />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </Router>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
