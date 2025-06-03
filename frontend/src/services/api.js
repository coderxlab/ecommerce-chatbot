const API = require('./axiosConfig').default;

// Products API
const getProducts = async (keyword = '', pageNumber = '') => {
  const { data } = await API.get(`/products?keyword=${keyword}&pageNumber=${pageNumber}`);
  return data;
};

const getProductById = async (id) => {
  const { data } = await API.get(`/products/${id}`);
  return data;
};

const getTopProducts = async () => {
  const { data } = await API.get('/products/top');
  return data;
};

const createProductReview = async (productId, review) => {
  const { data } = await API.post(`/products/${productId}/reviews`, review);
  return data;
};

// Orders API
const createOrder = async (order) => {
  const { data } = await API.post('/orders', order);
  return data;
};

const createGuestOrder = async (order) => {
  const { data } = await API.post('/orders/guest', order);
  return data;
};

const createDraftOrder = async (order) => {
  const { data } = await API.post('/orders/draft', order);
  return data;
};

const getOrderById = async (id) => {
  const { data } = await API.get(`/orders/${id}`);
  return data;
};

const getOrdersByEmail = async (email) => {
  const { data } = await API.get(`/orders/track?email=${email}`);
  return data;
};
const getOrdersByOrderId = async (orderId) => {
  const { data } = await API.get(`/orders/track?orderId=${orderId}`);
  return data;
};

const payOrder = async (orderId, paymentResult) => {
  const { data } = await API.put(`/orders/${orderId}/pay`, paymentResult);
  return data;
};

const updateOrderPayment = async (orderId, paymentInfo) => {
  const { data } = await API.put(`/orders/${orderId}/payment`, paymentInfo);
  return data;
};

const getMyOrders = async () => {
  const { data } = await API.get('/orders/myorders');
  return data;
};

const cancelOrder = async (orderId) => {
  const { data } = await API.put(`/orders/${orderId}/cancel`);
  return data;
};

// User API
const getUserProfile = async () => {
  const { data } = await API.get('/users/profile');
  return data;
};

const updateUserProfile = async (user) => {
  const { data } = await API.put('/users/profile', user);
  return data;
};

const updateGuestShippingAddress = async (orderId, shippingAddress) => {
  const { data } = await API.put(`/orders/${orderId}/shipping`, shippingAddress);
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