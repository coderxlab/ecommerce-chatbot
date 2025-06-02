const API = require('./axiosConfig').default;

// Products API
const getProducts = async (keyword = '', pageNumber = '') => {
  const { data } = await API.get(`/api/products?keyword=${keyword}&pageNumber=${pageNumber}`);
  return data;
};

const getProductById = async (id) => {
  const { data } = await API.get(`/api/products/${id}`);
  return data;
};

const getTopProducts = async () => {
  const { data } = await API.get('/api/products/top');
  return data;
};

const createProductReview = async (productId, review) => {
  const { data } = await API.post(`/api/products/${productId}/reviews`, review);
  return data;
};

// Orders API
const createOrder = async (order) => {
  const { data } = await API.post('/api/orders', order);
  return data;
};

const createGuestOrder = async (order) => {
  const { data } = await API.post('/api/orders/guest', order);
  return data;
};

const createDraftOrder = async (order) => {
  const { data } = await API.post('/api/orders/draft', order);
  return data;
};

const getOrderById = async (id) => {
  const { data } = await API.get(`/api/orders/${id}`);
  return data;
};

const getOrdersByEmail = async (email) => {
  const { data } = await API.get(`/api/orders/track?email=${email}`);
  return data;
};
const getOrdersByOrderId = async (orderId) => {
  const { data } = await API.get(`/api/orders/track?orderId=${orderId}`);
  return data;
};

const payOrder = async (orderId, paymentResult) => {
  const { data } = await API.put(`/api/orders/${orderId}/pay`, paymentResult);
  return data;
};

const updateOrderPayment = async (orderId, paymentInfo) => {
  const { data } = await API.put(`/api/orders/${orderId}/payment`, paymentInfo);
  return data;
};

const getMyOrders = async () => {
  const { data } = await API.get('/api/orders/myorders');
  return data;
};

const cancelOrder = async (orderId) => {
  const { data } = await API.put(`/api/orders/${orderId}/cancel`);
  return data;
};

// User API
const getUserProfile = async () => {
  const { data } = await API.get('/api/users/profile');
  return data;
};

const updateUserProfile = async (user) => {
  const { data } = await API.put('/api/users/profile', user);
  return data;
};

const updateGuestShippingAddress = async (orderId, shippingAddress) => {
  const { data } = await API.put(`/api/orders/${orderId}/shipping`, shippingAddress);
  return data;
};

module.exports = {
  getProducts,
  getProductById,
  getTopProducts,
  createProductReview,
  createOrder,
  createGuestOrder,
  createDraftOrder,
  getOrderById,
  getOrdersByEmail,
  getOrdersByOrderId,
  payOrder,
  getMyOrders,
  cancelOrder,
  getUserProfile,
  updateUserProfile,
  updateOrderPayment,
  updateGuestShippingAddress,
};