import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { toast } from 'react-toastify';
import DeliveryRouteList from '../DeliveryRouteList';
import { getDeliveryRoutes } from '../../services/api';

// Mock the api and toast
jest.mock('../../services/api');
jest.mock('react-toastify');

const mockRoutes = [
  {
    _id: "683bee2249f6289522a9e744",
    name: "test-route",
    driver: {
      _id: "683beda749f6289522a9e717",
      name: "john-driver"
    },
    vehicle: "pick-up truck",
    startLocation: "LangSon",
    stops: [
      {
        order: {
          _id: "683bd3371dfaa0aa8c3101e9",
          totalPrice: 44.5
        },
        address: "Hanoi, Hanoi, 100000",
        status: "Pending",
        _id: "683bee2249f6289522a9e745"
      }
    ],
    status: "Planning",
    totalDistance: 0,
    createdAt: "2025-06-01T06:07:30.663Z",
    updatedAt: "2025-06-01T06:07:30.663Z"
  }
];

describe('DeliveryRouteList', () => {
  beforeEach(() => {
    getDeliveryRoutes.mockClear();
    toast.error.mockClear();
  });

  it('renders delivery routes correctly', async () => {
    getDeliveryRoutes.mockResolvedValueOnce(mockRoutes);

    render(
      <BrowserRouter>
        <DeliveryRouteList />
      </BrowserRouter>
    );

    // Wait for the data to load
    await waitFor(() => {
      expect(screen.getByText('test-route')).toBeInTheDocument();
      expect(screen.getByText('john-driver')).toBeInTheDocument();
      expect(screen.getByText('pick-up truck')).toBeInTheDocument();
      expect(screen.getByText('1')).toBeInTheDocument(); // number of stops
    });
  });

  it('handles API error correctly', async () => {
    const error = new Error('API Error');
    error.response = { data: { message: 'Failed to fetch delivery routes' } };
    getDeliveryRoutes.mockRejectedValueOnce(error);

    render(
      <BrowserRouter>
        <DeliveryRouteList />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to fetch delivery routes');
      expect(screen.getByText('Failed to fetch delivery routes')).toBeInTheDocument();
    });
  });

  it('filters routes by search term', async () => {
    getDeliveryRoutes.mockResolvedValueOnce(mockRoutes);

    render(
      <BrowserRouter>
        <DeliveryRouteList />
      </BrowserRouter>
    );

    await waitFor(() => {
      const searchInput = screen.getByPlaceholderText('Search routes...');
      searchInput.value = 'john';
      expect(screen.getByText('john-driver')).toBeInTheDocument();
    });
  });
});