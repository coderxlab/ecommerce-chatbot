import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Form, Button, Col, Card, ListGroup, Row } from 'react-bootstrap';
import { toast } from 'react-toastify';
import Message from '../components/Message';
import Loader from '../components/Loader';
import Meta from '../components/Meta';
import { getOrdersByOrderId, updateOrderPayment, updateGuestShippingAddress } from '../services/api';

const GuestPaymentPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [order, setOrder] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('PayPal');
  const [shippingAddress, setShippingAddress] = useState({
    address: '',
    city: '',
    postalCode: '',
    country: '',
  });
  const [isAddressValid, setIsAddressValid] = useState(false);

  useEffect(() => {
    const fetchOrder = async (orderId) => {
      try {
        const data = await getOrdersByOrderId(orderId);
        if (data && data.length > 0){
          const orderData = data[0]
          if (orderData.isPaid) {
            toast.info('This order has already been paid');
            navigate('/track-orders');
            return;
          }
          setOrder(orderData);
          if (orderData.shippingAddress) {
            setShippingAddress(orderData.shippingAddress);
            setIsAddressValid(true);
          }
        } else throw new Error('Order not found');
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch order details');
      } finally {
        setLoading(false);
      }
    };
    if (orderId) {
      fetchOrder(orderId);
    }

  }, [orderId, navigate]);

  useEffect(() => {
    const validateAddress = () => {
      const { address, city, postalCode, country } = shippingAddress;
      setIsAddressValid(address && city && postalCode && country);
    };
    validateAddress();
  }, [shippingAddress]);

  const handleShippingSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await updateGuestShippingAddress(orderId, shippingAddress);
      toast.success('Shipping address updated successfully!');
      setIsAddressValid(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update shipping address');
      toast.error('Failed to update shipping address');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    if (!isAddressValid) {
      toast.error('Please fill in and save shipping address first');
      return;
    }
    try {
      setLoading(true);
      await updateOrderPayment(orderId, { paymentMethod });
      toast.success('Payment processed successfully!');
      navigate('/track-orders');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to process payment');
      toast.error('Failed to process payment');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader />;
  if (error) return <Message variant="danger">{error}</Message>;
  if (!order) return <Message>Order not found</Message>;

  return (
    <Container>
      <Meta title="Guest Payment" />
      <h1 className="my-4">Payment for Order #{orderId}</h1>
      
      <Row>
        <Col md={8}>
          <Card className="mb-4">
            <Card.Body>
              <h2>Order Details</h2>
              <ListGroup variant="flush">
                <ListGroup.Item>
                  <Row>
                    <Col md={4}><strong>Order Total:</strong></Col>
                    <Col md={8}>${order.totalPrice?.toFixed(2)}</Col>
                  </Row>
                </ListGroup.Item>
                <ListGroup.Item>
                  <Row>
                    <Col md={4}><strong>Order Status:</strong></Col>
                    <Col md={8}>{order.status}</Col>
                  </Row>
                </ListGroup.Item>
                <ListGroup.Item>
                  <Row>
                    <Col md={4}><strong>Order Date:</strong></Col>
                    <Col md={8}>{new Date(order.createdAt).toLocaleDateString()}</Col>
                  </Row>
                </ListGroup.Item>
              </ListGroup>
            </Card.Body>
          </Card>

          <Card className="mb-4">
            <Card.Body>
              <h2>Shipping Address</h2>
              <Form onSubmit={handleShippingSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Address</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter address"
                    value={shippingAddress.address}
                    onChange={(e) => setShippingAddress({...shippingAddress, address: e.target.value})}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>City</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter city"
                    value={shippingAddress.city}
                    onChange={(e) => setShippingAddress({...shippingAddress, city: e.target.value})}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Postal Code</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter postal code"
                    value={shippingAddress.postalCode}
                    onChange={(e) => setShippingAddress({...shippingAddress, postalCode: e.target.value})}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Country</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter country"
                    value={shippingAddress.country}
                    onChange={(e) => setShippingAddress({...shippingAddress, country: e.target.value})}
                    required
                  />
                </Form.Group>

                <Button type="submit" variant="primary" className="w-100" disabled={loading}>
                  {loading ? 'Saving...' : 'Save Shipping Address'}
                </Button>
              </Form>
            </Card.Body>
          </Card>

          <Card>
            <Card.Body>
              <h2>Payment Method</h2>
              <Form onSubmit={handlePaymentSubmit}>
                <Form.Group>
                  <Form.Label as="legend">Select Method</Form.Label>
                  <Col>
                    <Form.Check
                      type="radio"
                      label="PayPal or Credit Card"
                      id="PayPal"
                      name="paymentMethod"
                      value="PayPal"
                      checked={paymentMethod === 'PayPal'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="mb-2"
                    />
                    <Form.Check
                      type="radio"
                      label="Stripe"
                      id="Stripe"
                      name="paymentMethod"
                      value="Stripe"
                      checked={paymentMethod === 'Stripe'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="mb-2"
                    />
                    <Form.Check
                      type="radio"
                      label="Cash on Delivery"
                      id="CashOnDelivery"
                      name="paymentMethod"
                      value="Cash on Delivery"
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="mb-2"
                    />

                  </Col>
                </Form.Group>

                <Button 
                  type="submit" 
                  variant="primary" 
                  className="mt-3 w-100" 
                  disabled={loading || !isAddressValid}
                >
                  {loading ? 'Processing...' : isAddressValid ? 'Process Payment' : 'Fill Shipping Address First'}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card>
            <Card.Body>
              <h2>Order Summary</h2>
              <ListGroup variant="flush">
                {order.orderItems?.map((item, index) => (
                  <ListGroup.Item key={index}>
                    <Row>
                      <Col>{item.name}</Col>
                      <Col className="text-end">
                        {item.qty} x ${item.price?.toFixed(2)} = ${(item.qty * item.price).toFixed(2)}
                      </Col>
                    </Row>
                  </ListGroup.Item>
                ))}
                <ListGroup.Item>
                  <Row>
                    <Col>Items Price:</Col>
                    <Col className="text-end">${order.itemsPrice?.toFixed(2)}</Col>
                  </Row>
                </ListGroup.Item>
                <ListGroup.Item>
                  <Row>
                    <Col>Shipping:</Col>
                    <Col className="text-end">${order.shippingPrice?.toFixed(2)}</Col>
                  </Row>
                </ListGroup.Item>
                <ListGroup.Item>
                  <Row>
                    <Col>Tax:</Col>
                    <Col className="text-end">${order.taxPrice?.toFixed(2)}</Col>
                  </Row>
                </ListGroup.Item>
                <ListGroup.Item>
                  <Row>
                    <Col><strong>Total:</strong></Col>
                    <Col className="text-end"><strong>${order.totalPrice?.toFixed(2)}</strong></Col>
                  </Row>
                </ListGroup.Item>
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default GuestPaymentPage;