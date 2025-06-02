import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout = () => {
  return (
    <Container fluid className="p-0" data-testid="layout">
      <Row className="g-0">
        <Col md={3} lg={2} className="sidebar">
          <Sidebar />
        </Col>
        <Col md={9} lg={10} className="main-content">
          <Header />
          <Outlet />
        </Col>
      </Row>
    </Container>
  );
};

export default Layout;
