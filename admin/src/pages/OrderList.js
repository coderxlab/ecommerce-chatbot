import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Table, Badge, Form, InputGroup } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaEye, FaSearch } from 'react-icons/fa';
import { getOrders } from '../services/api';
import Message from '../components/Message';
import Loader from '../components/Loader';

const OrderList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const data = await getOrders();
        setOrders(data);
        setError(null);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch orders');
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrders();
  }, []);
  
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Delivered':
        return <Badge bg="success">Delivered</Badge>;
      case 'Shipped':
        return <Badge bg="info">Shipped</Badge>;
      case 'Processing':
        return <Badge bg="warning">Processing</Badge>;
      case 'Pending':
        return <Badge bg="secondary">Pending</Badge>;
      default:
        return <Badge bg="dark">{status}</Badge>;
    }
  };
  
  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      (order.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
       order.guestEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       order._id.toString().includes(searchTerm));
    
    const matchesStatus = filterStatus ? order.status === filterStatus : true;
    
    return matchesSearch && matchesStatus;
  });
  
  return (
    <Container fluid>
      <Row className="align-items-center mb-3">
        <Col>
          <h1>Orders</h1>
        </Col>
      </Row>
      
      <Row className="mb-3">
        <Col md={6}>
          <InputGroup>
            <InputGroup.Text>
              <FaSearch />
            </InputGroup.Text>
            <Form.Control
              type="text"
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
        </Col>
        <Col md={6}>
          <Form.Select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Processing">Processing</option>
            <option value="Shipped">Shipped</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </Form.Select>
        </Col>
      </Row>
      
      {error && <Message variant="danger">{error}</Message>}
      
      {loading ? (
        <Loader />
      ) : (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>ID</th>
              <th>Customer</th>
              <th>Date</th>
              <th>Items</th>
              <th>Total</th>
              <th>Payment</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map(order => (
              <tr key={order._id}>
                <td>{order._id}</td>
                <td>{order.user?.name || order.guestEmail || 'Guest'}</td>
                <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                <td>{order.orderItems.length}</td>
                <td>${order.totalPrice.toFixed(2)}</td>
                <td>
                  {order.isPaid ? (
                    <Badge bg="success">Paid</Badge>
                  ) : (
                    <Badge bg="warning">Pending</Badge>
                  )}
                </td>
                <td>{getStatusBadge(order.status || (order.isDelivered ? 'Delivered' : 'Processing'))}</td>
                <td>
                  <Link to={`/orders/${order._id}`} className="btn btn-sm btn-info">
                    <FaEye /> View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Container>
  );
};

export default OrderList;
