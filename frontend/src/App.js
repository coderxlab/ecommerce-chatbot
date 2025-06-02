import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import ProductPage from './pages/ProductPage';
import CartPage from './pages/CartPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import ShippingPage from './pages/ShippingPage';
import PaymentPage from './pages/PaymentPage';
import PlaceOrderPage from './pages/PlaceOrderPage';
import GuestOrderPage from './pages/GuestOrderPage';
import OrderPage from './pages/OrderPage';
import OrderHistoryPage from './pages/OrderHistoryPage';
import ProductListPage from './pages/ProductListPage';
import NotFoundPage from './pages/NotFoundPage';
import OrderTrackingPage from './pages/OrderTrackingPage';
import GuestPaymentPage from './pages/GuestPaymentPage';
import PrivateRoute from './components/PrivateRoute';

function App() {
  return (
    <>
      <Header />
      <main className="py-3">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/product/:id" element={<ProductPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/products" element={<ProductListPage />} />
          <Route path="/products/search/:keyword" element={<ProductListPage />} />
          <Route path="/products/page/:pageNumber" element={<ProductListPage />} />
          <Route path="/products/search/:keyword/page/:pageNumber" element={<ProductListPage />} />
          
          <Route path="/profile" element={
            <PrivateRoute>
              <ProfilePage />
            </PrivateRoute>
          } />
          
          <Route path="/shipping" element={<ShippingPage />} />
          <Route path="/payment" element={<PaymentPage />} />
          <Route path="/placeorder" element={
            <PrivateRoute>
              <PlaceOrderPage />
            </PrivateRoute>
          } />
          <Route path="/guest-order" element={<GuestOrderPage />} />
          
          <Route path="/order/:id" element={
            <PrivateRoute>
              <OrderPage />
            </PrivateRoute>
          } />
          
          <Route path="/orderhistory" element={
            <PrivateRoute>
              <OrderHistoryPage />
            </PrivateRoute>
          } />
          
          <Route path="/track-orders" element={<OrderTrackingPage />} />
          <Route path="/guest-payment/:orderId" element={<GuestPaymentPage />} />
          
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <Footer />
      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
}

export default App;