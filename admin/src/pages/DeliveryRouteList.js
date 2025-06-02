import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Table, Badge, Button, Form, InputGroup, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaEdit, FaEye, FaPlus, FaSearch } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { getDeliveryRoutes } from '../services/api';

const DeliveryRouteList = () => {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getDeliveryRoutes();
        setRoutes(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch delivery routes');
        toast.error('Failed to fetch delivery routes');
      } finally {
        setLoading(false);
      }
    };

    fetchRoutes();
  }, []);
  
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Completed':
        return <Badge bg="success">Completed</Badge>;
      case 'In Progress':
        return <Badge bg="info">In Progress</Badge>;
      case 'Scheduled':
        return <Badge bg="warning">Scheduled</Badge>;
      default:
        return <Badge bg="dark">{status}</Badge>;
    }
  };
  
  const filteredRoutes = routes.filter(route => {
    const matchesSearch = 
      route.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      route.driver.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus ? route.status === filterStatus : true;
    
    return matchesSearch && matchesStatus;
  });
  
  return (
    <Container fluid>
      <Row className="align-items-center mb-3">
        <Col>
          <h1>Delivery Routes</h1>
        </Col>
        <Col className="text-end">
          <Link to="/delivery/new" className="btn btn-primary">
            <FaPlus /> New Route
          </Link>
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
              placeholder="Search routes..."
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
            <option value="Scheduled">Scheduled</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </Form.Select>
        </Col>
      </Row>
      
      {error && (
        <Alert variant="danger" className="my-3">
          {error}
        </Alert>
      )}
      
      {loading ? (
        <div className="text-center py-4">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>ID</th>
              <th>Route Name</th>
              <th>Driver</th>
              <th>Vehicle</th>
              <th>Date</th>
              <th>Orders</th>
              <th>Est. Time</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredRoutes.map(route => (
              <tr key={route._id}>
                <td>{route._id}</td>
                <td>{route.name}</td>
                <td>{route.driver.name}</td>
                <td>{route.vehicle}</td>
                <td>{new Date(route.createdAt).toLocaleDateString()}</td>
                <td>{route.stops.length}</td>
                <td>N/A</td>
                <td>{getStatusBadge(route.status)}</td>
                <td>
                  <div className="d-flex gap-2">
                    <Link to={`/delivery/${route._id}/edit`} className="btn btn-sm btn-primary">
                      <FaEdit /> Edit
                    </Link>
                    <Button 
                      variant="info" 
                      size="sm"
                      onClick={() => toast.info('View route details functionality coming soon!')}
                    >
                      <FaEye /> View
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Container>
  );
};

export default DeliveryRouteList;
