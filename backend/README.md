# E-commerce Backend API

A complete backend for an e-commerce platform with products, users, orders, and delivery routes management.

## Technologies Used

- Node.js
- Express.js
- MongoDB (with Mongoose)
- JWT Authentication
- Cloudinary for image storage
- Multer for file uploads

## Features

- User authentication and authorization
- Product management
- Order processing
- Delivery route planning and tracking
- Image upload to Cloudinary
- Admin dashboard functionality

## API Endpoints

### Users
- `POST /users` - Register a new user
- `POST /users/login` - Authenticate user & get token
- `GET /users/profile` - Get user profile
- `PUT /users/profile` - Update user profile
- `GET /users` - Get all users (Admin only)
- `DELETE /users/:id` - Delete user (Admin only)
- `GET /users/:id` - Get user by ID (Admin only)
- `PUT /users/:id` - Update user (Admin only)

### Products
- `GET /products` - Fetch all products
- `GET /products/:id` - Fetch single product
- `POST /products` - Create a product (Admin only)
- `PUT /products/:id` - Update a product (Admin only)
- `DELETE /products/:id` - Delete a product (Admin only)
- `POST /products/:id/reviews` - Create new review
- `GET /products/top` - Get top rated products

### Orders
- `POST /orders` - Create new order
- `GET /orders/myorders` - Get logged in user orders
- `GET /orders/:id` - Get order by ID
- `PUT /orders/:id/pay` - Update order to paid
- `PUT /orders/:id/deliver` - Update order to delivered (Admin only)
- `GET /orders` - Get all orders (Admin only)
- `PUT /orders/:id/status` - Update order status (Admin only)
- `PUT /orders/:id/cancel` - Cancel order

### Delivery Routes
- `POST /delivery/routes` - Create new delivery route (Admin only)
- `GET /delivery/routes` - Get all delivery routes (Admin only)
- `GET /delivery/routes/:id` - Get delivery route by ID
- `PUT /delivery/routes/:id` - Update delivery route (Admin only)
- `DELETE /delivery/routes/:id` - Delete delivery route (Admin only)
- `PUT /delivery/routes/:id/add-order` - Add order to delivery route (Admin only)
- `PUT /delivery/routes/:id/stops/:stopId` - Update stop status
- `PUT /delivery/routes/:id/start` - Start delivery route
- `PUT /delivery/routes/:id/complete` - Complete delivery route
- `GET /delivery/driver-routes` - Get routes assigned to driver

### Uploads
- `POST /upload` - Upload image to local storage
- `POST /upload/cloudinary` - Upload image to Cloudinary
- `DELETE /upload/cloudinary/:id` - Delete image from Cloudinary (Admin only)

## Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file in the root directory with the following variables:
   ```
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   JWT_EXPIRE=30d
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   ```
4. Create an `uploads` folder in the root directory

## Usage

### Development
```
npm run dev
```

### Production
```
npm start
```

## Database Models

- User: Stores user information and authentication details
- Product: Contains product details, inventory, and reviews
- Order: Manages order processing and status
- DeliveryRoute: Handles delivery planning and tracking
