import React from 'react';
import { Nav } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';

const CheckoutSteps = ({ step1, step2, step3, step4 }) => {
  return (
    <Nav className="checkout-steps mb-4">
      <Nav.Item>
        {step1 ? (
          <LinkContainer to="/login">
            <Nav.Link className="checkout-step active">Sign In</Nav.Link>
          </LinkContainer>
        ) : (
          <Nav.Link className="checkout-step" disabled>
            Sign In
          </Nav.Link>
        )}
      </Nav.Item>

      <Nav.Item>
        {step2 ? (
          <LinkContainer to="/shipping">
            <Nav.Link className="checkout-step active">Shipping</Nav.Link>
          </LinkContainer>
        ) : (
          <Nav.Link className="checkout-step" disabled>
            Shipping
          </Nav.Link>
        )}
      </Nav.Item>

      <Nav.Item>
        {step3 ? (
          <LinkContainer to="/payment">
            <Nav.Link className="checkout-step active">Payment</Nav.Link>
          </LinkContainer>
        ) : (
          <Nav.Link className="checkout-step" disabled>
            Payment
          </Nav.Link>
        )}
      </Nav.Item>

      <Nav.Item>
        {step4 ? (
          <LinkContainer to="/placeorder">
            <Nav.Link className="checkout-step active">Place Order</Nav.Link>
          </LinkContainer>
        ) : (
          <Nav.Link className="checkout-step" disabled>
            Place Order
          </Nav.Link>
        )}
      </Nav.Item>
    </Nav>
  );
};

export default CheckoutSteps;
