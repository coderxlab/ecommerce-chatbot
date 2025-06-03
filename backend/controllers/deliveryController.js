const asyncHandler = require('express-async-handler');
const DeliveryRoute = require('../models/deliveryRouteModel');
const Order = require('../models/orderModel');

// @desc    Create new delivery route
// @route   POST /delivery/routes
// @access  Private/Admin
const createDeliveryRoute = asyncHandler(async (req, res) => {
  const { name, driver, vehicle, startLocation, stops } = req.body;

  const deliveryRoute = new DeliveryRoute({
    name,
    driver,
    vehicle,
    startLocation,
    stops: stops || [],
  });

  const createdRoute = await deliveryRoute.save();
  res.status(201).json(createdRoute);
});

// @desc    Get all delivery routes
// @route   GET /delivery/routes
// @access  Private/Admin
const getDeliveryRoutes = asyncHandler(async (req, res) => {
  const routes = await DeliveryRoute.find({})
    .populate('driver', 'id name')
    .populate('stops.order', 'id totalPrice');
  
  res.json(routes);
});

// @desc    Get delivery route by ID
// @route   GET /delivery/routes/:id
// @access  Private/Admin
const getDeliveryRouteById = asyncHandler(async (req, res) => {
  const route = await DeliveryRoute.findById(req.params.id)
    .populate('driver', 'id name')
    .populate('stops.order', 'id totalPrice shippingAddress');

  if (route) {
    res.json(route);
  } else {
    res.status(404);
    throw new Error('Delivery route not found');
  }
});

// @desc    Update delivery route
// @route   PUT /delivery/routes/:id
// @access  Private/Admin
const updateDeliveryRoute = asyncHandler(async (req, res) => {
  const { name, driver, vehicle, startLocation, stops, status, startTime, endTime, totalDistance } = req.body;

  const route = await DeliveryRoute.findById(req.params.id);

  if (route) {
    route.name = name || route.name;
    route.driver = driver || route.driver;
    route.vehicle = vehicle || route.vehicle;
    route.startLocation = startLocation || route.startLocation;
    route.stops = stops || route.stops;
    route.status = status || route.status;
    route.startTime = startTime || route.startTime;
    route.endTime = endTime || route.endTime;
    route.totalDistance = totalDistance || route.totalDistance;

    const updatedRoute = await route.save();
    res.json(updatedRoute);
  } else {
    res.status(404);
    throw new Error('Delivery route not found');
  }
});

// @desc    Delete delivery route
// @route   DELETE /delivery/routes/:id
// @access  Private/Admin
const deleteDeliveryRoute = asyncHandler(async (req, res) => {
  const route = await DeliveryRoute.findById(req.params.id);

  if (route) {
    // Remove route reference from orders
    for (const stop of route.stops) {
      if (stop.order) {
        const order = await Order.findById(stop.order);
        if (order) {
          order.deliveryRoute = undefined;
          await order.save();
        }
      }
    }

    await route.deleteOne();
    res.json({ message: 'Delivery route removed' });
  } else {
    res.status(404);
    throw new Error('Delivery route not found');
  }
});

// @desc    Add order to delivery route
// @route   PUT /delivery/routes/:id/add-order
// @access  Private/Admin
const addOrderToRoute = asyncHandler(async (req, res) => {
  const { orderId, address, estimatedArrival } = req.body;

  const route = await DeliveryRoute.findById(req.params.id);
  const order = await Order.findById(orderId);

  if (!route) {
    res.status(404);
    throw new Error('Delivery route not found');
  }

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  // Check if order is already in a route
  if (order.deliveryRoute) {
    res.status(400);
    throw new Error('Order is already assigned to a delivery route');
  }

  // Add order to route
  route.stops.push({
    order: orderId,
    address: address || `${order.shippingAddress.address}, ${order.shippingAddress.city}, ${order.shippingAddress.postalCode}, ${order.shippingAddress.country}`,
    estimatedArrival,
    status: 'Pending',
  });

  // Update order with route reference
  order.deliveryRoute = route._id;
  order.status = 'Shipped';

  await order.save();
  const updatedRoute = await route.save();

  res.json(updatedRoute);
});

// @desc    Update stop status in delivery route
// @route   PUT /delivery/routes/:id/stops/:stopId
// @access  Private
const updateStopStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  
  const route = await DeliveryRoute.findById(req.params.id);

  if (!route) {
    res.status(404);
    throw new Error('Delivery route not found');
  }

  // Find the stop
  const stop = route.stops.id(req.params.stopId);
  
  if (!stop) {
    res.status(404);
    throw new Error('Stop not found');
  }

  // Update stop status
  stop.status = status;

  // If stop is completed, update the order status
  if (status === 'Completed' && stop.order) {
    const order = await Order.findById(stop.order);
    if (order) {
      order.isDelivered = true;
      order.deliveredAt = Date.now();
      order.status = 'Delivered';
      await order.save();
    }
  }

  // Check if all stops are completed
  const allCompleted = route.stops.every(s => s.status === 'Completed');
  if (allCompleted) {
    route.status = 'Completed';
    route.endTime = Date.now();
  }

  const updatedRoute = await route.save();
  res.json(updatedRoute);
});

// @desc    Start delivery route
// @route   PUT /delivery/routes/:id/start
// @access  Private
const startDeliveryRoute = asyncHandler(async (req, res) => {
  const route = await DeliveryRoute.findById(req.params.id);

  if (!route) {
    res.status(404);
    throw new Error('Delivery route not found');
  }

  route.status = 'In Progress';
  route.startTime = Date.now();

  const updatedRoute = await route.save();
  res.json(updatedRoute);
});

// @desc    Complete delivery route
// @route   PUT /delivery/routes/:id/complete
// @access  Private
const completeDeliveryRoute = asyncHandler(async (req, res) => {
  const route = await DeliveryRoute.findById(req.params.id);

  if (!route) {
    res.status(404);
    throw new Error('Delivery route not found');
  }

  route.status = 'Completed';
  route.endTime = Date.now();

  const updatedRoute = await route.save();
  res.json(updatedRoute);
});

// @desc    Get routes assigned to driver
// @route   GET /delivery/driver-routes
// @access  Private
const getDriverRoutes = asyncHandler(async (req, res) => {
  const routes = await DeliveryRoute.find({ driver: req.user._id })
    .populate('stops.order', 'id totalPrice shippingAddress');
  
  res.json(routes);
});

module.exports = {
  createDeliveryRoute,
  getDeliveryRoutes,
  getDeliveryRouteById,
  updateDeliveryRoute,
  deleteDeliveryRoute,
  addOrderToRoute,
  updateStopStatus,
  startDeliveryRoute,
  completeDeliveryRoute,
  getDriverRoutes,
};
