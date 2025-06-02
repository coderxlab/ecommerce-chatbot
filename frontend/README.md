# BuyMed E-commerce Frontend

A modern e-commerce frontend for the BuyMed online store, built with React and Bootstrap.

## Features

- Responsive design for all devices
- Product browsing and searching
- Product filtering by category, price, and rating
- User authentication and profile management
- Shopping cart functionality
- Checkout process with shipping and payment options
- Order tracking and history
- Product reviews and ratings

## Technologies Used

- React.js
- React Bootstrap for UI components
- React Router for navigation
- Context API for state management
- Axios for API requests
- React Toastify for notifications
- React Helmet for dynamic document head
- React Icons for icons
- React Slick for carousels

## Getting Started

### Prerequisites

- Node.js and npm installed
- Backend API running (see mock_backend folder)

### Installation

1. Install dependencies:
   ```
   npm install
   ```

2. Start the development server:
   ```
   npm start
   ```

3. The frontend will be available at http://localhost:3000

## Usage

### Home Page

- Browse featured products
- View top-rated products carousel
- Navigate to product categories

### Product Pages

- View product details
- Read and write product reviews
- Add products to cart
- Filter products by category, price, and rating

### Shopping Cart

- View items in cart
- Update quantities
- Remove items
- Proceed to checkout

### Checkout Process

1. Sign in or register
2. Enter shipping details
3. Select payment method
4. Review and place order

### User Account

- View and update profile information
- Track order history
- Manage shipping addresses

## Folder Structure

```
mock_frontend/
├── public/             # Static files
├── src/
│   ├── assets/         # Images and other assets
│   ├── components/     # Reusable components
│   ├── context/        # Context API for state management
│   ├── pages/          # Page components
│   ├── services/       # API services
│   ├── utils/          # Utility functions
│   ├── App.js          # Main application component
│   └── index.js        # Entry point
└── package.json        # Dependencies and scripts
```
