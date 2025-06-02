import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import CartPage from '../../pages/CartPage';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

// Mock the hooks
jest.mock('../../context/CartContext');
jest.mock('../../context/AuthContext');

// Mock react-router-dom's useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

const mockCartItems = [
  {
    product: '1',
    name: 'Test Product',
    image: '/test.jpg',
    price: 10,
    qty: 2,
    countInStock: 5,
  },
];

const mockCartContext = {
  cartItems: mockCartItems,
  addToCart: jest.fn(),
  removeFromCart: jest.fn(),
};

const renderCartPage = () => {
  return render(
    <HelmetProvider>
      <BrowserRouter>
        <CartPage />
      </BrowserRouter>
    </HelmetProvider>
  );
};

describe('CartPage', () => {
  beforeEach(() => {
    useCart.mockReturnValue(mockCartContext);
    mockNavigate.mockClear();
  });

  it('renders cart items correctly', () => {
    useAuth.mockReturnValue({ user: null });
    renderCartPage();

    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText('$10.00')).toBeInTheDocument();
    expect(screen.getByText('$20.00')).toBeInTheDocument();
  });

  it('shows guest checkout option when user is not logged in', () => {
    useAuth.mockReturnValue({ user: null });
    renderCartPage();

    expect(screen.getByText('Sign In & Checkout')).toBeInTheDocument();
    expect(screen.getByText('Guest Checkout')).toBeInTheDocument();
  });

  it('shows single checkout button when user is logged in', () => {
    useAuth.mockReturnValue({ user: { _id: '1', name: 'Test User' } });
    renderCartPage();

    expect(screen.getByText('Proceed To Checkout')).toBeInTheDocument();
    expect(screen.queryByText('Guest Checkout')).not.toBeInTheDocument();
  });

  it('navigates to login page when clicking sign in & checkout', () => {
    useAuth.mockReturnValue({ user: null });
    renderCartPage();

    fireEvent.click(screen.getByText('Sign In & Checkout'));
    expect(mockNavigate).toHaveBeenCalledWith('/login?redirect=shipping');
  });

  it('navigates to guest order page when clicking guest checkout', () => {
    useAuth.mockReturnValue({ user: null });
    renderCartPage();

    fireEvent.click(screen.getByText('Guest Checkout'));
    expect(mockNavigate).toHaveBeenCalledWith('/guest-order');
  });

  it('navigates to shipping page when logged in user clicks checkout', () => {
    useAuth.mockReturnValue({ user: { _id: '1', name: 'Test User' } });
    renderCartPage();

    fireEvent.click(screen.getByText('Proceed To Checkout'));
    expect(mockNavigate).toHaveBeenCalledWith('/shipping');
  });

  it('shows empty cart message when cart is empty', () => {
    useAuth.mockReturnValue({ user: null });
    useCart.mockReturnValue({ ...mockCartContext, cartItems: [] });
    renderCartPage();

    expect(screen.getByText(/your cart is empty/i)).toBeInTheDocument();
  });

  it('calls removeFromCart when delete button is clicked', () => {
    useAuth.mockReturnValue({ user: null });
    renderCartPage();

    fireEvent.click(screen.getByRole('button', { name: '' })); // FaTrash icon button
    expect(mockCartContext.removeFromCart).toHaveBeenCalledWith('1');
  });

  it('calls addToCart when quantity is changed', () => {
    useAuth.mockReturnValue({ user: null });
    renderCartPage();

    fireEvent.change(screen.getByRole('combobox'), { target: { value: '3' } });
    expect(mockCartContext.addToCart).toHaveBeenCalledWith('1', 3);
  });
});