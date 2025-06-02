import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Card, Row, Col, Table } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaPlus, FaTimes } from 'react-icons/fa';
import { 
  getDeliveryRouteById, 
  createDeliveryRoute, 
  updateDeliveryRoute,
  getOrders,
  addOrderToRoute,
  getDrivers
} from '../services/api';

const DeliveryRouteEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;
  
  const [formData, setFormData] = useState({
    name: '',
    driver: '',
    vehicle: '',
    startLocation: '',
    date: '',
    status: 'Scheduled',
    notes: ''
  });
  
  const [availableOrders, setAvailableOrders] = useState([]);
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(isEditMode);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch available orders and drivers
        const [ordersData, driversData] = await Promise.all([
          getOrders(),
          getDrivers()
        ]);

        const availableOrdersData = ordersData
          .filter(order => !order.deliveryRoute && !order.isDelivered)
          .map(order => ({
            id: order._id,
            customer: `${order.user.name}`,
            address: `${order.shippingAddress.address}, ${order.shippingAddress.city}, ${order.shippingAddress.postalCode}`,
            items: order.orderItems.length
          }));
        
        setAvailableOrders(availableOrdersData);
        setDrivers(driversData);
        
        if (isEditMode) {
          // Fetch route data if in edit mode
          const routeData = await getDeliveryRouteById(id);
          
          setFormData({
            name: routeData.name,
            driver: routeData.driver._id,
            vehicle: routeData.vehicle,
            startLocation: routeData.startLocation,
            date: routeData.date ? routeData.date.split('T')[0] : '',
            status: routeData.status,
            notes: routeData.notes || ''
          });
          
          // Transform stops data to match the selected orders format
          const selectedOrdersData = routeData.stops.map(stop => ({
            id: stop.order._id,
            customer: stop.order.user?.name || 'Unknown',
            address: stop.address,
            items: stop.order.orderItems?.length || 0
          }));
          
          setSelectedOrders(selectedOrdersData);
          setLoading(false);
        }
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to load data');
        setLoading(false);
      }
    };

    fetchData();
  }, [id, isEditMode]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handleAddOrder = async (order) => {
    try {
      if (isEditMode) {
        // If in edit mode, use the addOrderToRoute API
        await addOrderToRoute(id, {
          orderId: order.id,
          address: order.address
        });
      }
      
      setSelectedOrders([...selectedOrders, order]);
      setAvailableOrders(availableOrders.filter(o => o.id !== order.id));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add order to route');
    }
  };
  
  const handleRemoveOrder = async (order) => {
    try {
      if (isEditMode) {
        // In edit mode, the order will be removed when we update the route
        // with the new stops list that excludes this order
        await updateDeliveryRoute(id, {
          ...formData,
          stops: selectedOrders
            .filter(o => o.id !== order.id)
            .map(o => ({
              order: o.id,
              address: o.address
            }))
        });
      }
      
      setAvailableOrders([...availableOrders, order]);
      setSelectedOrders(selectedOrders.filter(o => o.id !== order.id));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to remove order from route');
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name || !formData.driver || !formData.vehicle || !formData.startLocation || !formData.date) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    if (selectedOrders.length === 0) {
      toast.error('Please add at least one order to the route');
      return;
    }
    
    try {
      const routeData = {
        ...formData,
        stops: selectedOrders.map(order => ({
          order: order.id,
          address: order.address
        }))
      };

      if (isEditMode) {
        await updateDeliveryRoute(id, routeData);
        toast.success('Delivery route updated successfully');
      } else {
        await createDeliveryRoute(routeData);
        toast.success('Delivery route created successfully');
      }
      
      navigate('/delivery');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save delivery route');
    }
  };
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  return (
    <Container>
      <h1>{isEditMode ? 'Edit Delivery Route' : 'Create Delivery Route'}</h1>
      
      <Form onSubmit={handleSubmit}>
        <Row>
          <Col md={6}>
            <Card className="mb-4">
              <Card.Header>
                <h5 className="mb-0">Route Information</h5>
              </Card.Header>
              <Card.Body>
                <Form.Group className="mb-3">
                  <Form.Label>Route Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Driver</Form.Label>
                  <Form.Select
                    name="driver"
                    value={formData.driver}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select a driver</option>
                    {drivers.map(driver => (
                      <option key={driver._id} value={driver._id}>
                        {driver.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Vehicle</Form.Label>
                  <Form.Control
                    type="text"
                    name="vehicle"
                    value={formData.vehicle}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Start Location</Form.Label>
                  <Form.Control
                    type="text"
                    name="startLocation"
                    value={formData.startLocation}
                    onChange={handleChange}
                    required
                    placeholder="Enter start location"
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Date</Form.Label>
                  <Form.Control
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Status</Form.Label>
                  <Form.Select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                  >
                    <option value="Scheduled">Scheduled</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </Form.Select>
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Notes</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Card.Body>
            </Card>
          </Col>
          
          <Col md={6}>
            <Card className="mb-4">
              <Card.Header>
                <h5 className="mb-0">Selected Orders</h5>
              </Card.Header>
              <Card.Body>
                {selectedOrders.length === 0 ? (
                  <p className="text-muted">No orders selected</p>
                ) : (
                  <Table striped bordered hover>
                    <thead>
                      <tr>
                        <th>Order ID</th>
                        <th>Customer</th>
                        <th>Address</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrders.map(order => (
                        <tr key={order.id}>
                          <td>{order.id}</td>
                          <td>{order.customer}</td>
                          <td>{order.address}</td>
                          <td>
                            <Button 
                              variant="danger" 
                              size="sm"
                              onClick={() => handleRemoveOrder(order)}
                            >
                              <FaTimes /> Remove
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                )}
              </Card.Body>
            </Card>
            
            <Card>
              <Card.Header>
                <h5 className="mb-0">Available Orders</h5>
              </Card.Header>
              <Card.Body>
                {availableOrders.length === 0 ? (
                  <p className="text-muted">No available orders</p>
                ) : (
                  <Table striped bordered hover>
                    <thead>
                      <tr>
                        <th>Order ID</th>
                        <th>Customer</th>
                        <th>Address</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {availableOrders.map(order => (
                        <tr key={order.id}>
                          <td>{order.id}</td>
                          <td>{order.customer}</td>
                          <td>{order.address}</td>
                          <td>
                            <Button 
                              variant="success" 
                              size="sm"
                              onClick={() => handleAddOrder(order)}
                            >
                              <FaPlus /> Add
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
        
        <div className="d-flex gap-2 mt-4">
          <Button variant="primary" type="submit">
            {isEditMode ? 'Update Route' : 'Create Route'}
          </Button>
          <Button variant="secondary" onClick={() => navigate('/delivery')}>
            Cancel
          </Button>
        </div>
      </Form>
    </Container>
  );
};

export default DeliveryRouteEdit;
