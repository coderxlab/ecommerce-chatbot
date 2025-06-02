const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const Product = require('../models/productModel');

describe('Guest Order API', () => {
  let testProduct;

  beforeAll(async () => {
    // Create a test product
    testProduct = await Product.create({
      name: 'Test Product',
      price: 99.99,
      user: new mongoose.Types.ObjectId(),
      image: '/images/test.jpg',
      brand: 'Test Brand',
      category: 'Test Category',
      countInStock: 10,
      numReviews: 0,
      description: 'Test Description',
    });
  });

  afterAll(async () => {
    // Clean up test data
    await Product.deleteMany({});
    await mongoose.connection.close();
  });

  describe('POST /api/orders/guest', () => {
    it('should create a new order for guest user', async () => {
      const orderData = {
        orderItems: [
          {
            name: 'Test Product',
            qty: 2,
            image: '/images/test.jpg',
            price: 99.99,
            product: testProduct._id,
          },
        ],
        shippingAddress: {
          address: '123 Test St',
          city: 'Test City',
          postalCode: '12345',
          country: 'Test Country',
        },
        paymentMethod: 'PayPal',
        itemsPrice: 199.98,
        taxPrice: 20.00,
        shippingPrice: 10.00,
        totalPrice: 229.98,
        email: 'guest@example.com',
      };

      const res = await request(app)
        .post('/api/orders/guest')
        .send(orderData);

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('_id');
      expect(res.body.guestEmail).toBe('guest@example.com');
      expect(res.body.orderItems).toHaveLength(1);
      expect(res.body.orderItems[0].product.toString()).toBe(testProduct._id.toString());

      // Verify product stock was updated
      const updatedProduct = await Product.findById(testProduct._id);
      expect(updatedProduct.countInStock).toBe(8);
    });

    it('should return 400 if email is missing', async () => {
      const orderData = {
        orderItems: [
          {
            name: 'Test Product',
            qty: 1,
            image: '/images/test.jpg',
            price: 99.99,
            product: testProduct._id,
          },
        ],
        shippingAddress: {
          address: '123 Test St',
          city: 'Test City',
          postalCode: '12345',
          country: 'Test Country',
        },
        paymentMethod: 'PayPal',
        itemsPrice: 99.99,
        taxPrice: 10.00,
        shippingPrice: 10.00,
        totalPrice: 119.99,
      };

      const res = await request(app)
        .post('/api/orders/guest')
        .send(orderData);

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('Valid email is required for guest orders');
    });

    it('should return 400 if email is invalid', async () => {
      const orderData = {
        orderItems: [
          {
            name: 'Test Product',
            qty: 1,
            image: '/images/test.jpg',
            price: 99.99,
            product: testProduct._id,
          },
        ],
        shippingAddress: {
          address: '123 Test St',
          city: 'Test City',
          postalCode: '12345',
          country: 'Test Country',
        },
        paymentMethod: 'PayPal',
        itemsPrice: 99.99,
        taxPrice: 10.00,
        shippingPrice: 10.00,
        totalPrice: 119.99,
        email: 'invalid-email',
      };

      const res = await request(app)
        .post('/api/orders/guest')
        .send(orderData);

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('Valid email is required for guest orders');
    });

    it('should return 400 if order items are empty', async () => {
      const orderData = {
        orderItems: [],
        shippingAddress: {
          address: '123 Test St',
          city: 'Test City',
          postalCode: '12345',
          country: 'Test Country',
        },
        paymentMethod: 'PayPal',
        itemsPrice: 0,
        taxPrice: 0,
        shippingPrice: 10.00,
        totalPrice: 10.00,
        email: 'guest@example.com',
      };

      const res = await request(app)
        .post('/api/orders/guest')
        .send(orderData);

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('No order items');
    });

    it('should return 404 if product does not exist', async () => {
      const orderData = {
        orderItems: [
          {
            name: 'Non-existent Product',
            qty: 1,
            image: '/images/test.jpg',
            price: 99.99,
            product: new mongoose.Types.ObjectId(),
          },
        ],
        shippingAddress: {
          address: '123 Test St',
          city: 'Test City',
          postalCode: '12345',
          country: 'Test Country',
        },
        paymentMethod: 'PayPal',
        itemsPrice: 99.99,
        taxPrice: 10.00,
        shippingPrice: 10.00,
        totalPrice: 119.99,
        email: 'guest@example.com',
      };

      const res = await request(app)
        .post('/api/orders/guest')
        .send(orderData);

      expect(res.statusCode).toBe(404);
      expect(res.body.message).toMatch(/Product not found/);
    });
  });
});