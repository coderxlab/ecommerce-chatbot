import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import OrderTrackingPage from '../OrderTrackingPage';
import { getOrdersByEmail, getOrderById } from '../../services/api';

// Mock the API functions
jest.mock('../../services/api');

describe('OrderTrackingPage', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('renders search by email form by default', () => {
    render(<OrderTrackingPage />);
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter your email/i)).toBeInTheDocument();
  });

  it('switches between email and order ID search', () => {
    render(<OrderTrackingPage />);
    
    // Initially shows email input
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    
    // Switch to Order ID search
    fireEvent.click(screen.getByLabelText(/order id/i));
    expect(screen.getByLabelText(/order id/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/email address/i)).not.toBeInTheDocument();
    
    // Switch back to email search
    fireEvent.click(screen.getByLabelText(/email/i));
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
  });

  it('searches orders by email', async () => {
    const mockOrders = [
      { _id: '1', totalPrice: 100, status: 'Pending', orderItems: [] },
      { _id: '2', totalPrice: 200, status: 'Delivered', orderItems: [] }
    ];
    
    getOrdersByEmail.mockResolvedValueOnce(mockOrders);
    
    render(<OrderTrackingPage />);
    
    fireEvent.change(screen.getByPlaceholderText(/enter your email/i), {
      target: { value: 'test@example.com' }
    });
    
    fireEvent.click(screen.getByRole('button', { name: /find order/i }));
    
    await waitFor(() => {
      expect(getOrdersByEmail).toHaveBeenCalledWith('test@example.com');
      expect(screen.getByText('Your Orders')).toBeInTheDocument();
    });
  });

  it('searches order by ID', async () => {
    const mockOrder = {
      _id: '123',
      totalPrice: 100,
      status: 'Pending',
      orderItems: []
    };
    
    getOrderById.mockResolvedValueOnce(mockOrder);
    
    render(<OrderTrackingPage />);
    
    // Switch to Order ID search
    fireEvent.click(screen.getByLabelText(/order id/i));
    
    fireEvent.change(screen.getByPlaceholderText(/enter your order id/i), {
      target: { value: '123' }
    });
    
    fireEvent.click(screen.getByRole('button', { name: /find order/i }));
    
    await waitFor(() => {
      expect(getOrderById).toHaveBeenCalledWith('123');
      expect(screen.getByText('Your Orders')).toBeInTheDocument();
    });
  });

  it('shows error message when order is not found', async () => {
    getOrderById.mockRejectedValueOnce(new Error('Order not found'));
    
    render(<OrderTrackingPage />);
    
    // Switch to Order ID search
    fireEvent.click(screen.getByLabelText(/order id/i));
    
    fireEvent.change(screen.getByPlaceholderText(/enter your order id/i), {
      target: { value: 'invalid-id' }
    });
    
    fireEvent.click(screen.getByRole('button', { name: /find order/i }));
    
    await waitFor(() => {
      expect(screen.getByText(/no order found with this id/i)).toBeInTheDocument();
    });
  });

  it('shows error message when no orders found for email', async () => {
    getOrdersByEmail.mockResolvedValueOnce([]);
    
    render(<OrderTrackingPage />);
    
    fireEvent.change(screen.getByPlaceholderText(/enter your email/i), {
      target: { value: 'noresults@example.com' }
    });
    
    fireEvent.click(screen.getByRole('button', { name: /find order/i }));
    
    await waitFor(() => {
      expect(screen.getByText(/no orders found for this email address/i)).toBeInTheDocument();
    });
  });
});