import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider, useAuth } from '../context/AuthContext';
import App from '../App';

// Mock the AuthContext hook
jest.mock('../context/AuthContext', () => ({
  useAuth: jest.fn(),
  AuthProvider: ({ children }) => children
}));

describe('App Component', () => {
  describe('ProtectedRoute', () => {
    it('should show loading state when authentication is being checked', () => {
      useAuth.mockReturnValue({
        user: null,
        loading: true
      });

      render(
        <BrowserRouter>
          <App />
        </BrowserRouter>
      );

      // Verify that the protected content is not rendered while loading
      expect(screen.queryByTestId('layout')).not.toBeInTheDocument();
    });

    it('should redirect to login when user is not authenticated', () => {
      useAuth.mockReturnValue({
        user: null,
        loading: false
      });

      render(
        <BrowserRouter>
          <App />
        </BrowserRouter>
      );

      // Should be redirected to login page
      expect(window.location.pathname).toBe('/login');
    });

    it('should redirect to login when user is not an admin', () => {
      useAuth.mockReturnValue({
        user: { isAdmin: false },
        loading: false
      });

      render(
        <BrowserRouter>
          <App />
        </BrowserRouter>
      );

      // Should be redirected to login page
      expect(window.location.pathname).toBe('/login');
    });

    it('should render protected content for authenticated admin users', () => {
      useAuth.mockReturnValue({
        user: { isAdmin: true },
        loading: false
      });

      render(
        <BrowserRouter>
          <App />
        </BrowserRouter>
      );

      // Protected content should be rendered
      expect(screen.getByTestId('layout')).toBeInTheDocument();
    });
  });
});