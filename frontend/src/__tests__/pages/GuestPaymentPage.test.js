import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { toast } from 'react-toastify';
import { HelmetProvider } from 'react-helmet-async';
import GuestPaymentPage from '../../pages/GuestPaymentPage';
import * as api from '../../services/api';

// Mock the modules
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ orderId: 'test123' }),
  useNavigate: () => jest.fn()
}));

jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn()
  }
}));

jest.mock('../../services/api', () => ({
  getOrdersByOrderId: jest.fn(),
  updateOrderPayment: jest.fn()
}));

const mockOrder = {
  _id: 'test123',
  orderItems: [
    { name: 'Test Product', qty: 2, price: 10 }
  ],
  itemsPrice: 20,
  shippingPrice: 5,
  taxPrice: 2,
  totalPrice: 27,
  isPaid: false,
  status: 'Processing',
  createdAt: new Date().toISOString()
};

const renderWithProviders = async (component) => {
  let rendered;
  await act(async () => {
    rendered = render(
      <HelmetProvider>
        <BrowserRouter>
          {component}
        </BrowserRouter>
      </HelmetProvider>
    );
  });
  return rendered;
};

describe('GuestPaymentPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders loading state initially', async () => {
    api.getOrdersByOrderId.mockImplementation(() => new Promise(() => {}));
    
    await renderWithProviders(<GuestPaymentPage />);
    
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  test('renders order details when loaded successfully', async () => {
    api.getOrdersByOrderId.mockResolvedValue(mockOrder);
    
    await renderWithProviders(<GuestPaymentPage />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Payment for Order #test123/i })).toBeInTheDocument();
      expect(screen.getByText(/Test Product/i)).toBeInTheDocument();
      expect(screen.getByText('Items Price:')).toBeInTheDocument();
      expect(screen.getByText('$20.00')).toBeInTheDocument();
    });
  });

  test('handles payment submission', async () => {
    api.getOrdersByOrderId.mockResolvedValue(mockOrder);
    api.updateOrderPayment.mockResolvedValue({ success: true });
    
    await renderWithProviders(<GuestPaymentPage />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Process Payment/i })).toBeInTheDocument();
    });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Process Payment/i }));
    });

    await waitFor(() => {
      expect(api.updateOrderPayment).toHaveBeenCalledWith('test123', { paymentMethod: 'PayPal' });
      expect(toast.success).toHaveBeenCalledWith('Payment processed successfully!');
    });
  });

  test('handles payment error', async () => {
    api.getOrdersByOrderId.mockResolvedValue(mockOrder);
    api.updateOrderPayment.mockRejectedValue(new Error('Payment failed'));
    
    await renderWithProviders(<GuestPaymentPage />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Process Payment/i })).toBeInTheDocument();
    });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Process Payment/i }));
    });

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to process payment');
    });
  });

  test('redirects if order is already paid', async () => {
    api.getOrdersByOrderId.mockResolvedValue({ ...mockOrder, isPaid: true });
    
    await renderWithProviders(<GuestPaymentPage />);

    await waitFor(() => {
      expect(toast.info).toHaveBeenCalledWith('This order has already been paid');
    });
  });
});