import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Row, Col, ListGroup, Image, Form, Button, Card, Container } from 'react-bootstrap';
import { FaTrash } from 'react-icons/fa';
import Message from '../components/Message';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import Meta from '../components/Meta';

const CartPage = () => {
  const { cartItems, addToCart, removeFromCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const checkoutHandler = () => {
    navigate('/shipping');
  };

  const guestCheckoutHandler = () => {
    navigate('/guest-order');
  };

  return (
    <Container>
      <Meta title="Shopping Cart" />
      <Row>
        <Col md={8}>
          <h1>Shopping Cart</h1>
          {cartItems.length === 0 ? (
            <Message>
              Your cart is empty <Link to="/products">Go Back</Link>
            </Message>
          ) : (
            <ListGroup variant="flush">
              {cartItems.map((item) => (
                <ListGroup.Item key={item.product} className="cart-item">
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
                    <Col md={3}>
                      <Link to={`/product/${item.product}`}>{item.name}</Link>
                    </Col>
                    <Col md={2}>${item.price.toFixed(2)}</Col>
                    <Col md={2}>
                      <Form.Control
                        as="select"
                        value={item.qty}
                        onChange={(e) =>
                          addToCart(item.product, Number(e.target.value))
                        }
                      >
                        {[...Array(item.countInStock).keys()].map((x) => (
                          <option key={x + 1} value={x + 1}>
                            {x + 1}
                          </option>
                        ))}
                      </Form.Control>
                    </Col>
                    <Col md={2}>
                      <Button
                        type="button"
                        variant="light"
                        onClick={() => removeFromCart(item.product)}
                      >
                        <FaTrash />
                      </Button>
                    </Col>
                  </Row>
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}
        </Col>
        <Col md={4}>
          <Card>
            <ListGroup variant="flush">
              <ListGroup.Item>
                <h2>
                  Subtotal ({cartItems.reduce((acc, item) => acc + item.qty, 0)})
                  items
                </h2>
                $
                {cartItems
                  .reduce((acc, item) => acc + item.qty * item.price, 0)
                  .toFixed(2)}
              </ListGroup.Item>
              <ListGroup.Item>
                {user ? (
                  <Button
                    type="button"
                    className="btn-block w-100"
                    disabled={cartItems.length === 0}
                    onClick={checkoutHandler}
                  >
                    Proceed To Checkout
                  </Button>
                ) : (
                  <>
                    <Button
                      type="button"
                      className="btn-block w-100 mb-2"
                      disabled={cartItems.length === 0}
                      onClick={() => navigate('/login?redirect=shipping')}
                    >
                      Sign In & Checkout
                    </Button>
                    <Button
                      type="button"
                      className="btn-block w-100"
                      variant="secondary"
                      disabled={cartItems.length === 0}
                      onClick={guestCheckoutHandler}
                    >
                      Guest Checkout
                    </Button>
                  </>
                )}
              </ListGroup.Item>
            </ListGroup>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default CartPage;