const request = require('supertest');
const express = require('express');
const cloudinary = require('../../config/cloudinary');
const { uploadToCloudinary } = require('../uploadController');
const fs = require('fs');

jest.mock('../../config/cloudinary');
jest.mock('fs');

const app = express();
app.use(express.json());

// Mock middleware to simulate multer
const mockMulter = (req, res, next) => {
  req.file = {
    path: 'uploads/test-image.jpg',
    originalname: 'test-image.jpg'
  };
  next();
};

app.post('/api/upload/cloudinary', mockMulter, uploadToCloudinary);

describe('Upload Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should successfully upload a file to cloudinary', async () => {
    // Mock cloudinary upload response
    cloudinary.uploader.upload.mockResolvedValue({
      secure_url: 'https://cloudinary.com/test-image.jpg',
      public_id: 'test-image'
    });

    // Mock fs.unlinkSync to do nothing
    fs.unlinkSync.mockImplementation(() => {});
    fs.existsSync.mockImplementation(() => true);

    process.env.CLOUDINARY_CLOUD_NAME = 'test';
    process.env.CLOUDINARY_API_KEY = 'test';
    process.env.CLOUDINARY_API_SECRET = 'test';

    const response = await request(app)
      .post('/api/upload/cloudinary')
      .attach('image', Buffer.from('fake image'), 'test-image.jpg');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('imageUrl');
    expect(response.body).toHaveProperty('cloudinaryId');
    expect(fs.unlinkSync).toHaveBeenCalled();
  });

  it('should handle missing cloudinary configuration', async () => {
    delete process.env.CLOUDINARY_CLOUD_NAME;
    delete process.env.CLOUDINARY_API_KEY;
    delete process.env.CLOUDINARY_API_SECRET;

    const response = await request(app)
      .post('/api/upload/cloudinary')
      .attach('image', Buffer.from('fake image'), 'test-image.jpg');

    expect(response.status).toBe(500);
    expect(response.body.message).toContain('Cloudinary configuration is missing');
  });

  it('should handle cloudinary upload failure', async () => {
    process.env.CLOUDINARY_CLOUD_NAME = 'test';
    process.env.CLOUDINARY_API_KEY = 'test';
    process.env.CLOUDINARY_API_SECRET = 'test';

    cloudinary.uploader.upload.mockRejectedValue(new Error('Upload failed'));
    fs.existsSync.mockImplementation(() => true);
    fs.unlinkSync.mockImplementation(() => {});

    const response = await request(app)
      .post('/api/upload/cloudinary')
      .attach('image', Buffer.from('fake image'), 'test-image.jpg');

    expect(response.status).toBe(500);
    expect(response.body.message).toContain('Upload failed');
    expect(fs.unlinkSync).toHaveBeenCalled();
  });
});