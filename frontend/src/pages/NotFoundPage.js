import React from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import Meta from '../components/Meta';

const NotFoundPage = () => {
  return (
    <Container>
      <Meta title="Page Not Found" />
      <Row className="justify-content-center text-center py-5">
        <Col md={6}>
          <h1 className="display-1">404</h1>
          <h2>Page Not Found</h2>
          <p className="lead">
            The page you are looking for does not exist or has been moved.
          </p>
          <Link to="/">
            <Button variant="primary">Go to Homepage</Button>
          </Link>
        </Col>
      </Row>
    </Container>
  );
};

export default NotFoundPage;
