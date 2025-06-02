import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { CartProvider } from '../../context/CartContext';
import GuestOrderPage from '../../pages/GuestOrderPage';
import * as api from '../../services/api';

// Mock the api module
jest.mock('../../services/api');

// Mock react-toastify
jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

const renderGuestOrderPage = () => {
  return render(
    <BrowserRouter>
      <CartProvider>
        <GuestOrderPage />
      </CartProvider>
    </BrowserRouter>
  );
};

describe('GuestOrderPage', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    
    // Set up localStorage mock data
    const mockCart = [
      {
        product: '1',
        name: 'Test Product',
        image: '/test.jpg',
        price: 10,
        countInStock: 5,
        qty: 2,
      },
    ];
    
    const mockShippingAddress = {
      address: '123 Test St',
      city: 'Test City',
      postalCode: '12345',
      country: 'Test Country',
    };
    
    const mockPaymentMethod = 'PayPal';
    
    localStorage.setItem('cartItems', JSON.stringify(mockCart));
    localStorage.setItem('shippingAddress', JSON.stringify(mockShippingAddress));
    localStorage.setItem('paymentMethod', mockPaymentMethod);
  });

  afterEach(() => {
    localStorage.clear();
  });

  test('shows draft order message when shipping or payment is missing', () => {
    // Clear shipping address
    localStorage.setItem('shippingAddress', JSON.stringify({}));
    renderGuestOrderPage();
    
    expect(screen.getByText('Shipping address and payment method are required to place a complete order')).toBeInTheDocument();
    expect(screen.getByRole('button')).toHaveTextContent('Place Draft Order');
  });

  test('shows regular order message when shipping and payment are present', () => {
    renderGuestOrderPage();
    
    expect(screen.getByText('Your order is ready to be placed')).toBeInTheDocument();
    expect(screen.getByRole('button')).toHaveTextContent('Place Order');
  });

  test('submits draft order successfully', async () => {
    const mockOrderResponse = { _id: 'test123' };
    api.createDraftOrder.mockResolvedValueOnce(mockOrderResponse);

    // Clear shipping address to make it a draft order
    localStorage.setItem('shippingAddress', JSON.stringify({}));
    renderGuestOrderPage();

    // Fill in email
    const emailInput = screen.getByPlaceholderText('Enter email');
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

    // Submit the form
    const submitButton = screen.getByRole('button', { name: /place draft order/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(api.createDraftOrder).toHaveBeenCalledWith(
        expect.objectContaining({
          isDraft: true,
          email: 'test@example.com',
        })
      );
    });

    expect(mockNavigate).toHaveBeenCalledWith('/track-order?orderId=test123');
  });

  test('displays error when submitting with invalid email', async () => {
    // Clear shipping address to make it a draft order
    localStorage.setItem('shippingAddress', JSON.stringify({}));
    renderGuestOrderPage();

    // Submit with invalid email
    const emailInput = screen.getByPlaceholderText('Enter email');
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });

    const submitButton = screen.getByRole('button', { name: /place draft order/i });
    fireEvent.click(submitButton);

    expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();
    expect(api.createDraftOrder).not.toHaveBeenCalled();
  });
});