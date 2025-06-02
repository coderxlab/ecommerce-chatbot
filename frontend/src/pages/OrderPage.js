import React, { useState, useEffect } from 'react';
import { Row, Col, ListGroup, Image, Card, Button, Container } from 'react-bootstrap';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getOrderById, payOrder, cancelOrder } from '../services/api';
import Loader from '../components/Loader';
import Message from '../components/Message';
import { useAuth } from '../context/AuthContext';
import Meta from '../components/Meta';

const OrderPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const data = await getOrderById(id);
        setOrder(data);
      } catch (err) {
        setError('Failed to load order details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  const successPaymentHandler = async (paymentResult) => {
    try {
      setPaymentLoading(true);
      await payOrder(id, paymentResult);
      
      // Refresh order data
      const updatedOrder = await getOrderById(id);
      setOrder(updatedOrder);
      
      toast.success('Payment successful');
    } catch (err) {
      toast.error(err.message || 'Payment failed');
    } finally {
      setPaymentLoading(false);
    }
  };

  const cancelOrderHandler = async () => {
    if (window.confirm('Are you sure you want to cancel this order?')) {
      try {
        setCancelLoading(true);
        await cancelOrder(id);
        
        // Refresh order data
        const updatedOrder = await getOrderById(id);
        setOrder(updatedOrder);
        
        toast.success('Order cancelled successfully');
      } catch (err) {
        toast.error(err.message || 'Failed to cancel order');
      } finally {
        setCancelLoading(false);
      }
    }
  };

  // Mock payment for demo purposes
  const mockPaymentHandler = () => {
    const paymentResult = {
      id: Math.random().toString(36).substring(2, 15),
      status: 'COMPLETED',
      update_time: new Date().toISOString(),
      payer: { email_address: user.email },
    };
    
    successPaymentHandler(paymentResult);
  };
  console.log(order)
  if (loading) return <Loader />;
  if (error) return <Message variant="danger">{error}</Message>;

  return (
    <Container>
      <Meta title={`Order ${order._id}`} />
      <h1>Order {order._id}</h1>
      <Row>
        <Col md={8}>
          <ListGroup variant="flush">
            <ListGroup.Item>
              <h2>Shipping</h2>
              <p>
                <strong>Name: </strong> {order.user.name}
              </p>
              <p>
                <strong>Email: </strong>{' '}
                <a href={`mailto:${order.user.email}`}>{order.user.email}</a>
              </p>
              <p>
                <strong>Address: </strong>
                {order.shippingAddress.address}, {order.shippingAddress.city}{' '}
                {order.shippingAddress.postalCode},{' '}
                {order.shippingAddress.country}
              </p>
              {order.isDelivered ? (
                <Message variant="success">
                  Delivered on {new Date(order.deliveredAt).toLocaleDateString()}
                </Message>
              ) : (
                <Message variant="danger">Not Delivered</Message>
              )}
            </ListGroup.Item>

            <ListGroup.Item>
              <h2>Payment Method</h2>
              <p>
                <strong>Method: </strong>
                {order.paymentMethod}
              </p>
              {order.isPaid ? (
                <Message variant="success">
                  Paid on {new Date(order.paidAt).toLocaleDateString()}
                </Message>
              ) : (
                <Message variant="danger">Not Paid</Message>
              )}
            </ListGroup.Item>

            <ListGroup.Item>
              <h2>Order Status</h2>
              <p>
                <strong>Status: </strong>
                <span className={`badge ${order.status === 'Delivered' ? 'bg-success' : order.status === 'Cancelled' ? 'bg-danger' : 'bg-warning'}`}>
                  {order.status}
                </span>
              </p>
            </ListGroup.Item>

            <ListGroup.Item>
              <h2>Order Items</h2>
              {order.orderItems.length === 0 ? (
                <Message>Order is empty</Message>
              ) : (
                <ListGroup variant="flush">
                  {order.orderItems.map((item, index) => (
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
                          {item.qty} x ${item.price?.toFixed(2)} = ${(item.qty * item.price)?.toFixed(2)}
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
                  <Col>${order.itemsPrice?.toFixed(2)}</Col>
                </Row>
              </ListGroup.Item>
              <ListGroup.Item>
                <Row>
                  <Col>Shipping</Col>
                  <Col>${order.shippingPrice?.toFixed(2)}</Col>
                </Row>
              </ListGroup.Item>
              <ListGroup.Item>
                <Row>
                  <Col>Tax</Col>
                  <Col>${order.taxPrice?.toFixed(2)}</Col>
                </Row>
              </ListGroup.Item>
              <ListGroup.Item>
                <Row>
                  <Col>Total</Col>
                  <Col>${order.totalPrice?.toFixed(2)}</Col>
                </Row>
              </ListGroup.Item>
              
              {!order.isPaid && order.status !== 'Cancelled' && (
                <ListGroup.Item>
                  {paymentLoading && <Loader />}
                  <Button
                    type="button"
                    className="btn-block w-100 mb-2"
                    onClick={mockPaymentHandler}
                    disabled={paymentLoading}
                  >
                    Pay Now (Demo)
                  </Button>
                </ListGroup.Item>
              )}
              
              {!order.isDelivered && order.status !== 'Cancelled' && (
                <ListGroup.Item>
                  {cancelLoading && <Loader />}
                  <Button
                    type="button"
                    className="btn-block w-100"
                    variant="danger"
                    onClick={cancelOrderHandler}
                    disabled={cancelLoading}
                  >
                    Cancel Order
                  </Button>
                </ListGroup.Item>
              )}
            </ListGroup>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default OrderPage;
