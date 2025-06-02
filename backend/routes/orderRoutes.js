const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/orderController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/').post(protect, addOrderItems).get(protect, admin, getOrders);
router.route('/guest').post(addGuestOrderItems); // Public endpoint for guest orders
router.route('/draft').post(createDraftOrder); // Public endpoint for draft orders
router.route('/myorders').get(protect, getMyOrders);
router.route('/track').get(getOrdersByEmailOrOrderID); // Public endpoint for order tracking by email or orderId
router.route('/:id').get(protect, getOrderById);
router.route('/:id/pay').put(protect, updateOrderToPaid);
router.route('/:id/deliver').put(protect, admin, updateOrderToDelivered);
router.route('/:id/status').put(protect, admin, updateOrderStatus);
router.route('/:id/cancel').put(protect, cancelOrder);
router.route('/:id/shipping').put(updateOrderShipping); // Public endpoint for updating shipping address

module.exports = router;
