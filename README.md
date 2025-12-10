# COMP3500SEF Software Engineering: Group Project

## Project Overview

Distributed Inventory and Sales Management System: This is a Software Engineering Project completed by eight students from Data Science and Artificial Intelligence and Computer Science programs at Hong Kong Metropolitan University. The project aims to enable the team to practice the complete software engineering lifecycle and its requirements. In this project, the team's task is to create a "Distributed Inventory and Sales Management System", and the team will practice in the following aspects:

- **Organization Management** - Team collaboration and project management processes
- **Resource Requirements** - Technology stack selection and environment configuration
- **User Requirements** - Requirements analysis and system design
- **Programming Standards** - Code standards
- **Documentation, Testing and Deployment** - Complete software engineering lifecycle

In terms of the software engineering process, our project report will include all of the following activities:
a) Software specification/requirement engineering
b) Software design
c) Software implementation
d) Software validation/testing
e) Software evolution

## **Distributed Inventory and Sales Management System**

A full-stack inventory and sales management web application system built with Vue 3 + Node.js + MongoDB.

The software is now fully operational and ready for use.

## 📋 Features

### User Roles and Permissions
- ✅ Multi-role permission management (Central Warehouse Manager, Regional Warehouse Manager, Store Sales Staff, Customer)
- ✅ User login, registration, password reset
- ✅ Role-based access control (RBAC)

### Inventory Management
- ✅ Multi-level inventory management (Central Warehouse, Regional Warehouse, Store)
- ✅ Real-time inventory query and statistics
- ✅ Inventory alerts and replenishment reminders
- ✅ Inventory transfer management
- ✅ Receiving and warehousing management

### Order Management
- ✅ Customer shopping and ordering
- ✅ Order generation and processing
- ✅ Order status tracking
- ✅ After-sales processing (returns and exchanges)

### Replenishment and Transfer
- ✅ Replenishment application and approval
- ✅ Transfer order creation and tracking
- ✅ Receiving confirmation
- ✅ Automatic inventory updates

### Reports and Analytics
- ✅ Inventory statistics reports
- ✅ Order data analysis
- ✅ Multi-dimensional data filtering

## 🛠 Technology Stack

### Frontend
- **Vue 3** - Progressive JavaScript framework
- **Vite** - Next-generation frontend build tool
- **Vue Router** - Official router
- **Pinia** - State management
- **Axios** - HTTP client
- **Vue I18n** - Internationalization support
- **SCSS** - CSS preprocessor

### Backend
- **Node.js** - JavaScript runtime
- **Express** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - JSON Web Token authentication
- **bcryptjs** - Password encryption

## 🚀 Quick Start

### Prerequisites

- Node.js >= 16.x
- MongoDB (local or cloud, e.g., MongoDB Atlas)
- npm or yarn

### 1. Clone the Repository

```bash
git clone <repository-url>
cd 3500Project
```

### 2. Start the Backend Service

```bash
cd MyProject/server
npm install

# Configure environment variables
cp src/env.example .env

# Start the development server
npm run dev
```

> **Windows PowerShell Note**: If PowerShell blocks `npm` execution, run first:
> ```powershell
> Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process
> ```
> Or use CMD instead.

The backend runs on `http://localhost:4000` by default.

### 3. Initialize Database (Optional)

If you need to initialize preset users and inventory data:
```bash
cd MyProject/server

# Initialize users
npm run init:users

# Or run other initialization scripts
node src/scripts/initRegionalInventories.js
node src/scripts/initOperationalData.js
```

### 4. Start the Frontend Application

```bash
cd MyProject
npm install
npm run dev
```

The frontend runs on `http://localhost:5173` by default.

### 5. Access the Application

Open your browser and visit: `http://localhost:5173`

## ⚙️ Environment Configuration

### Backend Environment Variables (`MyProject/server/.env`)

```env
PORT=4000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
# Or local MongoDB
# MONGODB_URI=mongodb://localhost:27017/inventory_sales

JWT_SECRET=your-secret-key-here
```

### Frontend Environment Variables (`.env.local`)

```env
# API base URL (default: http://localhost:4000/api)
VITE_API_BASE_URL=http://localhost:4000/api

# If accessing via LAN, use actual IP address
# VITE_API_BASE_URL=http://192.168.1.100:4000/api
```

## 📁 Project Structure

The project follows a frontend-backend separation architecture:

- **Frontend** (`MyProject/src/`): Vue 3 application with components, routing, state management, and API services
- **Backend** (`MyProject/server/src/`): Node.js + Express server with controllers, models, routes, and middleware

For a detailed breakdown of all directories and files, see the [Project Structure Documentation](MyProject/PROJECT_STRUCTURE.md).

## 👥 User Roles

The system supports the following user roles:

- **Central Manager (centralManager)**: Manages central warehouse inventory, approves replenishment requests, views global reports
- **Regional Manager (regionalManager)**: Manages regional warehouse inventory, views regional orders and inventory
- **Sales Staff (sales)**: Processes orders, manages store inventory
- **Customer (customer)**: Browses products, places orders, views order status

For detailed account information, please refer to: [Preset Accounts Documentation](MyProject/server/PRESET_ACCOUNTS.md)

## API Configuration

If you encounter network connection issues, please refer to: [API Configuration Guide](MyProject/API_CONFIG.md) for configuration.

## 📄 License

This project is created as part of the Software Engineering course (COMP3500SEF) at Hong Kong Metropolitan University. All rights and usage are governed by the university's academic policies.

This project is for learning and demonstration purposes. Please ensure thorough security review and testing before using in production.

---

**Course Information**: COMP3500SEF Software Engineering - Hong Kong Metropolitan University
