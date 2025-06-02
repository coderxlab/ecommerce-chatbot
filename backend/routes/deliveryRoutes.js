const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/deliveryController');
const { protect, admin } = require('../middleware/authMiddleware');

router
  .route('/routes')
  .post(protect, admin, createDeliveryRoute)
  .get(protect, admin, getDeliveryRoutes);

router.route('/driver-routes').get(protect, getDriverRoutes);

router
  .route('/routes/:id')
  .get(protect, getDeliveryRouteById)
  .put(protect, admin, updateDeliveryRoute)
  .delete(protect, admin, deleteDeliveryRoute);

router.route('/routes/:id/add-order').put(protect, admin, addOrderToRoute);
router.route('/routes/:id/stops/:stopId').put(protect, updateStopStatus);
router.route('/routes/:id/start').put(protect, startDeliveryRoute);
router.route('/routes/:id/complete').put(protect, completeDeliveryRoute);

module.exports = router;
