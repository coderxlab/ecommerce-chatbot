const { sendOrderNotification } = require('../utils/emailService');

// Mock nodemailer
jest.mock('nodemailer', () => ({
  createTransport: jest.fn().mockReturnValue({
    sendMail: jest.fn().mockResolvedValue({ messageId: 'test-id' }),
  }),
}));

describe('Email Service', () => {
  // Set up test environment variables
  beforeAll(() => {
    process.env.EMAIL_HOST = 'smtp.gmail.com';
    process.env.EMAIL_PORT = '587';
    process.env.EMAIL_SECURE = 'false';
    process.env.EMAIL_USER = 'test@gmail.com';
    process.env.EMAIL_PASSWORD = 'test-password';
    process.env.EMAIL_FROM = 'test@gmail.com';
    process.env.FRONT_END_API = 'http://localhost:3000';
  });

  // Clean up environment variables after tests
  afterAll(() => {
    delete process.env.EMAIL_HOST;
    delete process.env.EMAIL_PORT;
    delete process.env.EMAIL_SECURE;
    delete process.env.EMAIL_USER;
    delete process.env.EMAIL_PASSWORD;
    delete process.env.EMAIL_FROM;
    delete process.env.FRONT_END_API;
  });

  const mockOrder = {
    _id: '123456789',
    orderItems: [
      {
        name: 'Test Product',
        qty: 2,
        price: 10,
      },
    ],
    totalPrice: 25,
    taxPrice: 3,
    shippingPrice: 2,
    shippingAddress: {
      address: '123 Test St',
      city: 'Test City',
      postalCode: '12345',
      country: 'Test Country',
    },
    paymentMethod: 'PayPal',
  };

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should send order notification email successfully', async () => {
    const testEmail = 'test@example.com';
    
    await expect(sendOrderNotification(testEmail, mockOrder))
      .resolves
      .not
      .toThrow();
  });

  it('should throw error when email sending fails', async () => {
    // Mock the transporter to throw an error
    const nodemailer = require('nodemailer');
    nodemailer.createTransport.mockReturnValue({
      sendMail: jest.fn().mockRejectedValue(new Error('Failed to send')),
    });

    const testEmail = 'test@example.com';
    
    await expect(sendOrderNotification(testEmail, mockOrder))
      .rejects
      .toThrow('Failed to send order notification email');
  });
});