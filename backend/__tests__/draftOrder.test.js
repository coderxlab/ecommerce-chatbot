const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../server');
const Product = require('../models/productModel');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Draft Order Endpoints', () => {
  let testProduct;

  beforeEach(async () => {
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

  afterEach(async () => {
    await Product.deleteMany({});
  });

  describe('POST /api/orders/draft', () => {
    it('should create a draft order with valid items', async () => {
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
        email: 'test@example.com',
      };

      const response = await request(app)
        .post('/api/orders/draft')
        .send(orderData);

      expect(response.statusCode).toBe(201);
      expect(response.body.status).toBe('Draft');
      expect(response.body.guestEmail).toBe('test@example.com');
      expect(response.body.orderItems).toHaveLength(1);
      expect(response.body.shippingAddress).toBeUndefined();
      expect(response.body.paymentMethod).toBeUndefined();
    });

    it('should create a draft order without email', async () => {
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
      };

      const response = await request(app)
        .post('/api/orders/draft')
        .send(orderData);

      expect(response.statusCode).toBe(201);
      expect(response.body.status).toBe('Draft');
      expect(response.body.guestEmail).toBeUndefined();
    });

    it('should fail with invalid email format', async () => {
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
        email: 'invalid-email',
      };

      const response = await request(app)
        .post('/api/orders/draft')
        .send(orderData);

      expect(response.statusCode).toBe(400);
      expect(response.body.message).toBe('Invalid email format');
    });

    it('should fail with no order items', async () => {
      const orderData = {
        orderItems: [],
        email: 'test@example.com',
      };

      const response = await request(app)
        .post('/api/orders/draft')
        .send(orderData);

      expect(response.statusCode).toBe(400);
      expect(response.body.message).toBe('No order items');
    });

    it('should fail with non-existent product', async () => {
      const orderData = {
        orderItems: [
          {
            name: 'Test Product',
            qty: 2,
            image: '/images/test.jpg',
            price: 99.99,
            product: new mongoose.Types.ObjectId(),
          },
        ],
        email: 'test@example.com',
      };

      const response = await request(app)
        .post('/api/orders/draft')
        .send(orderData);

      expect(response.statusCode).toBe(404);
      expect(response.body.message).toMatch(/Product not found/);
    });
  });
});