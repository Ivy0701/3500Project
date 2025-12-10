# Distributed Inventory and Sales Management System Project Proposal

## Core Functional Modules

### 1. User Authentication and Permission Management

- **Multi-role Permission System**: Supports four roles: Central Warehouse Manager, Regional Warehouse Manager, Store Sales Staff, and Customer
- **User Registration and Login**: Secure user authentication mechanism with password reset support
- **Role-Based Access Control (RBAC)**: Different roles access different functional modules and data scopes
- **Permission Isolation**: Ensures users can only access and operate data within their permission scope

### 2. Multi-Level Inventory Management

- **Three-Level Inventory Architecture**: Central Warehouse → Regional Warehouse → Store, supporting hierarchical inventory query and management
- **Real-Time Inventory Query**: Supports multi-dimensional queries by product ID, name, warehouse location, etc.
- **Inventory Statistics and Display**: Real-time display of total stock, available stock, allocated stock, etc.
- **Inventory Alert Mechanism**: Automatically generates replenishment reminders when inventory falls below safety threshold
- **Inventory History**: Records inventory change history, supports tracing and analysis

### 3. Order Management

- **Customer Shopping Flow**: Customers can browse products, add to cart, and place orders
- **Order Generation**: System automatically validates inventory and generates orders with unique order numbers
- **Order Status Tracking**: Order statuses include Pending Payment, Pending Shipment, In Transit, Delivered, Completed, Cancelled
- **Order Processing**: Sales staff can view and process orders, update order status
- **After-Sales Management**: Supports return and exchange application and processing

### 4. Replenishment and Transfer Management

- **Replenishment Application**: Regional warehouse managers can initiate replenishment applications based on inventory alerts or manually
- **Replenishment Approval Process**: Central warehouse managers approve replenishment applications
- **Transfer Order Management**: After approval, create transfer orders supporting transfers from central warehouse or other regional warehouses
- **Receiving Confirmation**: Regional warehouse managers can confirm receipt, system automatically updates inventory
- **Transfer Tracking**: Real-time tracking of transfer order status (Pending Approval, In Transit, Arrived)
- **Automatic Inventory Update**: Inventory is deducted from source warehouse when transfer order is created, and added to target warehouse after receiving confirmation

### 5. Data Analysis and Reporting

- **Inventory Statistics Reports**: Generate inventory reports by time range, warehouse, product category, etc.
- **Order Data Analysis**: Order volume, sales revenue, popular products, etc.
- **Multi-Dimensional Filtering**: Supports multiple filter conditions including time, warehouse, product, status
- **Data Visualization**: Charts displaying key indicators and trend analysis

### 6. Supplier Management (Central Warehouse)

- **Supplier Information Management**: Maintain supplier basic information, contact details, cooperation level
- **Supplier Follow-up Tasks**: Generate supplier follow-up tasks based on replenishment applications
- **Supplier Interaction Records**: Record interaction history and important events with suppliers

## Key Pages and Functional Design

### 1. Login and Dashboard

- **Login Page**: Clean login form supporting account and password login, provides forgot password link
- **Role Selection Page**: Select login role type on first visit
- **Dashboard**:
  - Central Warehouse Manager: Displays pending replenishment applications, supplier follow-up tasks, key indicators overview
  - Regional Warehouse Manager: Displays inventory alerts, pending replenishment applications, regional order overview
  - Store Sales Staff: Displays pending orders, inventory reminders, today's tasks
  - Customer: Displays recommended products, order status, shopping cart

### 2. Inventory Management Page

- **Inventory List Display**: Table format displaying all inventory information, supports pagination and search
- **Multi-Dimensional Filtering**: Filter by product ID, name, warehouse location, inventory status, etc.
- **Inventory Details**: Click to view detailed inventory information and history of individual products
- **Inventory Statistics**: Display total inventory, available inventory, alert product count, etc.
- **Permission Control**: Different roles can only view warehouse inventory within their permission scope

### 3. Order Management Page

