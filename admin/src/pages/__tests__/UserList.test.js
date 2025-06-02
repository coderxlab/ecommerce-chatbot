import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { toast } from 'react-toastify';
import UserList from '../UserList';
import { getUsers, deleteUser } from '../../services/api';

// Mock the API functions
jest.mock('../../services/api');
jest.mock('react-toastify');

const mockUsers = [
  {
    _id: '1',
    name: 'Test User',
    email: 'test@example.com',
    isAdmin: true,
    createdAt: '2024-01-01'
  },
  {
    _id: '2',
    name: 'Another User',
    email: 'another@example.com',
    isAdmin: false,
    createdAt: '2024-01-02'
  }
];

describe('UserList Component', () => {
  beforeEach(() => {
    getUsers.mockResolvedValue(mockUsers);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders user list and fetches data', async () => {
    render(
      <BrowserRouter>
        <UserList />
      </BrowserRouter>
    );

    // Check loading state
    expect(screen.getByText('Loading...')).toBeInTheDocument();

    // Wait for users to be loaded
    await waitFor(() => {
      expect(screen.getByText('Test User')).toBeInTheDocument();
    });

    // Verify all users are displayed
    expect(screen.getByText('another@example.com')).toBeInTheDocument();
    expect(getUsers).toHaveBeenCalledTimes(1);
  });

  test('handles user deletion', async () => {
    window.confirm = jest.fn(() => true);
    deleteUser.mockResolvedValueOnce({});

    render(
      <BrowserRouter>
        <UserList />
      </BrowserRouter>
    );

    // Wait for users to be loaded
    await waitFor(() => {
      expect(screen.getByText('Test User')).toBeInTheDocument();
    });

    // Find and click delete button for first user
    const deleteButtons = screen.getAllByText('Delete');
    fireEvent.click(deleteButtons[0]);

    // Verify confirmation was shown
    expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete this user?');

    // Verify API call was made
    await waitFor(() => {
      expect(deleteUser).toHaveBeenCalledWith('1');
      expect(toast.success).toHaveBeenCalledWith('User deleted successfully');
    });
  });

  test('handles search functionality', async () => {
    render(
      <BrowserRouter>
        <UserList />
      </BrowserRouter>
    );

    // Wait for users to be loaded
    await waitFor(() => {
      expect(screen.getByText('Test User')).toBeInTheDocument();
    });

    // Get search input and type
    const searchInput = screen.getByPlaceholderText('Search users...');
    fireEvent.change(searchInput, { target: { value: 'another' } });

    // Verify filtered results
    expect(screen.getByText('Another User')).toBeInTheDocument();
    expect(screen.queryByText('Test User')).not.toBeInTheDocument();
  });

  test('handles API error when fetching users', async () => {
    const error = new Error('Failed to fetch');
    error.response = { data: { message: 'Server error' } };
    getUsers.mockRejectedValueOnce(error);

    render(
      <BrowserRouter>
        <UserList />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Server error');
    });
  });
});