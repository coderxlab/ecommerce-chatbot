import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer>
      <Container>
        <Row>
          <Col md={4} className="mb-4">
            <h5>MedNow Shop</h5>
            <p>
              Your one-stop shop for all your medical and healthcare needs. We provide quality products at affordable prices.
            </p>
            <div className="social-icons">
              <a href="https://facebook.com" target="_blank" rel="noreferrer" className="me-3">
                <FaFacebook size={24} />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noreferrer" className="me-3">
                <FaTwitter size={24} />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="me-3">
                <FaInstagram size={24} />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noreferrer">
                <FaLinkedin size={24} />
              </a>
            </div>
          </Col>
          <Col md={2} className="mb-4">
            <h5>Quick Links</h5>
            <ul className="list-unstyled">
              <li>
                <Link to="/">Home</Link>
              </li>
              <li>
                <Link to="/products">Products</Link>
              </li>
              <li>
                <Link to="/cart">Cart</Link>
              </li>
              <li>
                <Link to="/login">Login</Link>
              </li>
            </ul>
          </Col>
          <Col md={3} className="mb-4">
            <h5>Customer Service</h5>
            <ul className="list-unstyled">
              <li>
                <Link to="/contact">Contact Us</Link>
              </li>
              <li>
                <Link to="/faq">FAQ</Link>
              </li>
              <li>
                <Link to="/shipping-policy">Shipping Policy</Link>
              </li>
              <li>
                <Link to="/return-policy">Return Policy</Link>
              </li>
            </ul>
          </Col>
          <Col md={3} className="mb-4">
            <h5>Contact Info</h5>
            <p>
              <strong>Address:</strong> 123 Healthcare Ave, Medical City, MC 12345
            </p>
            <p>
              <strong>Phone:</strong> (123) 456-7890
            </p>
            <p>
              <strong>Email:</strong> info@MedNow.com
            </p>
          </Col>
        </Row>
        <Row>
          <Col className="text-center py-3">
            <p>&copy; {new Date().getFullYear()} MedNow Shop. All Rights Reserved.</p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;
