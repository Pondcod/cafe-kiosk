Cafe Kiosk API
A comprehensive backend API for a cafe kiosk self-service system with admin functionality.
Features

Product Management: Create, update, delete, and retrieve food/beverage products
Category Management: Organize products into categories
Order Processing: Handle customer orders with customizations
Inventory Tracking: Monitor stock levels and reorder points
User Management: Admin and staff user accounts with role-based access
Customization Options: Product customizations (sizes, add-ons, etc.)

Tech Stack

Backend: Node.js with Express
Database: PostgreSQL via Supabase
Authentication: JWT-based authentication (basic implementation)

Installation

Clone the repository

bashgit clone <repository-url>
cd cafe-kiosk-api

Install dependencies

bashnpm install

Create a .env file in the root directory with the following variables:

PORT=8080
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-supabase-anon-key
NODE_ENV=development

Start the server

bashnpm start
API Endpoints
Products

GET /api/products - Get all products
GET /api/products/:id - Get product by ID
GET /api/products/category/:categoryId - Get products by category
POST /api/products - Create new product
PUT /api/products/:id - Update product
DELETE /api/products/:id - Delete product

Categories

GET /api/categories - Get all categories
GET /api/categories/:id - Get category by ID
POST /api/categories - Create new category
PUT /api/categories/:id - Update category
DELETE /api/categories/:id - Delete category

Orders

GET /api/orders - Get all orders
GET /api/orders/:id - Get order by ID
GET /api/orders/date-range - Get orders by date range
POST /api/orders - Create new order
PUT /api/orders/:id/status - Update order status
POST /api/orders/:id/payment - Process payment for order

Users

POST /api/users/login - User login
POST /api/users/register - Register new user
GET /api/users - Get all users (admin)
GET /api/users/:id - Get user by ID (admin)
PUT /api/users/:id - Update user
DELETE /api/users/:id - Delete user (admin)

Inventory

GET /api/inventory - Get all inventory items
GET /api/inventory/:id - Get inventory item by ID
GET /api/inventory/product/:productId - Get inventory for product
GET /api/inventory/low-stock - Get low stock inventory items
POST /api/inventory - Create new inventory item
PUT /api/inventory/:id - Update inventory item
DELETE /api/inventory/:id - Delete inventory item
POST /api/inventory/:id/restock - Restock inventory

Customization

GET /api/customization - Get all customizations
GET /api/customization/:id - Get customization by ID
GET /api/customization/type/:type - Get customizations by type
GET /api/customization/product/:productId - Get customizations for product
POST /api/customization - Create new customization
PUT /api/customization/:id - Update customization
DELETE /api/customization/:id - Delete customization
POST /api/customization/product - Add customization to product
DELETE /api/customization/product/:product_id/customization/:customization_id - Remove customization from product

Database Schema
The system uses the following tables:

users
categories
products
inventory
kiosks
settings
orders
orderitems
customization
productcustomizeoption
ordercustomization
activitylog
notification
inventorytransaction
promotiontable
promotionproduct
orderpromotion
paymenttransaction

Authentication
The API uses a simple token-based authentication system. For protected endpoints:

Get a token by logging in: POST /api/users/login
Include the token in the Authorization header: Authorization: Bearer <token>

Development
To run the server in development mode with hot reloading:
bashnpm run dev
