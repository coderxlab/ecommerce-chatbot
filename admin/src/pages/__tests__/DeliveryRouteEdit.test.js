import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { toast } from 'react-toastify';
import DeliveryRouteEdit from '../DeliveryRouteEdit';
import * as api from '../../services/api';

// Mock the react-router-dom hooks
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ id: '123' }),
  useNavigate: () => jest.fn()
}));

// Mock the react-toastify
jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn()
  }
}));

// Mock the API calls
jest.mock('../../services/api');

describe('DeliveryRouteEdit Component', () => {
  const mockOrders = [
    { 
      _id: '1', 
      user: { name: 'John Doe' },
      shippingAddress: {
        address: '123 Main St',
        city: 'Anytown',
        postalCode: '12345'
      },
      orderItems: [{ name: 'Item 1' }],
      deliveryRoute: null,
      isDelivered: false
    }
  ];

  const mockRoute = {
    name: 'Test Route',
    driver: 'Test Driver',
    vehicle: 'Test Vehicle',
    date: '2024-03-20',
    status: 'Scheduled',
    notes: 'Test notes',
    stops: []
  };

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    
    // Setup default API responses
    api.getOrders.mockResolvedValue(mockOrders);
    api.getDeliveryRouteById.mockResolvedValue(mockRoute);
    api.createDeliveryRoute.mockResolvedValue({ ...mockRoute, id: '123' });
    api.updateDeliveryRoute.mockResolvedValue(mockRoute);
    api.addOrderToRoute.mockResolvedValue({ ...mockRoute, stops: [{ order: mockOrders[0] }] });
  });

  test('renders form fields correctly', async () => {
    render(
      <BrowserRouter>
        <DeliveryRouteEdit />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/Route Name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Driver/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Vehicle/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Date/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Status/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Notes/i)).toBeInTheDocument();
    });
  });

  test('loads existing route data in edit mode', async () => {
    render(
      <BrowserRouter>
        <DeliveryRouteEdit />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(api.getDeliveryRouteById).toHaveBeenCalledWith('123');
      expect(screen.getByLabelText(/Route Name/i)).toHaveValue(mockRoute.name);
      expect(screen.getByLabelText(/Driver/i)).toHaveValue(mockRoute.driver);
      expect(screen.getByLabelText(/Vehicle/i)).toHaveValue(mockRoute.vehicle);
    });
  });

  test('shows validation error when submitting without required fields', async () => {
    render(
      <BrowserRouter>
        <DeliveryRouteEdit />
      </BrowserRouter>
    );

    const submitButton = await screen.findByText(/Update Route/i);
    fireEvent.click(submitButton);

    expect(toast.error).toHaveBeenCalledWith('Please add at least one order to the route');
  });

  test('handles order addition successfully', async () => {
    render(
      <BrowserRouter>
        <DeliveryRouteEdit />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(api.getOrders).toHaveBeenCalled();
    });

    const addButton = await screen.findByText(/Add/i);
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(api.addOrderToRoute).toHaveBeenCalled();
    });
  });

  test('handles form submission successfully', async () => {
    render(
      <BrowserRouter>
        <DeliveryRouteEdit />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/Route Name/i)).toBeInTheDocument();
    });

    // Fill in the form
    fireEvent.change(screen.getByLabelText(/Route Name/i), { target: { value: 'New Route' } });
    fireEvent.change(screen.getByLabelText(/Driver/i), { target: { value: 'New Driver' } });
    fireEvent.change(screen.getByLabelText(/Vehicle/i), { target: { value: 'New Vehicle' } });
    fireEvent.change(screen.getByLabelText(/Date/i), { target: { value: '2024-03-20' } });

    // Add an order
    const addButton = await screen.findByText(/Add/i);
    fireEvent.click(addButton);

    // Submit the form
    const submitButton = await screen.findByText(/Update Route/i);
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(api.updateDeliveryRoute).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalledWith('Delivery route updated successfully');
    });
  });
});