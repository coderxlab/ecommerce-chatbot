import React, { useState } from 'react';
import { Container, Form, Button, ListGroup, Row, Col, Card } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import Message from '../components/Message';
import Loader from '../components/Loader';
import Meta from '../components/Meta';
import { getOrdersByEmail, getOrdersByOrderId } from '../services/api';

const OrderTrackingPage = () => {
  const navigate = useNavigate();
  const [searchType, setSearchType] = useState('email');
  const [email, setEmail] = useState('');
  const [orderId, setOrderId] = useState('');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      let data;
      
      if (searchType === 'email') {
        data = await getOrdersByEmail(email);
        setOrders(data);
      } else {
        const order = await getOrdersByOrderId(orderId);
        setOrders(order); 
      }
      
      setSearched(true);
    } catch (err) {
      const errorMessage = searchType === 'email' 
        ? 'No orders found for this email address'
        : 'Order not found with this ID';
      setError(err.response?.data?.message || errorMessage);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Meta title="Track Your Orders" />
      <h1 className="my-4">Track Your Orders</h1>
      <Form onSubmit={handleSubmit} className="mb-4">
        <Form.Group className="mb-3">
          <Form.Label>Search By</Form.Label>
          <div>
            <Form.Check
              inline
              type="radio"
              label="Email"
              name="searchType"
              id="searchEmail"
              checked={searchType === 'email'}
              onChange={() => setSearchType('email')}
            />
            <Form.Check
              inline
              type="radio"
              label="Order ID"
              name="searchType"
              id="searchOrderId"
              checked={searchType === 'orderId'}
              onChange={() => setSearchType('orderId')}
            />
          </div>
        </Form.Group>

        {searchType === 'email' ? (
          <Form.Group controlId="email" className="mb-3">
            <Form.Label>Email Address</Form.Label>
            <Form.Control
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </Form.Group>
        ) : (
          <Form.Group controlId="orderId" className="mb-3">
            <Form.Label>Order ID</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter your order ID"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              required
            />
          </Form.Group>
        )}

        <Button type="submit" variant="primary" disabled={loading}>
          {loading ? 'Searching...' : 'Find Order'}
        </Button>
      </Form>

      {loading && <Loader />}
      {error && <Message variant="danger">{error}</Message>}
      
      {searched && !error && orders.length === 0 && (
        <Message>
          {searchType === 'email' 
            ? 'No orders found for this email address.'
            : 'No order found with this ID.'}
        </Message>
      )}

      {orders.length > 0 && (
        <div>
          <h2 className="mb-4">Your Orders</h2>
          {orders.map((order) => (
            <Card key={order._id} className="mb-3">
              <Card.Header>
                <strong>Order ID: {order._id}</strong>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md={6}>
                    <p><strong>Date:</strong> {new Date(order.createdAt).toLocaleDateString()}</p>
                    <p>
                      <strong>Status:</strong>{' '}
                      <span className={`badge ${
                        order.status === 'Delivered' ? 'bg-success' : 
                        order.status === 'Cancelled' ? 'bg-danger' : 'bg-warning'
                      }`}>
                        {order.status}
                      </span>
                    </p>
                    <p><strong>Total:</strong> ${order.totalPrice?.toFixed(2)}</p>
                  </Col>
                  <Col md={6}>
                    <p>
                      <strong>Payment Status:</strong>{' '}
                      {order.isPaid ? (
                        <span className="text-success">Paid on {new Date(order.paidAt).toLocaleDateString()}</span>
                      ) : (
                        <>
                          <span className="text-danger">Not Paid</span>
                          <Button
                            variant="primary"
                            size="sm"
                            className="ms-2"
                            onClick={() => navigate(`/guest-payment/${order._id}`)}
                          >
                            Pay Now
                          </Button>
                        </>
                      )}
                    </p>
                    <p>
                      <strong>Delivery Status:</strong>{' '}
                      {order.isDelivered ? (
                        <span className="text-success">Delivered on {new Date(order.deliveredAt).toLocaleDateString()}</span>
                      ) : (
                        <span className="text-warning">Not Delivered</span>
                      )}
                    </p>
                  </Col>
                </Row>
                
                <ListGroup variant="flush" className="mt-3">
                  <ListGroup.Item>
                    <h5>Order Items:</h5>
                    {order.orderItems?.map((item, index) => (
                      <Row key={index} className="mb-2">
                        <Col md={6}>{item.name}</Col>
                        <Col md={6}>
                          {item.qty} x ${item.price?.toFixed(2)} = ${(item.qty * item.price).toFixed(2)}
                        </Col>
                      </Row>
                    ))}
                  </ListGroup.Item>
                </ListGroup>
              </Card.Body>
            </Card>
          ))}
        </div>
      )}
    </Container>
  );
};

export default OrderTrackingPage;