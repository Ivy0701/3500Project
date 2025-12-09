# 分布式库存与销售管理系统

基于 Vue 3 + Node.js + MongoDB 构建的全栈库存与销售管理 Web 应用系统。

## 📋 功能特性

### 用户角色与权限
- ✅ 多角色权限管理（中央管理员、区域仓库管理员、门店销售员、客户）
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
# 或手动创建 .env 文件并配置 MongoDB 连接字符串

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

## 🎨 设计规范

- **主色调**: `#2BB5C0` (蓝绿色)
- **背景色**: `#F5F6FA` (浅灰)
- **导航栏**: `#1F2933` 至 `#27303F` (深色渐变)
- **成功**: `#30C48D`
- **警告**: `#F5A623`
- **错误**: `#F25056`

## 📖 主要功能页面

### 运营管理端

- **仪表盘** (`/app/dashboard`) - 数据概览与快捷入口
- **库存管理** (`/app/inventory`) - 多层级库存查询与管理
- **订单管理** (`/app/orders`) - 订单处理与状态跟踪
- **补货申请** (`/app/replenishment`) - 补货申请提交与跟踪
- **补货审批** (`/app/replenishment-approval`) - 审批补货申请，创建调拨单
- **收货管理** (`/app/receive-goods`) - 收货计划与收货确认
- **报表统计** (`/app/reports`) - 数据报表与分析

### 客户端

- **商品浏览** (`/customer/shop`) - 浏览和搜索商品
- **购物车** - 购物车管理
- **结账** (`/customer/checkout`) - 订单确认与支付
- **订单查询** (`/customer/orders`) - 查看订单状态
- **地址管理** (`/customer/addresses`) - 收货地址管理

## 🔧 开发说明

### 可用脚本

#### 前端
```bash
npm run dev      # 启动开发服务器
npm run build    # 构建生产版本
npm run preview  # 预览生产构建
npm run lint     # 代码检查
```

#### 后端
```bash
npm run dev                    # 启动开发服务器（nodemon）
npm start                      # 启动生产服务器
npm run init:users            # 初始化用户数据
npm run update:usernames      # 更新用户名
```

### 数据库脚本

在 `MyProject/server/src/scripts/` 目录下有多个数据库初始化和管理脚本：

- `initUsers.js` - 初始化用户
- `initRegionalInventories.js` - 初始化区域库存
- `initOperationalData.js` - 初始化运营数据
- `updateWestWarehouseCasualTShirt.js` - 更新特定库存
- 等等...

### API 配置

如果遇到网络连接问题，请参考 `MyProject/API_CONFIG.md` 进行配置。

## 🐛 常见问题

### 1. 后端连接 MongoDB 失败

- 检查 MongoDB 服务是否运行
- 验证 `.env` 文件中的 `MONGODB_URI` 配置
- 确认网络连接和防火墙设置

### 2. 前端无法连接后端 API

- 确认后端服务已启动（端口 4000）
- 检查 `.env.local` 中的 `VITE_API_BASE_URL` 配置
- 如果是局域网访问，使用实际 IP 地址而非 localhost

### 3. 权限错误

- 确认用户角色配置正确
- 检查 JWT token 是否有效
- 查看后端日志确认认证状态

## 📝 开发建议

1. **数据持久化**：系统已连接 MongoDB，所有操作会持久化保存
2. **权限控制**：基于角色的访问控制已实现，可进一步细化权限
3. **错误处理**：建议添加更完善的错误处理和用户提示
4. **性能优化**：可考虑添加数据缓存和分页加载
5. **测试**：建议添加单元测试和集成测试

## 📄 许可证

MIT License

## 👨‍💻 贡献

欢迎提交 Issue 和 Pull Request！

## 📞 支持

如有问题，请查看项目文档或提交 Issue。

---

**注意**：本项目用于学习和演示目的。在生产环境使用前，请确保进行充分的安全审查和测试。
