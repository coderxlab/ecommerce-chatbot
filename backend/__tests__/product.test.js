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

beforeEach(async () => {
  await Product.deleteMany({});
});

describe('Product Controller Tests', () => {
  describe('GET /api/products', () => {
    beforeEach(async () => {
      // Create test products
      await Product.create([
        {
          name: 'Test Product 1',
          description: 'A great product',
          category: 'Electronics',
          price: 99.99,
          countInStock: 10,
          user: new mongoose.Types.ObjectId(),
        },
        {
          name: 'Another Product',
          description: 'Test description',
          category: 'Books',
          price: 29.99,
          countInStock: 5,
          user: new mongoose.Types.ObjectId(),
        },
        {
          name: 'Third Item',
          description: 'Electronics item',
          category: 'Electronics',
          price: 199.99,
          countInStock: 3,
          user: new mongoose.Types.ObjectId(),
        },
      ]);
    });

    it('should search products by name', async () => {
      const res = await request(app)
        .get('/api/products')
        .query({ keyword: 'Test Product' });
      
      expect(res.status).toBe(200);
      expect(res.body.products).toHaveLength(1);
      expect(res.body.products[0].name).toBe('Test Product 1');
    });

    it('should search products by category', async () => {
      const res = await request(app)
        .get('/api/products')
        .query({ keyword: 'Electronics' });
      
      expect(res.status).toBe(200);
      expect(res.body.products).toHaveLength(2);
      expect(res.body.products.every(p => p.category === 'Electronics')).toBe(true);
    });

    it('should search products by description', async () => {
      const res = await request(app)
        .get('/api/products')
        .query({ keyword: 'great product' });
      
      expect(res.status).toBe(200);
      expect(res.body.products).toHaveLength(1);
      expect(res.body.products[0].description).toBe('A great product');
    });

    it('should return empty array when no matches found', async () => {
      const res = await request(app)
        .get('/api/products')
        .query({ keyword: 'nonexistent' });
      
      expect(res.status).toBe(200);
      expect(res.body.products).toHaveLength(0);
    });

    it('should return all products when no keyword provided', async () => {
      const res = await request(app)
        .get('/api/products');
      
      expect(res.status).toBe(200);
      expect(res.body.products).toHaveLength(3);
    });
  });
});