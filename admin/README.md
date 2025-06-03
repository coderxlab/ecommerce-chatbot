# E-commerce Admin Dashboard

A simple admin panel for managing the e-commerce backend with products, users, orders, and delivery routes.

## Features

- Dashboard with statistics and charts
- Product management (CRUD operations)
- User management
- Order processing and tracking
- Delivery route planning
- Authentication and authorization
- Responsive design

## Technologies Used

- React.js
- React Bootstrap for UI components
- React Router for navigation
- Axios for API requests
- Chart.js for data visualization
- React Icons for icons
- React Toastify for notifications

## Getting Started

### Prerequisites

- Node.js and npm installed
- Backend API running (see mock_backend folder)

### Installation

1. Install dependencies:
   ```
   npm install
   ```

2. Configure environment variables:
   - Copy `.env.example` to `.env`
   - Update the variables in `.env` with your configuration:
     ```
     REACT_APP_API_URL=http://localhost:8080  # Your backend API URL
     ```

3. Start the development server:
   ```
   npm start
   ```

4. The admin panel will be available at http://localhost:3000

## Usage

### Login

- Use admin credentials to log in
- Only users with admin privileges can access the dashboard

### Dashboard

- View key metrics and statistics
- See recent orders and their status
- View charts for orders and revenue

### Products

- View all products with pagination and search
- Add new products
- Edit existing products
- Delete products
- Upload product images

### Users

- View all users
- Edit user details
- Delete users

### Orders

- View all orders
- See order details
- Update order status
- Mark orders as delivered

### Delivery Routes

- Create delivery routes
- Assign orders to routes
- Track delivery status
- Manage drivers and vehicles

## Folder Structure

```
mock_admin/
├── public/             # Static files
├── src/
│   ├── components/     # Reusable components
│   ├── context/        # Context API for state management
│   ├── pages/          # Page components
│   ├── services/       # API services
│   ├── utils/          # Utility functions
│   ├── App.js          # Main application component
│   └── index.js        # Entry point
└── package.json        # Dependencies and scripts
```
