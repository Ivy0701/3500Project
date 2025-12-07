# 分布式库存与销售管理系统

基于 Vue 3 + Vite 构建的现代化库存与销售管理 Web 应用。

## 功能特性

- ✅ 用户登录与权限管理
- ✅ 库存信息录入与查询
- ✅ 销售订单生成与管理
- ✅ 补货申请处理
- ✅ 库存报表生成
- ✅ 权限配置与审计

## 技术栈

- **Vue 3** - 渐进式 JavaScript 框架
- **Vite** - 下一代前端构建工具
- **Vue Router** - 官方路由管理器
- **Pinia** - 状态管理
- **SCSS** - CSS 预处理器

## 快速开始

### 1. 启动后端 API（MongoDB）

```bash
cd server
cp env.example .env  # Windows 可手动复制
npm install
npm run dev
```

> 如果 PowerShell 阻止执行 `npm`，可先运行 `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process`，或改用 CMD。

默认端口为 `http://localhost:4000`，可在 `.env` 中调整。

### 2. 启动前端应用

在项目根目录执行：

```bash
npm install
npm run dev
```

应用默认在 `http://localhost:5173` 运行（依赖后端 API）。

### 3. 构建与预览

```bash
npm run build
npm run preview
```

构建产物位于 `dist` 目录。

## 环境变量

### 后端 (`server/.env`)

```
PORT=4000
MONGODB_URI=mongodb://localhost:27017/inventory_sales
```

### 前端 (`.env.local` 等)

```
VITE_API_BASE_URL=http://localhost:4000/api
```

未设置时默认连接 `http://localhost:4000/api`。

## 项目结构

```
src/
├── layouts/          # 布局组件
│   └── MainLayout.vue
├── views/            # 页面视图
│   ├── LoginView.vue
│   ├── DashboardView.vue
│   ├── InventoryView.vue
│   ├── OrdersView.vue
│   ├── ReplenishmentView.vue
│   ├── ReportsView.vue
│   └── PermissionsView.vue
├── router/           # 路由配置
│   └── index.js
├── store/            # 状态管理
│   └── appStore.js
├── styles/           # 全局样式
│   └── theme.scss
├── App.vue           # 根组件
└── main.js           # 入口文件
```

## 页面说明

### 登录页 (`/login`)
- 账号密码登录
- 验证码校验
- 忘记密码与联系客服

### 运营首页 (`/app/dashboard`)
- 欢迎信息与待办任务
- 常用功能快捷入口
- 库存预警概览

### 库存管理 (`/app/inventory`)
- 多条件筛选（商品ID、名称、仓库、状态）
- 库存列表展示
- 库存详情查看

### 销售订单 (`/app/orders`)
- 新建订单向导
- 库存实时校验
- 订单列表与状态管理
- 订单详情与流程跟踪

### 补货申请 (`/app/replenishment`)
- 补货提醒列表
- 补货申请表单
- 处理进度跟踪

### 库存报表 (`/app/reports`)
- 多维度筛选
- 关键指标展示
- 图表可视化（占位）
- 报表导出功能

### 权限管理 (`/app/permissions`)
- 用户列表管理
- 权限矩阵配置
- 角色管理
- 操作日志审计

## 设计规范

- **主色调**: `#2BB5C0` (蓝绿色)
- **背景色**: `#F5F6FA` (浅灰)
- **导航栏**: `#1F2933` 至 `#27303F` (深色渐变)
- **成功**: `#30C48D`
- **警告**: `#F5A623`
- **错误**: `#F25056`

## 开发说明

### 登录测试
- 任意账号密码即可登录（演示模式）
- 验证码需输入正确（不区分大小写）

### 数据说明
- 当前为前端演示数据，未连接后端
- 所有操作均为模拟，不会持久化

## 后续开发建议

1. **后端集成**: 连接真实 API 接口
2. **图表库**: 集成 ECharts 或 Chart.js 实现数据可视化
3. **表单验证**: 使用 VeeValidate 增强表单校验
4. **UI 组件库**: 可考虑集成 Element Plus 或 Ant Design Vue
5. **数据持久化**: 添加 localStorage 或连接数据库
6. **权限细化**: 实现基于角色的访问控制（RBAC）

## 许可证

MIT