- **Order List**: Display all orders, supports filtering by status, time, customer, etc.
- **Create Order**: Sales staff can manually create orders, system automatically validates inventory
- **Order Details**: View complete order information, logistics status, operation history
- **Order Operations**: Confirm order, ship, cancel order, etc.
- **Inventory Validation**: Real-time display of available inventory when creating orders, alerts when inventory is insufficient

### 4. Replenishment Application and Approval Page

**Regional Warehouse End (Replenishment Application)**:
- **Inventory Alert List**: Automatically generated replenishment reminders showing trigger reasons and recommended replenishment quantities
- **Replenishment Application Form**: Fill in replenishment products, quantities, expected arrival time, etc.
- **Application Progress Tracking**: Real-time view of application approval status and processing progress

**Central Warehouse End (Replenishment Approval)**:
- **Pending Application List**: Display all pending replenishment applications
- **Application Details View**: View application details, trigger reasons, regional warehouse inventory status
- **Approval Operations**: Approve or reject applications, fill in approval comments
- **Commodity Allocation**: After approval, create transfer orders, select source and target warehouses

### 5. Receiving Management Page

- **Receiving Plan List**: Display all pending receiving transfer orders
- **Receiving Confirmation**: Confirm receiving quantity, quality level, update receiving status
- **Receiving History**: View historical receiving records

### 6. Reports and Statistics Page

- **Inventory Reports**: Inventory turnover rate, safety stock compliance rate, inventory distribution, etc.
- **Order Reports**: Order volume trends, sales revenue statistics, customer analysis, etc.
- **Data Filtering**: Supports multi-dimensional filtering by time range, warehouse, product category, etc.
- **Data Export**: Supports exporting reports in Excel format

## Technical Implementation

### Frontend Technology Stack

- **Vue 3**: Build reactive user interfaces using Composition API
- **Vite**: Fast frontend build tool supporting Hot Module Replacement
- **Vue Router**: Implement single-page application routing
- **Pinia**: State management for global states like user login status, shopping cart
- **Axios**: HTTP client for communicating with backend API
- **SCSS**: CSS preprocessor for better style organization

### Backend Technology Stack

- **Node.js + Express**: Build RESTful API server
- **MongoDB + Mongoose**: NoSQL database storage, use Mongoose for data modeling
- **JWT**: JSON Web Token for user authentication and authorization
- **bcryptjs**: Password encryption storage to ensure user password security

### Database Design

- **User Table**: Stores user information, roles, permission scopes
- **Inventory Table**: Stores product inventory information including location, quantity, threshold, etc.
- **Order Table**: Stores order information, status, customer information, etc.
- **ReplenishmentRequest Table**: Stores replenishment application information, approval status
- **TransferOrder Table**: Stores transfer order information, status, logistics information
- **ReceivingSchedule Table**: Stores receiving plan information

## Design Style and Visual Standards

- **Overall Style**: Modern enterprise-level style emphasizing clear information hierarchy and good user experience
- **Color Scheme**:
  - Primary Color: Teal `#2BB5C0` for main action buttons and brand identity
  - Background Color: Light Gray `#F5F6FA` for comfortable visual experience
  - Navigation Bar: Dark gradient from `#1F2933` to `#27303F`
  - Success Status: Green `#30C48D`
  - Warning Status: Orange `#F5A623`
  - Error Status: Red `#F25056`
- **Layout Design**: Responsive grid system adapting to different screen sizes
- **Interaction Design**: Key operations provide clear feedback, important operations require confirmation

## Project Implementation Plan

### Phase 1: Requirements Analysis and Design (Completed)
- User requirements research and analysis
- System architecture design
- Database design
- UI/UX design

### Phase 2: Core Function Development (Completed)
- User authentication and permission management
- Inventory management module
- Order management module
- Replenishment and transfer module

### Phase 3: Function Enhancement and Optimization (Completed)
- Reports and analysis functions
- Supplier management
- User experience optimization
- Error handling and exception handling

### Phase 4: Testing and Deployment (Completed)
- Functional testing
- Integration testing
- User experience testing
- Deployment preparation

## Project Outcomes

This project has successfully implemented all core functions, and the system is fully operational and ready for use. The project demonstrates a complete software engineering process, including requirements analysis, system design, coding implementation, testing and verification, and other stages of work results.
