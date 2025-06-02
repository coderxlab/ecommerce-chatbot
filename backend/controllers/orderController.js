const asyncHandler = require('express-async-handler');
const Order = require('../models/orderModel');
const Product = require('../models/productModel');
const User = require('../models/userModel');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const addOrderItems = asyncHandler(async (req, res) => {
  const {
    orderItems,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
  } = req.body;

  if (orderItems && orderItems.length === 0) {
    res.status(400);
    throw new Error('No order items');
  } else {
    // Check if all products are in stock
    for (const item of orderItems) {
      const product = await Product.findById(item.product);
      if (!product) {
        res.status(404);
        throw new Error(`Product not found: ${item.product}`);
      }
      if (product.countInStock < item.qty) {
        res.status(400);
        throw new Error(`${product.name} is out of stock`);
      }
    }

    // Create order
    const order = new Order({
      orderItems,
      user: req.user._id,
      shippingAddress,
      paymentMethod,
      taxPrice,
      shippingPrice,
      totalPrice,
    });

    const createdOrder = await order.save();

    // Update product stock
    for (const item of orderItems) {
      const product = await Product.findById(item.product);
      product.countInStock -= item.qty;
      await product.save();
    }

    res.status(201).json(createdOrder);
  }
});

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate(
    'user',
    'name email'
  );

  if (order) {
    res.json(order);
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

// @desc    Update order to paid
// @route   PUT /api/orders/:id/pay
// @access  Private
const updateOrderToPaid = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentResult = {
      id: req.body.id,
      status: req.body.status,
      update_time: req.body.update_time,
      email_address: req.body.payer.email_address,
    };

    const updatedOrder = await order.save();

    res.json(updatedOrder);
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

// @desc    Update order to delivered
// @route   PUT /api/orders/:id/deliver
// @access  Private/Admin
const updateOrderToDelivered = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    order.isDelivered = true;
    order.deliveredAt = Date.now();
    order.status = 'Delivered';

    const updatedOrder = await order.save();

    res.json(updatedOrder);
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id });
  res.json(orders);
});

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
const getOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({}).populate('user', 'id name');
  res.json(orders);
});

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  
  const order = await Order.findById(req.params.id);

  if (order) {
    order.status = status;
    
    // If status is delivered, update isDelivered and deliveredAt
    if (status === 'Delivered') {
      order.isDelivered = true;
      order.deliveredAt = Date.now();
    }

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
const cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  // Check if user is admin or order owner
  if (
    req.user.isAdmin ||
    order.user.toString() === req.user._id.toString()
  ) {
    // Only allow cancellation if order is not delivered
    if (order.isDelivered) {
      res.status(400);
      throw new Error('Cannot cancel delivered order');
    }

    order.status = 'Cancelled';

    // Return items to inventory
    for (const item of order.orderItems) {
      const product = await Product.findById(item.product);
      if (product) {
        product.countInStock += item.qty;
        await product.save();
      }
    }

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } else {
    res.status(401);
    throw new Error('Not authorized');
  }
});

// @desc    Track orders by email or orderId (public)
// @route   GET /api/orders/track?email=&orderId=
// @access  Public
// @desc    Create new order for guest user
// @route   POST /api/orders/guest
// @access  Public
const addGuestOrderItems = asyncHandler(async (req, res) => {
  const {
    orderItems,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    email,
  } = req.body;

  // Validate email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    res.status(400);
    throw new Error('Valid email is required for guest orders');
  }

  if (!orderItems || orderItems.length === 0) {
    res.status(400);
    throw new Error('No order items');
  }

  // Check if all products are in stock
  for (const item of orderItems) {
    const product = await Product.findById(item.product);
    if (!product) {
      res.status(404);
      throw new Error(`Product not found: ${item.product}`);
    }
    if (product.countInStock < item.qty) {
      res.status(400);
      throw new Error(`${product.name} is out of stock`);
    }
  }

  // Create order
  const order = new Order({
    orderItems,
    guestEmail: email,
    shippingAddress,
    paymentMethod,
    taxPrice,
    shippingPrice,
    totalPrice,
  });

  const createdOrder = await order.save();

  // Update product stock
  for (const item of orderItems) {
    const product = await Product.findById(item.product);
    product.countInStock -= item.qty;
    await product.save();
  }

  res.status(201).json(createdOrder);
});

