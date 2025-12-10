# COMP3500SEF Software Engineering：小组项目

## 项目概述

分布式库存与销售管理系统：这是香港都会大学（Hong Kong Metropolitan University）数据科学与人工智能和计算机科学两个专业的八位同学完成的软件工程项目。该项目旨在让团队实践软件工程领域的全流程及其要求。在此项目中，团队的任务是创建一个"分布式库存与销售管理系统"，团队将在以下方面进行实践：

- **组织管理** - 团队协作与项目管理流程
- **资源需求** - 技术栈选择与环境配置
- **用户需求** - 需求分析与系统设计
- **编程规范** - 代码规范
- **文档编写、测试和部署尝试** - 完整的软件工程生命周期

在软件工程流程方面，我们的项目报告将包含以下全部活动：
a) 软件规范/需求工程 (Software specification/requirement engineering)
b) 软件设计 (Software design)
c) 软件实现 (Software implementation)
d) 软件验证/测试 (Software validation/testing)
e) 软件演进 (Software evolution)


## 项目名称

**分布式库存与销售管理系统** (Distributed Inventory and Sales Management System)

基于 Vue 3 + Node.js + MongoDB 构建的全栈库存与销售管理 Web 应用系统。

该软件现在已经可以完整投入使用。

## 📋 功能特性

### 用户角色与权限
- ✅ 多角色权限管理（中央仓库管理员、区域仓库管理员、门店销售员、客户）
- ✅ 用户登录、注册、密码重置
- ✅ 基于角色的访问控制（RBAC）

### 库存管理
- ✅ 多层级库存管理（总仓库、区域仓库、门店）
- ✅ 实时库存查询与统计
- ✅ 库存预警与补货提醒
- ✅ 库存调拨管理
- ✅ 收货与入库管理

### 订单管理
- ✅ 客户购物与下单
- ✅ 订单生成与处理
- ✅ 订单状态跟踪
- ✅ 售后处理（退换货）

### 补货与调拨
- ✅ 补货申请与审批
- ✅ 调拨单创建与跟踪
- ✅ 收货确认
- ✅ 库存自动更新

### 报表与分析
- ✅ 库存统计报表
- ✅ 订单数据分析
- ✅ 多维度数据筛选

## 🛠 技术栈

### 前端
- **Vue 3** - 渐进式 JavaScript 框架
- **Vite** - 下一代前端构建工具
- **Vue Router** - 官方路由管理器
- **Pinia** - 状态管理
- **Axios** - HTTP 客户端
- **Vue I18n** - 国际化支持
- **SCSS** - CSS 预处理器

### 后端
- **Node.js** - JavaScript 运行时
- **Express** - Web 应用框架
- **MongoDB** - NoSQL 数据库
- **Mongoose** - MongoDB 对象建模
- **JWT** - JSON Web Token 认证
- **bcryptjs** - 密码加密

## 🚀 快速开始

### 环境要求

- Node.js >= 16.x
- MongoDB (本地或云端，如 MongoDB Atlas)
- npm 或 yarn

### 1. 克隆项目

```bash
git clone <repository-url>
cd 3500Project
```

### 2. 启动后端服务

```bash
cd MyProject/server
npm install

# 配置环境变量
cp src/env.example .env


# 启动开发服务器
npm run dev
```

> **Windows PowerShell 提示**：如果 PowerShell 阻止执行 `npm`，可先运行：
> ```powershell
> Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process
> ```
> 或改用 CMD。

后端默认运行在 `http://localhost:4000`

### 3. 初始化数据库（可选）

如果需要初始化预设用户和库存数据：

```bash
cd MyProject/server

# 初始化用户
npm run init:users

# 或运行其他初始化脚本
node src/scripts/initRegionalInventories.js
node src/scripts/initOperationalData.js
```

### 4. 启动前端应用

```bash
cd MyProject
npm install
npm run dev
```

前端默认运行在 `http://localhost:5173`

### 5. 访问应用

打开浏览器访问：`http://localhost:5173`

## ⚙️ 环境配置

### 后端环境变量 (`MyProject/server/.env`)

```env
PORT=4000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
# 或本地 MongoDB
# MONGODB_URI=mongodb://localhost:27017/inventory_sales

JWT_SECRET=your-secret-key-here
```

### 前端环境变量 (`.env.local`)

```env
# API 基础地址（默认：http://localhost:4000/api）
VITE_API_BASE_URL=http://localhost:4000/api

# 如果通过局域网访问，使用实际 IP
# VITE_API_BASE_URL=http://192.168.1.100:4000/api
```

## 📁 项目结构

