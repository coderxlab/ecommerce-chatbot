import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import OrderTrackingPage from '../../pages/OrderTrackingPage';
import { getOrdersByEmail } from '../../services/api';

// Mock the API module
jest.mock('../../services/api', () => ({
  getOrdersByEmail: jest.fn()
}));

const mockOrders = [
  {
    _id: '1',
    createdAt: '2023-01-01T00:00:00.000Z',
    status: 'Processing',
    totalPrice: 100.00,
    isPaid: true,
    paidAt: '2023-01-01T00:00:00.000Z',
    isDelivered: false,
    orderItems: [
      {
        name: 'Test Product',
        qty: 2,
        price: 50.00
      }
    ]
  }
];

const renderWithProviders = (component) => {
  return render(
    <HelmetProvider>
      <BrowserRouter>
        {component}
      </BrowserRouter>
    </HelmetProvider>
  );
};

describe('OrderTrackingPage', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  test('renders order tracking form', () => {
    renderWithProviders(<OrderTrackingPage />);

    expect(screen.getByText('Track Your Orders')).toBeInTheDocument();
    expect(screen.getByLabelText('Email Address')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Find My Orders' })).toBeInTheDocument();
  });

  test('displays orders when email is submitted successfully', async () => {
    // Mock the API response
    getOrdersByEmail.mockResolvedValueOnce(mockOrders);

    renderWithProviders(<OrderTrackingPage />);

    // Fill in the email and submit
    const emailInput = screen.getByLabelText('Email Address');
    const submitButton = screen.getByRole('button', { name: 'Find My Orders' });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.click(submitButton);

    // Wait for the orders to be displayed
    await waitFor(() => {
      expect(screen.getByText('Your Orders')).toBeInTheDocument();
      expect(screen.getByText('Test Product')).toBeInTheDocument();
      expect(screen.getByText('$100.00')).toBeInTheDocument();
    });

    // Verify API was called correctly
    expect(getOrdersByEmail).toHaveBeenCalledWith('test@example.com');
  });

  test('displays error message when API call fails', async () => {
    // Mock the API error response
    getOrdersByEmail.mockRejectedValueOnce({ 
      response: { data: { message: 'No orders found' } }
    });

    renderWithProviders(<OrderTrackingPage />);

    // Fill in the email and submit
    const emailInput = screen.getByLabelText('Email Address');
    const submitButton = screen.getByRole('button', { name: 'Find My Orders' });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.click(submitButton);

    // Wait for the error message
    await waitFor(() => {
      expect(screen.getByText('No orders found')).toBeInTheDocument();
    });
  });

  test('displays no orders message when API returns empty array', async () => {
    // Mock the API response with empty array
    getOrdersByEmail.mockResolvedValueOnce([]);

    renderWithProviders(<OrderTrackingPage />);

    // Fill in the email and submit
    const emailInput = screen.getByLabelText('Email Address');
    const submitButton = screen.getByRole('button', { name: 'Find My Orders' });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.click(submitButton);

    // Wait for the no orders message
    await waitFor(() => {
      expect(screen.getByText('No orders found for this email address.')).toBeInTheDocument();
    });
  });
});