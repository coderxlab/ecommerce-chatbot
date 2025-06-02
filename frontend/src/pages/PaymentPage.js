import React, { useState } from 'react';
import { Form, Button, Col, Container } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import CheckoutSteps from '../components/CheckoutSteps';
import Meta from '../components/Meta';
import { useAuth } from '../context/AuthContext';

const PaymentPage = () => {
  const { savePaymentMethod, shippingAddress } = useCart();
  const { user } = useAuth()
  const navigate = useNavigate();

  if (!shippingAddress.address) {
    navigate('/shipping');
  }

  const [paymentMethod, setPaymentMethod] = useState('PayPal');

  const submitHandler = (e) => {
    e.preventDefault();
    savePaymentMethod(paymentMethod);
    navigate(user ? '/placeorder' : '/guest-order');
  };

  return (
    <Container>
      <Meta title="Payment Method" />
      <CheckoutSteps step1 step2 step3 />
      <div className="form-container">
        <h1>Payment Method</h1>
        <Form onSubmit={submitHandler}>
          <Form.Group>
            <Form.Label as="legend">Select Method</Form.Label>
            <Col>
              <Form.Check
                type="radio"
                label="PayPal or Credit Card"
                id="PayPal"
                name="paymentMethod"
                value="PayPal"
                checked
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="mb-2"
              />
              <Form.Check
                type="radio"
                label="Stripe"
                id="Stripe"
                name="paymentMethod"
                value="Stripe"
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

          <Button type="submit" variant="primary" className="mt-3 w-100">
            Continue
          </Button>
        </Form>
      </div>
    </Container>
  );
};

export default PaymentPage;
