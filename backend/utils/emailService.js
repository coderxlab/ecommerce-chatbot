const nodemailer = require('nodemailer');

// Create a transporter using environment variables
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

/**
 * Send order notification email
 * @param {string} to - Recipient email address
 * @param {Object} order - Order details
 * @returns {Promise} - Resolves when email is sent
 */
const sendOrderNotification = async (to, order) => {
  // Format order items for email
  const orderItemsList = order.orderItems
    .map(
      (item) => `
      - ${item.name} x ${item.qty} - $${(item.price * item.qty).toFixed(2)}`
    )
    .join('\n');

  // Create email content
  const emailContent = `
    Dear Customer,

    Your order #${order._id} is pending. Here are the details:

    Order Items:
    ${orderItemsList}

    Subtotal: $${(order.totalPrice - order.taxPrice - order.shippingPrice).toFixed(2)}
    Tax: $${order.taxPrice.toFixed(2)}
    Shipping: $${order.shippingPrice.toFixed(2)}
    Total: $${order.totalPrice.toFixed(2)}

    Payment Method: ${order.paymentMethod || "Pay on Delivery"}

    Please go to the link, ${process.env.FRONT_END_API}/guest-payment/${order._id}, to pay for your order. After that, we will process your order.

    Thank you for shopping with us!

    Best regards,
    Your E-commerce Team
  `;

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: to,
    subject: `Order Confirmation - Order #${order._id}`,
    text: emailContent,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send order notification email');
  }
};

module.exports = {
  sendOrderNotification,
};