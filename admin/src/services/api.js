import axios from 'axios';

// Configure axios with base URL from environment variable
export const api = axios.create({
  baseURL: process.env.REACT_APP_BACKEND_URL,
});

// Products API
export const getProducts = async (keyword = '', pageNumber = '') => {
  const { data } = await api.get(`/api/products?keyword=${keyword}&pageNumber=${pageNumber}`);
  return data;
};

export const getProductById = async (id) => {
  const { data } = await api.get(`/api/products/${id}`);
  return data;
};

export const createProduct = async (productData) => {
  const { data } = await api.post('/api/products', productData);
  return data;
};

export const updateProduct = async (id, productData) => {
  const { data } = await api.put(`/api/products/${id}`, productData);
  return data;
};

export const deleteProduct = async (id) => {
  const { data } = await api.delete(`/api/products/${id}`);
  return data;
};

// Users API
export const getUsers = async () => {
  const { data } = await api.get('/api/users');
  return data;
};

export const getDrivers = async () => {
  const { data } = await api.get('/api/users?role=driver');
  return data;
};

export const getUserById = async (id) => {
  const { data } = await api.get(`/api/users/${id}`);
  return data;
};

export const updateUser = async (id, userData) => {
  const { data } = await api.put(`/api/users/${id}`, userData);
  return data;
};

export const registerUser = async (userData) => {
  const { data } = await api.post('/api/users', userData);
  return data;
};

export const deleteUser = async (id) => {
  const { data } = await api.delete(`/api/users/${id}`);
  return data;
};

export const updateProfile = async (userData) => {
  const { data } = await api.put('/api/users/profile', userData);
  return data;
};

// Orders API
export const getOrders = async () => {
  const { data } = await api.get('/api/orders');
  return data;
};

export const getOrderById = async (id) => {
  const { data } = await api.get(`/api/orders/${id}`);
  return data;
};

export const updateOrderStatus = async (id, status) => {
  const { data } = await api.put(`/api/orders/${id}/status`, { status });
  return data;
};

export const updateOrderToDelivered = async (id) => {
  const { data } = await api.put(`/api/orders/${id}/deliver`);
  return data;
};

// Delivery Routes API
export const getDeliveryRoutes = async () => {
  const { data } = await api.get('/api/delivery/routes');
  return data;
};

export const getDeliveryRouteById = async (id) => {
  const { data } = await api.get(`/api/delivery/routes/${id}`);
  return data;
};

export const createDeliveryRoute = async (routeData) => {
  const { data } = await api.post('/api/delivery/routes', routeData);
  return data;
};

export const updateDeliveryRoute = async (id, routeData) => {
  const { data } = await api.put(`/api/delivery/routes/${id}`, routeData);
  return data;
};

export const deleteDeliveryRoute = async (id) => {
  const { data } = await api.delete(`/api/delivery/routes/${id}`);
  return data;
};

export const addOrderToRoute = async (routeId, orderData) => {
  const { data } = await api.put(`/api/delivery/routes/${routeId}/add-order`, orderData);
  return data;
};

// Upload API
export const uploadImage = async (formData) => {
  const config = {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  };
  const { data } = await api.post('/api/upload/cloudinary', formData, config);
  return data;
};

// Dashboard Data
export const getDashboardStats = async () => {
  // This would be a custom endpoint in a real application
  // For now, we'll simulate by fetching various data
  const [products, users, orders] = await Promise.all([
    getProducts(),
    getUsers(),
    getOrders(),
  ]);
  
  return {
    productCount: products.products.length,
    totalProducts: products.pages * 10, // Assuming 10 per page
    userCount: users.length,
    orderCount: orders.length,
    revenue: orders.reduce((acc, order) => acc + order.totalPrice, 0),
    pendingOrders: orders.filter(order => !order.isDelivered).length,
  };
};
