import React, { useState, useEffect } from 'react';
import { Row, Col, Card } from 'react-bootstrap';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { getDashboardStats, getOrders } from '../services/api';
import Loader from '../components/Loader';
import Message from '../components/Message';
import { FaBox, FaUsers, FaShoppingCart, FaDollarSign } from 'react-icons/fa';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const statsData = await getDashboardStats();
        const ordersData = await getOrders();
        
        setStats(statsData);
        setOrders(ordersData);
      } catch (err) {
        setError('Failed to load dashboard data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Prepare data for charts
  const prepareOrdersChartData = () => {
    // Group orders by date
    const last7Days = [...Array(7)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0];
    }).reverse();

    const ordersByDate = orders.reduce((acc, order) => {
      const date = new Date(order.createdAt).toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});

    const orderData = last7Days.map(date => ordersByDate[date] || 0);

    return {
      labels: last7Days,
      datasets: [
        {
          label: 'Orders',
          data: orderData,
          fill: false,
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          borderColor: 'rgba(75, 192, 192, 1)',
          tension: 0.1,
        },
      ],
    };
  };

  const prepareRevenueChartData = () => {
    // Group revenue by date
    const last7Days = [...Array(7)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0];
    }).reverse();

    const revenueByDate = orders.reduce((acc, order) => {
      const date = new Date(order.createdAt).toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + order.totalPrice;
      return acc;
    }, {});

    const revenueData = last7Days.map(date => revenueByDate[date] || 0);

    return {
      labels: last7Days,
      datasets: [
        {
          label: 'Revenue ($)',
          data: revenueData,
          backgroundColor: 'rgba(54, 162, 235, 0.5)',
        },
      ],
    };
  };

  if (loading) return <Loader />;
  if (error) return <Message variant="danger">{error}</Message>;

  return (
    <div>
      <h1 className="mb-4">Dashboard</h1>
      
      <div className="dashboard-stats">
        <Card className="stat-card bg-primary text-white">
          <Card.Body>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h3>{stats?.productCount || 0}</h3>
                <Card.Text>Products</Card.Text>
              </div>
              <FaBox size={30} />
            </div>
          </Card.Body>
        </Card>
        
        <Card className="stat-card bg-success text-white">
          <Card.Body>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h3>{stats?.userCount || 0}</h3>
                <Card.Text>Users</Card.Text>
              </div>
              <FaUsers size={30} />
            </div>
          </Card.Body>
        </Card>
        
        <Card className="stat-card bg-warning text-white">
          <Card.Body>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h3>{stats?.orderCount || 0}</h3>
                <Card.Text>Orders</Card.Text>
              </div>
              <FaShoppingCart size={30} />
            </div>
          </Card.Body>
        </Card>
        
        <Card className="stat-card bg-info text-white">
          <Card.Body>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h3>${stats?.revenue?.toFixed(2) || 0}</h3>
                <Card.Text>Revenue</Card.Text>
              </div>
              <FaDollarSign size={30} />
            </div>
          </Card.Body>
        </Card>
      </div>
      
      <Row>
        <Col md={6}>
          <div className="chart-container">
            <h4>Orders (Last 7 Days)</h4>
            <Line 
              data={prepareOrdersChartData()} 
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: 'top',
                  },
                },
              }}
            />
          </div>
        </Col>
        <Col md={6}>
          <div className="chart-container">
            <h4>Revenue (Last 7 Days)</h4>
            <Bar 
              data={prepareRevenueChartData()} 
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: 'top',
                  },
                },
              }}
            />
          </div>
        </Col>
      </Row>
      
      <Row>
        <Col md={6}>
          <Card>
            <Card.Header>
              <h5>Recent Orders</h5>
            </Card.Header>
            <Card.Body>
              <div className="table-responsive">
                <table className="table table-striped">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Date</th>
                      <th>Total</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.slice(0, 5).map((order) => (
                      <tr key={order._id}>
                        <td>{order._id.substring(0, 8)}...</td>
                        <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                        <td>${order.totalPrice.toFixed(2)}</td>
                        <td>
                          <span className={`badge ${order.isDelivered ? 'bg-success' : 'bg-warning'}`}>
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card>
            <Card.Header>
              <h5>Order Status</h5>
            </Card.Header>
            <Card.Body>
              <div className="d-flex justify-content-around text-center">
                <div>
                  <h4>{orders.filter(o => o.status === 'Processing').length}</h4>
                  <p>Processing</p>
                </div>
                <div>
                  <h4>{orders.filter(o => o.status === 'Shipped').length}</h4>
                  <p>Shipped</p>
                </div>
                <div>
                  <h4>{orders.filter(o => o.status === 'Delivered').length}</h4>
                  <p>Delivered</p>
                </div>
                <div>
                  <h4>{orders.filter(o => o.status === 'Cancelled').length}</h4>
                  <p>Cancelled</p>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
