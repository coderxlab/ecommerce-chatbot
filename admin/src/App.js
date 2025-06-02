import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { useAuth } from './context/AuthContext';

// Layout Components
import Layout from './components/Layout';

// Pages
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import ProductList from './pages/ProductList';
import ProductEdit from './pages/ProductEdit';
import UserList from './pages/UserList';
import UserEdit from './pages/UserEdit';
import OrderList from './pages/OrderList';
import OrderDetails from './pages/OrderDetails';
import DeliveryRouteList from './pages/DeliveryRouteList';
import DeliveryRouteEdit from './pages/DeliveryRouteEdit';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  // Show loading state or spinner while checking authentication
  if (loading) {
    return null; // or return a loading spinner component
  }
  
  if (!user || !user.isAdmin) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

function App() {
  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route path="/" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route index element={<Dashboard />} />
          <Route path="products" element={<ProductList />} />
          <Route path="products/:id/edit" element={<ProductEdit />} />
          <Route path="products/new" element={<ProductEdit />} />
          <Route path="users" element={<UserList />} />
          <Route path="users/:id/edit" element={<UserEdit />} />
          <Route path="orders" element={<OrderList />} />
          <Route path="orders/:id" element={<OrderDetails />} />
          <Route path="delivery" element={<DeliveryRouteList />} />
          <Route path="delivery/:id/edit" element={<DeliveryRouteEdit />} />
          <Route path="delivery/new" element={<DeliveryRouteEdit />} />
          <Route path="profile" element={<Profile />} />
        </Route>
        
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default App;
