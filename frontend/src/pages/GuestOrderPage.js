import React, { useState, useEffect } from 'react';
import { Button, Row, Col, ListGroup, Image, Card, Container, Form } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import CheckoutSteps from '../components/CheckoutSteps';
import Message from '../components/Message';
import Loader from '../components/Loader';
import { useCart } from '../context/CartContext';
import { createGuestOrder, createDraftOrder } from '../services/api';
import Meta from '../components/Meta';

const GuestOrderPage = () => {
  const navigate = useNavigate();
  const { cartItems, shippingAddress, paymentMethod, clearCart, itemsPrice, shippingPrice, taxPrice, totalPrice, isDraft } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const placeOrderHandler = async () => {
    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address');
      return;
    }
    setEmailError('');

    try {
      setLoading(true);
      setError('');
      
      const order = {
        orderItems: cartItems,
        shippingAddress,
        paymentMethod,
        itemsPrice: Number(itemsPrice),
        shippingPrice: Number(shippingPrice),
        taxPrice: Number(taxPrice),
        totalPrice: Number(totalPrice),
        email,
        isDraft,
      };
      
      const data = isDraft 
        ? await createDraftOrder(order)
        : await createGuestOrder(order);
      
      // Clear cart after successful order
      clearCart();
      
      // Redirect to order tracking page
      navigate(`/track-order?orderId=${data._id}`);
      
      const message = isDraft 
        ? 'Draft order saved successfully! Check your email for order details.'
        : 'Order placed successfully! Check your email for order details.';
      toast.success(message);
    } catch (err) {
      setError(err.message || 'Failed to place order');
      toast.error(err.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Meta title="Guest Order" />
      <CheckoutSteps step1 step2 step3 step4 />
      <Row>
        <Col md={8}>
          <ListGroup variant="flush">
            <ListGroup.Item>
              <h2>Guest Order</h2>
              <Form.Group controlId='email' className='my-3'>
                <Form.Label>Email Address</Form.Label>
                <Form.Control
                  type='email'
                  placeholder='Enter email'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  isInvalid={!!emailError}
                />
                {emailError && (
                  <Form.Control.Feedback type='invalid'>
                    {emailError}
                  </Form.Control.Feedback>
                )}
                <Form.Text className="text-muted">
                  We'll send your order confirmation and tracking details to this email.
                </Form.Text>
              </Form.Group>
            </ListGroup.Item>

            <ListGroup.Item>
              <h2>Shipping</h2>
              {shippingAddress?.address && (<p>
                <strong>Address:</strong>
                {shippingAddress.address}, {shippingAddress.city}{' '}
                {shippingAddress.postalCode}, {shippingAddress.country}
              </p>)}
              {
                !shippingAddress?.address && (
                  <Button variant="primary" onClick={() => navigate('/shipping')}>
                    Add Shipping Address
                  </Button>
                )
              }

            </ListGroup.Item>

            <ListGroup.Item>
              <h2>Payment Method</h2>
              <p>
                <strong>Method: </strong>
                {paymentMethod}
              </p>
              <Button variant="primary" onClick={() => navigate('/payment')}>
                Update Payment Method
              </Button>
            </ListGroup.Item>

            <ListGroup.Item>
              <h2>Order Items</h2>
              {cartItems.length === 0 ? (
                <Message>Your cart is empty</Message>
              ) : (
                <ListGroup variant="flush">
                  {cartItems.map((item, index) => (
                    <ListGroup.Item key={index}>
                      <Row className="align-items-center">
                        <Col md={2}>
                          <Image
                            src={item.image}
                            alt={item.name}
                            fluid
                            rounded
                            className="cart-item-img"
                          />
                        </Col>
                        <Col>
                          <Link to={`/product/${item.product}`}>
                            {item.name}
                          </Link>
                        </Col>
                        <Col md={4}>
                          {item.qty} x ${item.price.toFixed(2)} = ${(item.qty * item.price).toFixed(2)}
                        </Col>
                      </Row>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              )}
            </ListGroup.Item>
          </ListGroup>
        </Col>
        <Col md={4}>
          <Card className="order-summary">
            <ListGroup variant="flush">
              <ListGroup.Item>
                <h2>Order Summary</h2>
              </ListGroup.Item>
              <ListGroup.Item>
                <Row>
                  <Col>Items</Col>
                  <Col>${itemsPrice.toFixed(2)}</Col>
                </Row>
              </ListGroup.Item>
              <ListGroup.Item>
                <Row>
                  <Col>Shipping</Col>
                  <Col>${shippingPrice.toFixed(2)}</Col>
                </Row>
              </ListGroup.Item>
              <ListGroup.Item>
                <Row>
                  <Col>Tax</Col>
                  <Col>${taxPrice.toFixed(2)}</Col>
                </Row>
              </ListGroup.Item>
              <ListGroup.Item>
                <Row>
                  <Col>Total</Col>
                  <Col>${totalPrice}</Col>
                </Row>
              </ListGroup.Item>
              <ListGroup.Item>
                <small className="text-muted d-block mb-3">
                  {isDraft ? 'Shipping address and payment method are required to place a complete order' : 'Your order is ready to be placed'}
                </small>
              </ListGroup.Item>
              {error && (
                <ListGroup.Item>
                  <Message variant="danger">{error}</Message>
                </ListGroup.Item>
              )}
              <ListGroup.Item>
                <Button
                  type="button"
                  className="btn-block w-100"
                  disabled={cartItems.length === 0 || loading}
                  onClick={placeOrderHandler}
                >
                  {isDraft ? 'Place Draft Order' : 'Place Order'}
                </Button>
                {loading && <Loader />}
              </ListGroup.Item>
            </ListGroup>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default GuestOrderPage;