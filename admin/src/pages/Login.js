import React, { useState, useEffect, useMemo } from 'react';
import { Form, Button, Container } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/Loader';
import Message from '../components/Message';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();
  const { login, user } = useAuth();

  const isLoggedIn = useMemo(() => !!user, [user])

  const isAdmin = useMemo(() => !!user?.isAdmin, [user])

  useEffect(() => {
    if (isAdmin) {
      navigate('/');
    }
  }, [isAdmin]);

  useEffect(() => {
    if (isLoggedIn && !isAdmin) {
      localStorage.removeItem('userInfo')
    }
  }, [isLoggedIn, isAdmin]);

  const submitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(email, password);
      toast.success('Login successful');
      navigate('/');
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="login-container">
      <h1 className="text-center mb-4">Admin Login</h1>
      {error && <Message variant="danger">{error}</Message>}
      {isLoggedIn && !isAdmin && <Message variant="danger">You have no permission to access the site</Message>}
      {loading && <Loader />}
      <Form onSubmit={submitHandler}>
        <Form.Group className="mb-3" controlId="email">
          <Form.Label>Email Address</Form.Label>
          <Form.Control
            type="email"
            placeholder="Enter email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="password">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </Form.Group>

        <Button variant="primary" type="submit" className="w-100" disabled={loading}>
          Sign In
        </Button>
      </Form>
    </Container>
  );
};

export default Login;