const getOrdersByEmailOrOrderID = asyncHandler(async (req, res) => {
  const { email, orderId } = req.query;
  
  // If neither email nor orderId is provided
  if (!email && !orderId) {
    res.status(400);
    throw new Error('Please provide either email or orderId');
  }

  let orders = [];

  // If orderId is provided, search by orderId
  if (orderId) {
    try {
      const order = await Order.findById(orderId)
        .select('orderItems shippingAddress status isDelivered deliveredAt createdAt totalPrice')
        .lean();
      
      if (order) {
        orders = [order];
      }
    } catch (error) {
      // If invalid orderId format, continue with email search if provided
      if (!email) {
        res.status(400);
        throw new Error('Invalid orderId format');
      }
    }
  }

  // If email is provided and no order was found by orderId
  if (email && orders.length === 0) {
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400);
      throw new Error('Invalid email format');
    }

    const user = await User.findOne({ email: email });
    
    // First try to find guest orders
    orders = await Order.find({ guestEmail: email })
      .select('orderItems shippingAddress status isDelivered deliveredAt createdAt totalPrice')
      .lean();

    // If user exists, also get their registered orders
    if (user) {
      const userOrders = await Order.find({ user: user._id })
        .select('orderItems shippingAddress status isDelivered deliveredAt createdAt totalPrice')
        .lean();
      orders = [...orders, ...userOrders];
    }

    // Only throw error if no orders found at all
    if (orders.length === 0) {
      res.status(404);
      throw new Error('No orders found for this email');
    }
  }

  if (orders.length === 0) {
    res.status(404);
    throw new Error('No orders found');
  }

  // Remove sensitive information from response
  const sanitizedOrders = orders.map(order => ({
    ...order,
    shippingAddress: order.shippingAddress ? {
      city: order.shippingAddress.city,
      country: order.shippingAddress.country
    } : null,
    orderItems: order.orderItems.map(item => ({
      name: item.name,
      qty: item.qty,
      price: item.price
    }))
  }));

  res.json(sanitizedOrders);
});

// @desc    Create draft order
// @route   POST /api/orders/draft
// @access  Public
const createDraftOrder = asyncHandler(async (req, res) => {
  const {
    orderItems,
    email,
  } = req.body;

  if (!orderItems || orderItems.length === 0) {
    res.status(400);
    throw new Error('No order items');
  }

  // Validate email if provided
  if (email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400);
      throw new Error('Invalid email format');
    }
  }

  // Check if all products exist and calculate total price
  let itemsPrice = 0;
  for (const item of orderItems) {
    const product = await Product.findById(item.product);
    if (!product) {
      res.status(404);
      throw new Error(`Product not found: ${item.product}`);
    }
    itemsPrice += item.qty * product.price;
  }

  // Calculate prices
  const taxPrice = itemsPrice * 0.15; // 15% tax
  const shippingPrice = itemsPrice > 100 ? 0 : 10; // Free shipping for orders over $100
  const totalPrice = itemsPrice + taxPrice + shippingPrice;

  // Create draft order
  const order = new Order({
    orderItems,
    guestEmail: email,
    status: 'Draft',
    taxPrice,
    shippingPrice,
    totalPrice,
  });

  const createdOrder = await order.save();
  res.status(201).json(createdOrder);
});

// @desc    Update order shipping address
// @route   PUT /api/orders/:id/shipping
// @access  Public
const updateOrderShipping = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    if (order.isPaid) {
      res.status(400);
      throw new Error('Cannot update shipping address for paid orders');
    }

    order.shippingAddress = {
      address: req.body.address,
      city: req.body.city,
      postalCode: req.body.postalCode,
      country: req.body.country,
    };

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

module.exports = {
  addOrderItems,
  addGuestOrderItems,
  getOrderById,
  updateOrderToPaid,
  updateOrderToDelivered,
  getMyOrders,
  getOrders,
  updateOrderStatus,
  cancelOrder,
  getOrdersByEmailOrOrderID,
  createDraftOrder,
  updateOrderShipping,
};
