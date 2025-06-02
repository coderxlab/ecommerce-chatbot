import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Badge, Button, Form } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaArrowLeft, FaTruck, FaCheck } from 'react-icons/fa';
import { getOrderById, updateOrderStatus, updateOrderToDelivered } from '../services/api';

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const data = await getOrderById(id);
        setOrder(data);
        setStatus(data.status);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || 'Error fetching order');
        setLoading(false);
        toast.error('Error fetching order details');
      }
    };
    
    fetchOrder();
  }, [id]);
  
  const handleStatusChange = (e) => {
    setStatus(e.target.value);
  };
  
  const updateOrderStatusHandler = async () => {
    try {
      const updatedOrder = await updateOrderStatus(id, status);
      setOrder(updatedOrder);
      toast.success('Order status updated successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error updating order status');
    }
  };
  
  const markAsDeliveredHandler = async () => {
    try {
      const updatedOrder = await updateOrderToDelivered(id);
      setOrder(updatedOrder);
      setStatus('Delivered');
      toast.success('Order marked as delivered');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error marking order as delivered');
    }
  };
  
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Delivered':
        return <Badge bg="success">Delivered</Badge>;
      case 'Shipped':
        return <Badge bg="info">Shipped</Badge>;
      case 'Processing':
        return <Badge bg="warning">Processing</Badge>;
      case 'Pending':
        return <Badge bg="secondary">Pending</Badge>;
      case 'Cancelled':
        return <Badge bg="danger">Cancelled</Badge>;
      default:
        return <Badge bg="dark">{status}</Badge>;
    }
  };
  
  if (loading) {
    return (
      <Container>
        <div className="text-center py-5">Loading...</div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <div className="text-center py-5 text-danger">
          <h3>Error</h3>
          <p>{error}</p>
          <Button variant="primary" onClick={() => navigate('/orders')}>
            Back to Orders
          </Button>
        </div>
      </Container>
    );
  }

  if (!order) {
    return (
      <Container>
        <div className="text-center py-5">
          <h3>Order Not Found</h3>
          <Button variant="primary" onClick={() => navigate('/orders')}>
            Back to Orders
          </Button>
        </div>
      </Container>
    );
  }
  
  return (
    <Container>
      <Button 
        variant="light" 
        className="mb-3"
        onClick={() => navigate('/orders')}
      >
        <FaArrowLeft /> Back to Orders
      </Button>
      
      <h1>Order #{order._id}</h1>
      
      <Row className="mb-4">
        <Col md={6}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Order Information</h5>
            </Card.Header>
            <Card.Body>
              <p><strong>Date:</strong> {new Date(order.createdAt).toLocaleDateString()}</p>
              <p><strong>Status:</strong> {getStatusBadge(order.status)}</p>
              <p><strong>Payment Method:</strong> {order.paymentMethod}</p>
              <p><strong>Payment Status:</strong> {order.isPaid ? 'Paid' : 'Not Paid'}</p>
              <p><strong>Total:</strong> ${order.totalPrice.toFixed(2)}</p>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={6}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Customer Information</h5>
            </Card.Header>
            <Card.Body>
              {order.user ? (
                <>
                  <p><strong>Name:</strong> {order.user.name}</p>
                  <p><strong>Email:</strong> {order.user.email}</p>
                </>
              ) : (
                <p><strong>Guest Email:</strong> {order.guestEmail || 'N/A'}</p>
              )}
            </Card.Body>
          </Card>
          
          {order.shippingAddress ? (
            <Card className="mt-3">
              <Card.Header>
                <h5 className="mb-0">Shipping Address</h5>
              </Card.Header>
              <Card.Body>
                <p>{order.shippingAddress.address}</p>
                <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}</p>
                <p>{order.shippingAddress.country}</p>
              </Card.Body>
            </Card>
          ) : null}
        </Col>
      </Row>
      
      <Card className="mb-4">
        <Card.Header>
          <h5 className="mb-0">Order Items</h5>
        </Card.Header>
        <Card.Body>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Product</th>
                <th>Price</th>
                <th>Quantity</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {order.orderItems.map(item => (
                <tr key={item.product}>
                  <td>
                    <div className="d-flex align-items-center">
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        style={{ width: '50px', marginRight: '10px' }} 
                      />
                      {item.name}
                    </div>
                  </td>
                  <td>${item.price.toFixed(2)}</td>
                  <td>{item.qty}</td>
                  <td>${(item.price * item.qty).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan="3" className="text-end"><strong>Total:</strong></td>
                <td><strong>${order.totalPrice.toFixed(2)}</strong></td>
              </tr>
            </tfoot>
          </Table>
        </Card.Body>
      </Card>
      
      <Card>
        <Card.Header>
          <h5 className="mb-0">Update Order Status</h5>
        </Card.Header>
        <Card.Body>
          <Row className="align-items-end">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Status</Form.Label>
                <Form.Select 
                  value={status}
                  onChange={handleStatusChange}
                >
                  <option value="Pending">Pending</option>
                  <option value="Processing">Processing</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <div className="d-flex gap-2">
                <Button 
                  variant="primary" 
                  onClick={updateOrderStatusHandler}
                >
                  <FaCheck /> Update Status
                </Button>
                
                {!order.isDelivered && (
                  <Button 
                    variant="success"
                    onClick={markAsDeliveredHandler}
                  >
                    <FaTruck /> Mark as Delivered
                  </Button>
                )}
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default OrderDetails;