```
3500Project/
├── MyProject/                  # 主项目目录
│   ├── src/                    # 前端源码
│   │   ├── layouts/           # 布局组件
│   │   │   ├── MainLayout.vue
│   │   │   └── CustomerLayout.vue
│   │   ├── views/             # 页面视图
│   │   │   ├── DashboardView.vue
│   │   │   ├── InventoryView.vue
│   │   │   ├── OrdersView.vue
│   │   │   ├── ReplenishmentView.vue
│   │   │   ├── ReplenishmentApprovalView.vue
│   │   │   ├── ReceiveGoodsView.vue
│   │   │   ├── CustomerShopView.vue
│   │   │   └── ...
│   │   ├── router/            # 路由配置
│   │   ├── store/             # 状态管理
│   │   ├── services/          # API 服务
│   │   ├── locales/           # 国际化文件
│   │   └── styles/            # 全局样式
│   ├── server/                # 后端服务
│   │   ├── src/
│   │   │   ├── controllers/   # 控制器
│   │   │   ├── models/        # 数据模型
│   │   │   ├── routes/        # 路由
│   │   │   ├── services/      # 业务逻辑
│   │   │   ├── middleware/    # 中间件
│   │   │   ├── config/        # 配置
│   │   │   └── scripts/       # 数据库脚本
│   │   └── package.json
│   ├── package.json           # 前端依赖
│   └── vite.config.js         # Vite 配置
└── README.md                  # 本文档
```

## 👥 用户角色说明

系统支持以下用户角色：

- **中央管理员 (centralManager)**：管理总仓库库存，审批补货申请，查看全局报表
- **区域仓库管理员 (regionalManager)**：管理区域仓库库存，查看区域订单和库存
- **门店销售员 (sales)**：处理订单，管理门店库存
- **客户 (customer)**：浏览商品，下单购买，查看订单状态

详细账户信息请参考 `MyProject/server/PRESET_ACCOUNTS.md`

## API 配置

如果遇到网络连接问题，请参考 `MyProject/API_CONFIG.md` 进行配置。

## 📄 许可证

本项目是作为香港都会大学软件工程课程（COMP3500SEF）的一部分创建的。所有权利和使用均受大学学术政策管辖。

本项目用于学习和演示目的。在生产环境使用前，请确保进行充分的安全审查和测试。

## 📚 文档

详细文档可在项目目录中找到：

- API 参考文档 - 查看后端 API 接口文档
- 部署指南 - 了解如何部署到生产环境
- 故障排除 - 常见问题和解决方案
- 用户手册 - 系统使用说明

---

**课程信息**：COMP3500SEF Software Engineering - Hong Kong Metropolitan University

---

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

## Project Name

**Distributed Inventory and Sales Management System**

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

```
3500Project/
├── MyProject/                  # Main project directory
│   ├── src/                    # Frontend source code
│   │   ├── layouts/           # Layout components
│   │   │   ├── MainLayout.vue
│   │   │   └── CustomerLayout.vue
│   │   ├── views/             # Page views
│   │   │   ├── DashboardView.vue
│   │   │   ├── InventoryView.vue
│   │   │   ├── OrdersView.vue
│   │   │   ├── ReplenishmentView.vue
│   │   │   ├── ReplenishmentApprovalView.vue
│   │   │   ├── ReceiveGoodsView.vue
│   │   │   ├── CustomerShopView.vue
│   │   │   └── ...
│   │   ├── router/            # Router configuration
│   │   ├── store/             # State management
│   │   ├── services/          # API services
│   │   ├── locales/           # Internationalization files
│   │   └── styles/            # Global styles
│   ├── server/                # Backend service
│   │   ├── src/
│   │   │   ├── controllers/   # Controllers
│   │   │   ├── models/        # Data models
│   │   │   ├── routes/        # Routes
│   │   │   ├── services/      # Business logic
│   │   │   ├── middleware/    # Middleware
│   │   │   ├── config/        # Configuration
│   │   │   └── scripts/       # Database scripts
│   │   └── package.json
│   ├── package.json           # Frontend dependencies
│   └── vite.config.js         # Vite configuration
└── README.md                  # This document
```

## 👥 User Roles

The system supports the following user roles:

- **Central Manager (centralManager)**: Manages central warehouse inventory, approves replenishment requests, views global reports
- **Regional Manager (regionalManager)**: Manages regional warehouse inventory, views regional orders and inventory
- **Sales Staff (sales)**: Processes orders, manages store inventory
- **Customer (customer)**: Browses products, places orders, views order status

For detailed account information, please refer to `MyProject/server/PRESET_ACCOUNTS.md`

## API Configuration

If you encounter network connection issues, please refer to `MyProject/API_CONFIG.md` for configuration.

## 📄 License

This project is created as part of the Software Engineering course (COMP3500SEF) at Hong Kong Metropolitan University. All rights and usage are governed by the university's academic policies.

This project is for learning and demonstration purposes. Please ensure thorough security review and testing before using in production.

## 📚 Documentation

Detailed documentation can be found in the project directory:

- API Reference - View backend API interface documentation
- Deployment Guide - Learn how to deploy to production
- Troubleshooting - Common issues and solutions
- User Manual - System usage instructions

---

**Course Information**: COMP3500SEF Software Engineering - Hong Kong Metropolitan University
