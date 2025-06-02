import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Card } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getUserById, updateUser, registerUser } from '../services/api';

const UserEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    isAdmin: false
  });
  
  const [loading, setLoading] = useState(isEditMode);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchUser = async () => {
      try {
        if (isEditMode) {
          const userData = await getUserById(id);
          setFormData({
            name: userData.name,
            email: userData.email,
            isAdmin: userData.isAdmin,
            password: '' // Don't populate password field for security
          });
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Error fetching user data');
        toast.error('Error fetching user data');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id, isEditMode]);
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name || !formData.email) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    if (!isEditMode && !formData.password) {
      toast.error('Password is required for new users');
      return;
    }

    try {
      setLoading(true);
      if (isEditMode) {
        // Only send password if it was changed
        const updateData = {
          name: formData.name,
          email: formData.email,
          isAdmin: formData.isAdmin,
          ...(formData.password ? { password: formData.password } : {})
        };
        await updateUser(id, updateData);
      } else {
        // For new users, we need to use the register endpoint
        await registerUser({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          isAdmin: formData.isAdmin
        });
      }
      toast.success(`User ${isEditMode ? 'updated' : 'created'} successfully`);
      navigate('/users');
    } catch (err) {
      const errorMsg = err.response?.data?.message || `Error ${isEditMode ? 'updating' : 'creating'} user`;
      toast.error(errorMsg);
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  return (
    <Container>
      <h1>{isEditMode ? 'Edit User' : 'Create User'}</h1>
      
      <Card className="mt-3">
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>{isEditMode ? 'New Password (leave blank to keep current)' : 'Password'}</Form.Label>
              <Form.Control
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required={!isEditMode}
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                label="Admin User"
                name="isAdmin"
                checked={formData.isAdmin}
                onChange={handleChange}
              />
            </Form.Group>
            
            <div className="d-flex gap-2">
              <Button variant="primary" type="submit">
                {isEditMode ? 'Update' : 'Create'}
              </Button>
              <Button variant="secondary" onClick={() => navigate('/users')}>
                Cancel
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default UserEdit;
