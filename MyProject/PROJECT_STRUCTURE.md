# Project Structure Guide

This document provides a detailed explanation of the project structure for the Distributed Inventory and Sales Management System.

## 📁 Project Structure

```
3500Project/
├── MyProject/                  # Main project directory
│   ├── src/                    # Frontend source code
│   │   ├── App.vue            # Root component
│   │   ├── main.js            # Application entry point
│   │   ├── layouts/           # Layout components
│   │   │   ├── MainLayout.vue
│   │   │   └── CustomerLayout.vue
│   │   ├── views/             # Page views
│   │   │   ├── RoleSelectView.vue
│   │   │   ├── LoginView.vue
│   │   │   ├── RegisterView.vue
│   │   │   ├── DashboardView.vue
│   │   │   ├── InventoryView.vue
│   │   │   ├── StoreInventoryView.vue
│   │   │   ├── RegionalInventoryView.vue
│   │   │   ├── CentralInventoryCountView.vue
│   │   │   ├── InventoryStatsView.vue
│   │   │   ├── OrdersView.vue
│   │   │   ├── ReplenishmentView.vue
│   │   │   ├── ReplenishmentApprovalView.vue
│   │   │   ├── ReceiveGoodsView.vue
│   │   │   ├── DispatchGoodsView.vue
│   │   │   ├── AllocationView.vue
│   │   │   ├── ReportsView.vue
│   │   │   ├── SupplierManagementView.vue
│   │   │   ├── PermissionsView.vue
│   │   │   ├── ReturnRequestsView.vue
│   │   │   ├── CustomerShopView.vue
│   │   │   ├── CheckoutView.vue
│   │   │   ├── CustomerOrdersView.vue
│   │   │   ├── CustomerAddressView.vue
│   │   │   ├── ForgotPasswordView.vue
│   │   │   ├── ResetPasswordView.vue
│   │   │   └── ... (more views)
│   │   ├── router/            # Router configuration
│   │   │   └── index.js
│   │   ├── store/             # State management
│   │   │   ├── appStore.js
│   │   │   └── inventoryStore.js
│   │   ├── services/          # API services
│   │   │   ├── api.js
│   │   │   ├── authService.js
│   │   │   ├── inventoryService.js
│   │   │   ├── orderService.js
│   │   │   ├── replenishmentService.js
│   │   │   ├── transferService.js
│   │   │   └── receivingService.js
│   │   ├── locales/           # Internationalization files
│   │   │   └── en.js
│   │   └── styles/            # Global styles
│   │       └── theme.scss
│   ├── server/                # Backend service
│   │   ├── src/
│   │   │   ├── app.js         # Express application setup
│   │   │   ├── index.js       # Server entry point
│   │   │   ├── env.example    # Environment variables template
│   │   │   ├── controllers/   # Controllers
│   │   │   │   ├── authController.js
│   │   │   │   ├── orderController.js
│   │   │   │   ├── inventoryController.js
│   │   │   │   ├── replenishmentController.js
│   │   │   │   ├── transferController.js
│   │   │   │   └── receivingController.js
│   │   │   ├── models/        # Data models
│   │   │   │   ├── User.js
│   │   │   │   ├── Order.js
│   │   │   │   ├── Inventory.js
│   │   │   │   ├── ReplenishmentRequest.js
│   │   │   │   ├── ReplenishmentAlert.js
│   │   │   │   ├── TransferOrder.js
│   │   │   │   ├── ReceivingSchedule.js
│   │   │   │   ├── ReceivingLog.js
│   │   │   │   ├── OrderCounter.js
│   │   │   │   └── ...
│   │   │   ├── routes/        # Routes
│   │   │   │   ├── authRoutes.js
│   │   │   │   ├── orderRoutes.js
│   │   │   │   ├── inventoryRoutes.js
│   │   │   │   ├── replenishmentRoutes.js
│   │   │   │   ├── transferRoutes.js
│   │   │   │   └── receivingRoutes.js
│   │   │   ├── services/      # Business logic
│   │   │   │   └── inventoryService.js
│   │   │   ├── middleware/    # Middleware
│   │   │   │   └── auth.js
│   │   │   ├── config/        # Configuration
│   │   │   │   └── db.js
│   │   │   └── scripts/       # Database scripts
│   │   │       ├── initDefaultUsers.js
│   │   │       ├── initRegionalInventories.js
│   │   │       ├── initOperationalData.js
│   │   │       ├── checkReplenishmentData.js
│   │   │       ├── checkWarehouseInventory.js
│   │   │       └── ... (more scripts)
│   │   ├── PRESET_ACCOUNTS.md # Preset accounts documentation
│   │   └── package.json
│   ├── API_CONFIG.md          # API configuration guide
│   ├── proposal.md            # Project proposal
│   ├── PROJECT_STRUCTURE.md   # Project structure (this document)
│   ├── index.html             # HTML entry point
│   ├── package.json           # Frontend dependencies
│   └── vite.config.js         # Vite configuration
└── README.md                  # Main documentation
```

## Directory Descriptions

### Frontend (`MyProject/src/`)

- **layouts/**: Layout components that define the main page structure of the application
- **views/**: Page view components containing all business pages
- **router/**: Router configuration defining page navigation rules
- **store/**: State management using Pinia for global state
- **services/**: API service layer encapsulating backend communication
- **locales/**: Internationalization files supporting multiple languages
- **styles/**: Global style files

### Backend (`MyProject/server/src/`)

- **controllers/**: Controller layer handling HTTP requests and responses
- **models/**: Data models defining database collection structures
- **routes/**: Route definitions mapping URLs to controllers
- **services/**: Business logic layer handling core business logic
- **middleware/**: Middleware such as authentication, error handling, etc.
- **config/**: Configuration files such as database connection settings
- **scripts/**: Database scripts for initializing and maintaining data

## Important Files

### Frontend Entry Points
- `main.js`: Vue application entry file
- `App.vue`: Root component
- `index.html`: HTML template

### Backend Entry Points
- `index.js`: Server startup file
- `app.js`: Express application configuration

### Configuration Files
- `vite.config.js`: Vite build tool configuration
- `env.example`: Environment variables template file

