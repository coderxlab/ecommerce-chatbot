const request = require('supertest');
const mongoose = require('mongoose');
const { connect, closeDatabase, clearDatabase } = require('./setupTestDB');
const app = require('../server');
const User = require('../models/userModel');
const Order = require('../models/orderModel');

describe('Order Tracking Endpoint', () => {
  let testUser;
  let testOrder;

  beforeAll(async () => {
    await connect();
  });

  afterAll(async () => {
    await closeDatabase();
  });

  beforeEach(async () => {
    await clearDatabase();

    // Create test user
    testUser = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123'
    });

    // Create test order
    testOrder = await Order.create({
      user: testUser._id,
      orderItems: [{
        name: 'Test Product',
        qty: 2,
        price: 10,
        product: new mongoose.Types.ObjectId(),
      }],
      shippingAddress: {
        address: '123 Test St',
        city: 'Test City',
        postalCode: '12345',
        country: 'Test Country'
      },
      paymentMethod: 'Test Payment',
      taxPrice: 2,
      shippingPrice: 5,
      totalPrice: 27,
      status: 'Processing'
    });
  });

  afterEach(async () => {
    await clearDatabase();
  });

  it('should return orders for valid email', async () => {
    const res = await request(app)
      .get('/orders/track').query({ email: 'test@example.com' });

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBeTruthy();
    expect(res.body.length).toBe(1);
    
    // Verify sanitized response
    expect(res.body[0]).toHaveProperty('orderItems');
    expect(res.body[0].orderItems[0]).toHaveProperty('name', 'Test Product');
    expect(res.body[0].orderItems[0]).toHaveProperty('qty', 2);
    expect(res.body[0].orderItems[0]).not.toHaveProperty('product');
    
    expect(res.body[0].shippingAddress).toHaveProperty('city', 'Test City');
    expect(res.body[0].shippingAddress).toHaveProperty('country', 'Test Country');
    expect(res.body[0].shippingAddress).not.toHaveProperty('address');
  });

  it('should return order for valid orderId', async () => {
    const res = await request(app)
      .get('/orders/track').query({ orderId: testOrder._id.toString() });

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBeTruthy();
    expect(res.body.length).toBe(1);
    expect(res.body[0].orderItems[0].name).toBe('Test Product');
  });

  it('should return order when both email and orderId are provided', async () => {
    const res = await request(app)
      .get('/orders/track').query({ 
        email: 'test@example.com',
        orderId: testOrder._id.toString()
      });

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBeTruthy();
    expect(res.body.length).toBe(1);
  });

  it('should return 404 for non-existent email', async () => {
    const res = await request(app)
      .get('/orders/track').query({ email: 'nonexistent@example.com' });

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe('No orders found for this email');
  });

  it('should return 400 for invalid email format', async () => {
    const res = await request(app)
      .get('/orders/track').query({ email: 'invalid-email' });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('Invalid email format');
  });

  it('should return 400 for invalid orderId format', async () => {
    const res = await request(app)
      .get('/orders/track').query({ orderId: 'invalid-id' });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('Invalid orderId format');
  });

  it('should return 400 when neither email nor orderId is provided', async () => {
    const res = await request(app)
      .get('/orders/track');

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('Please provide either email or orderId');
  });

  it('should handle orders without shipping address', async () => {
    // Create a draft order without shipping address
    const draftOrder = await Order.create({
      user: testUser._id,
      orderItems: [{
        name: 'Draft Product',
        qty: 1,
        price: 10,
        product: new mongoose.Types.ObjectId(),
      }],
      taxPrice: 1.5,
      shippingPrice: 0,
      totalPrice: 11.5,
      status: 'Draft'
    });

    const res = await request(app)
      .get('/orders/track').query({ orderId: draftOrder._id.toString() });

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBeTruthy();
    expect(res.body.length).toBe(1);
    expect(res.body[0].shippingAddress).toBeNull();
    expect(res.body[0].orderItems[0].name).toBe('Draft Product');
  });
});