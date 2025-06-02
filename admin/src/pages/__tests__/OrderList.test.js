import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import OrderList from '../OrderList';
import { getOrders } from '../../services/api';

// Mock the api module
jest.mock('../../services/api');

const mockOrders = [
  {
    _id: '1',
    user: {
      name: 'John Doe',
      email: 'john@example.com'
    },
    createdAt: '2023-05-15T10:00:00Z',
    orderItems: [
      { product: '1', name: 'Product 1', qty: 2 },
      { product: '2', name: 'Product 2', qty: 1 }
    ],
    totalPrice: 125.99,
    isPaid: true,
    isDelivered: true,
    status: 'Delivered'
  },
  {
    _id: '2',
    user: {
      name: 'Jane Smith',
      email: 'jane@example.com'
    },
    createdAt: '2023-05-16T11:00:00Z',
    orderItems: [
      { product: '3', name: 'Product 3', qty: 1 }
    ],
    totalPrice: 45.50,
    isPaid: false,
    isDelivered: false,
    status: 'Processing'
  },
  {
    _id: '3',
    guestEmail: 'guest@example.com',
    createdAt: '2023-05-17T12:00:00Z',
    orderItems: [
      { product: '4', name: 'Product 4', qty: 1 }
    ],
    totalPrice: 35.99,
    isPaid: false,
    isDelivered: false,
    status: 'Draft'
  }
];

const renderOrderList = () => {
  return render(
    <BrowserRouter>
      <OrderList />
    </BrowserRouter>
  );
};

describe('OrderList Component', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('renders loading state initially', () => {
    getOrders.mockImplementation(() => new Promise(() => {})); // Never resolves
    renderOrderList();
    expect(screen.getByRole('status')).toBeInTheDocument(); // Loader component
  });

  it('renders orders successfully', async () => {
    getOrders.mockResolvedValue(mockOrders);
    renderOrderList();

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });

    // Check if order details are displayed correctly
    expect(screen.getByText('$125.99')).toBeInTheDocument();
    expect(screen.getByText('$45.50')).toBeInTheDocument();
    expect(screen.getAllByText('Paid')).toHaveLength(1);
    expect(screen.getAllByText('Pending')).toHaveLength(1);
    expect(screen.getByText('Delivered')).toBeInTheDocument();
    expect(screen.getByText('Processing')).toBeInTheDocument();
  });

  it('handles API error', async () => {
    const errorMessage = 'Failed to fetch orders';
    getOrders.mockRejectedValue(new Error(errorMessage));
    renderOrderList();

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  it('renders guest orders correctly', async () => {
    getOrders.mockResolvedValue(mockOrders);
    renderOrderList();

    await waitFor(() => {
      expect(screen.getByText('guest@example.com')).toBeInTheDocument();
      expect(screen.getByText('Draft')).toBeInTheDocument();
    });
  });

  it('searches orders by guest email', async () => {
    getOrders.mockResolvedValue(mockOrders);
    renderOrderList();

    await waitFor(() => {
      expect(screen.getByText('guest@example.com')).toBeInTheDocument();
    });

    // Enter search term
    const searchInput = screen.getByPlaceholderText('Search orders...');
    searchInput.value = 'guest@example';
    searchInput.dispatchEvent(new Event('change'));

    await waitFor(() => {
      expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
      expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
      expect(screen.getByText('guest@example.com')).toBeInTheDocument();
    });
  });

  it('filters orders by status', async () => {
    getOrders.mockResolvedValue(mockOrders);
    renderOrderList();

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    // Select "Delivered" status
    const statusFilter = screen.getByRole('combobox');
    statusFilter.value = 'Delivered';
    statusFilter.dispatchEvent(new Event('change'));

    await waitFor(() => {
      expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
  });

  it('searches orders by customer name', async () => {
    getOrders.mockResolvedValue(mockOrders);
    renderOrderList();

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    // Enter search term
    const searchInput = screen.getByPlaceholderText('Search orders...');
    searchInput.value = 'Jane';
    searchInput.dispatchEvent(new Event('change'));

    await waitFor(() => {
      expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });
  });
});