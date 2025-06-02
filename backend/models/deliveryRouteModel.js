const mongoose = require('mongoose');

const deliveryRouteSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a route name'],
    },
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    vehicle: {
      type: String,
      required: [true, 'Please add a vehicle'],
    },
    startLocation: {
      type: String,
      required: [true, 'Please add a start location'],
    },
    stops: [
      {
        order: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Order',
        },
        address: {
          type: String,
          required: true,
        },
        estimatedArrival: {
          type: Date,
        },
        status: {
          type: String,
          enum: ['Pending', 'Completed', 'Failed'],
          default: 'Pending',
        },
      },
    ],
    status: {
      type: String,
      required: true,
      enum: ['Planning', 'In Progress', 'Completed', 'Cancelled'],
      default: 'Planning',
    },
    startTime: {
      type: Date,
    },
    endTime: {
      type: Date,
    },
    totalDistance: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const DeliveryRoute = mongoose.model('DeliveryRoute', deliveryRouteSchema);

module.exports = DeliveryRoute;
