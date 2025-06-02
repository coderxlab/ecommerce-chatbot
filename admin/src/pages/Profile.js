import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { FaUser, FaKey } from 'react-icons/fa';

const Profile = () => {
  const { user, updateUser } = useAuth();
  
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    avatar: ''
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [loading, setLoading] = useState(true);
  const [profileError, setProfileError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  
  useEffect(() => {
    if (user) {
      // In a real app, you might want to fetch the latest user data from the API
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        avatar: user.avatar || ''
      });
      setLoading(false);
    }
  }, [user]);
  
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData({
      ...profileData,
      [name]: value
    });
  };
  
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({
      ...passwordData,
      [name]: value
    });
  };
  
  const handleProfileSubmit = (e) => {
    e.preventDefault();
    setProfileError('');
    
    // Validation
    if (!profileData.name || !profileData.email) {
      setProfileError('Name and email are required');
      return;
    }
    
    // In a real app, this would be an API call to update the user profile
    // For now, we'll just simulate a successful update
    setTimeout(() => {
      updateUser({
        ...user,
        ...profileData
      });
      toast.success('Profile updated successfully');
    }, 500);
  };
  
  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    setPasswordError('');
    
    // Validation
    if (!passwordData.currentPassword) {
      setPasswordError('Current password is required');
      return;
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters long');
      return;
    }
    
    // In a real app, this would be an API call to change the password
    // For now, we'll just simulate a successful update
    setTimeout(() => {
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      toast.success('Password changed successfully');
    }, 500);
  };
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  return (
    <Container>
      <h1>My Profile</h1>
      
      <Row>
        <Col md={6}>
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">
                <FaUser className="me-2" /> Profile Information
              </h5>
            </Card.Header>
            <Card.Body>
              {profileError && (
                <Alert variant="danger">{profileError}</Alert>
              )}
              
              <Form onSubmit={handleProfileSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={profileData.name}
                    onChange={handleProfileChange}
                    required
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={profileData.email}
                    onChange={handleProfileChange}
                    required
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Phone</Form.Label>
                  <Form.Control
                    type="text"
                    name="phone"
                    value={profileData.phone}
                    onChange={handleProfileChange}
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Avatar URL</Form.Label>
                  <Form.Control
                    type="text"
                    name="avatar"
                    value={profileData.avatar}
                    onChange={handleProfileChange}
                  />
                  {profileData.avatar && (
                    <div className="mt-2">
                      <img 
                        src={profileData.avatar} 
                        alt="Avatar Preview" 
                        style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '50%' }} 
                      />
                    </div>
                  )}
                </Form.Group>
                
                <Button variant="primary" type="submit">
                  Update Profile
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={6}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">
                <FaKey className="me-2" /> Change Password
              </h5>
            </Card.Header>
            <Card.Body>
              {passwordError && (
                <Alert variant="danger">{passwordError}</Alert>
              )}
              
              <Form onSubmit={handlePasswordSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Current Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    required
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>New Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    required
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Confirm New Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    required
                  />
                </Form.Group>
                
                <Button variant="primary" type="submit">
                  Change Password
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Profile;
