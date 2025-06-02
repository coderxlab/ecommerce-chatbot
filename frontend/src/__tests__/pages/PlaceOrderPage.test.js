import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { toast } from 'react-toastify';
import { HelmetProvider } from 'react-helmet-async';
import PlaceOrderPage from '../../pages/PlaceOrderPage';
import { AuthProvider } from '../../context/AuthContext';
import { CartProvider } from '../../context/CartContext';
import * as api from '../../services/api';

// Mock react-router-dom's useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock react-toastify
jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock API calls
jest.mock('../../services/api');

const renderWithProviders = (component) => {
  return render(
    <HelmetProvider>
      <BrowserRouter>
        <AuthProvider>
          <CartProvider>
            {component}
          </CartProvider>
        </AuthProvider>
      </BrowserRouter>
    </HelmetProvider>
  );
};

describe('PlaceOrderPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Clear localStorage
    localStorage.clear();
  });

  it('redirects to login if user is not authenticated', async () => {
    renderWithProviders(<PlaceOrderPage />);
    
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });

  it('redirects to shipping if shipping address is not set', async () => {
    // Set authenticated user
    localStorage.setItem('userInfo', JSON.stringify({ token: 'test-token' }));
    
    renderWithProviders(<PlaceOrderPage />);
    
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/shipping');
    });
  });

  it('redirects to payment if payment method is not set', async () => {
    // Set authenticated user
    localStorage.setItem('userInfo', JSON.stringify({ token: 'test-token' }));
    
    // Mock cart context with shipping address but no payment method
    localStorage.setItem('shippingAddress', JSON.stringify({
      address: '123 Test St',
      city: 'Test City',
      postalCode: '12345',
      country: 'Test Country'
    }));
    
    renderWithProviders(<PlaceOrderPage />);
    
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/payment');
    });
  });

  it('places order successfully', async () => {
    // Set authenticated user
    localStorage.setItem('userInfo', JSON.stringify({ token: 'test-token' }));
    
    // Mock cart context with all required data
    localStorage.setItem('shippingAddress', JSON.stringify({
      address: '123 Test St',
      city: 'Test City',
      postalCode: '12345',
      country: 'Test Country'
    }));
    localStorage.setItem('paymentMethod', 'PayPal');
    localStorage.setItem('cartItems', JSON.stringify([
      {
        product: '1',
        name: 'Test Product',
        image: '/test.jpg',
        price: 10,
        qty: 2
      }
    ]));

    // Mock successful order creation
    api.createOrder.mockResolvedValueOnce({ _id: 'test-order-id' });

    renderWithProviders(<PlaceOrderPage />);

    // Click place order button
    const placeOrderButton = screen.getByText('Place Order');
    fireEvent.click(placeOrderButton);

    await waitFor(() => {
      expect(api.createOrder).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/order/test-order-id');
      expect(toast.success).toHaveBeenCalledWith('Order placed successfully');
    });
  });

  it('handles order placement error', async () => {
    // Set authenticated user
    localStorage.setItem('userInfo', JSON.stringify({ token: 'test-token' }));
    
    // Mock cart context with all required data
    localStorage.setItem('shippingAddress', JSON.stringify({
      address: '123 Test St',
      city: 'Test City',
      postalCode: '12345',
      country: 'Test Country'
    }));
    localStorage.setItem('paymentMethod', 'PayPal');
    localStorage.setItem('cartItems', JSON.stringify([
      {
        product: '1',
        name: 'Test Product',
        image: '/test.jpg',
        price: 10,
        qty: 2
      }
    ]));

    // Mock failed order creation
    const errorMessage = 'Failed to create order';
    api.createOrder.mockRejectedValueOnce(new Error(errorMessage));

    renderWithProviders(<PlaceOrderPage />);

    // Click place order button
    const placeOrderButton = screen.getByText('Place Order');
    fireEvent.click(placeOrderButton);

    await waitFor(() => {
      expect(api.createOrder).toHaveBeenCalled();
      expect(toast.error).toHaveBeenCalledWith(errorMessage);
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });
});