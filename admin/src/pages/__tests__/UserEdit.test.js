import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import UserEdit from '../UserEdit';
import * as api from '../../services/api';

jest.mock('../../services/api');
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ id: '123' }),
  useNavigate: () => jest.fn()
}));

describe('UserEdit', () => {
  it('renders edit form with user data', async () => {
    const mockUser = {
      name: 'Test User',
      email: 'test@example.com',
      isAdmin: false
    };
    
    api.getUserById.mockResolvedValue(mockUser);

    render(
      <BrowserRouter>
        <UserEdit />
      </BrowserRouter>
    );

    expect(await screen.findByText('Edit User')).toBeInTheDocument();
    expect(await screen.findByLabelText('Name')).toHaveValue('Test User');
    expect(await screen.findByLabelText('Email')).toHaveValue('test@example.com');
  });
});