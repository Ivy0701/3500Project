# 预设账号说明

## 概述

系统已自动创建预设的销售员、区域仓库管理员以及总仓库管理员账号，这些账号在服务器启动时自动初始化（如果不存在）。

## 预设账号列表（最新）

### 销售员账号（门店员工）

> 开发调试推荐直接使用第 1 行账号：**华东门店1店员1**。  
> 该账号只关联 `East Store 1`，登录后可以完整体验门店销售 → 库存变动 → 自动补货 → 区域/总仓调拨的全流程。

| 账号                 | 密码   | 姓名         | 角色  | 归属门店        |
|----------------------|--------|--------------|-------|-----------------|
| east_store1_sales_01 | 123456 | 华东门店1店员1    | sales | East Store 1    |
| east_store1_sales_02 | 123456 | 华东门店1店员2    | sales | East Store 1    |
| east_store2_sales_01 | 123456 | 华东门店2店员1    | sales | East Store 2    |
| east_store2_sales_02 | 123456 | 华东门店2店员2    | sales | East Store 2    |
| west_store1_sales_01 | 123456 | 华西门店1店员1    | sales | West Store 1    |
| west_store1_sales_02 | 123456 | 华西门店1店员2    | sales | West Store 1    |
| west_store2_sales_01 | 123456 | 华西门店2店员1    | sales | West Store 2    |
| west_store2_sales_02 | 123456 | 华西门店2店员2    | sales | West Store 2    |
| north_store1_sales_01| 123456 | 华北门店1店员1    | sales | North Store 1   |
| north_store1_sales_02| 123456 | 华北门店1店员2    | sales | North Store 1   |
| north_store2_sales_01| 123456 | 华北门店2店员1    | sales | North Store 2   |
| north_store2_sales_02| 123456 | 华北门店2店员2    | sales | North Store 2   |
| south_store1_sales_01| 123456 | 华南门店1店员1    | sales | South Store 1   |
| south_store1_sales_02| 123456 | 华南门店1店员2    | sales | South Store 1   |
| south_store2_sales_01| 123456 | 华南门店2店员1    | sales | South Store 2   |
| south_store2_sales_02| 123456 | 华南门店2店员2    | sales | South Store 2   |

### 区域仓库管理员账号

| 账号            | 密码   | 姓名         | 角色            | 区域仓库        |
|-----------------|--------|--------------|-----------------|-----------------|
| east_manager_01 | 123456 | 华东仓管1    | regionalManager | East Warehouse  |
| east_manager_02 | 123456 | 华东仓管2    | regionalManager | East Warehouse  |
| west_manager_01 | 123456 | 华西仓管1    | regionalManager | West Warehouse  |
| west_manager_02 | 123456 | 华西仓管2    | regionalManager | West Warehouse  |
| north_manager_01| 123456 | 华北仓管1    | regionalManager | North Warehouse |
| north_manager_02| 123456 | 华北仓管2    | regionalManager | North Warehouse |
| south_manager_01| 123456 | 华南仓管1    | regionalManager | South Warehouse |
| south_manager_02| 123456 | 华南仓管2    | regionalManager | South Warehouse |

### 总仓库管理员账号

| 账号       | 密码   | 姓名           | 角色           |
|------------|--------|----------------|----------------|
| central001 | 123456 | 总仓库管理员1  | centralManager |
| central002 | 123456 | 总仓库管理员2  | centralManager |

## 使用说明

### 1. 登录销售员账号（推荐：华东门店1店员1）

1. 在首页选择"销售员"
2. 点击"登录"按钮
3. 输入账号：`east_store1_sales_01`
4. 输入密码：`123456`
5. 输入验证码（不区分大小写）
6. 点击"登录"

登录成功后，将进入管理系统，可以访问：
- 库存管理
- 销售订单
- 报表
- 补货申请
- 权限管理

### 2. 登录区域仓库管理员账号

1. 在首页选择"区域仓库管理员"
2. 点击"登录"按钮
3. 输入账号：例如 `east_manager_01`、`west_manager_01` 等
4. 输入密码：`123456`
5. 输入验证码（不区分大小写）
6. 点击"登录"

登录成功后，将进入管理系统，可以访问：
- 库存盘点
- 发货管理
- 收货入库
- 补货申请

### 3. 登录总仓库管理员账号

1. 在首页选择"总仓库管理员"
2. 点击"登录"按钮
3. 输入账号：`central001` 或 `central002`
4. 输入密码：`123456`
5. 输入验证码（不区分大小写）
6. 点击"登录"

登录成功后，将进入管理系统，可以访问：
- 补货审批
- 区域调拨
- 供应商管理

## 自动初始化

服务器启动时，系统会自动检查这些预设账号是否存在。如果不存在，会自动创建它们。

**重要提示：**
- 预设账号会自动创建，无需手动操作
- 如果账号已存在，不会重复创建或覆盖
- 建议首次启动服务器后，使用预设账号测试登录功能

## 手动初始化（可选）

如果需要手动运行初始化脚本：

```bash
cd server
npm run init:users
```

这会创建所有预设账号（如果不存在）。

## 修改预设账号

如果需要修改预设账号，可以编辑 `server/src/scripts/initDefaultUsers.js` 文件。

**注意：** 修改后需要重启服务器才能生效。

## 安全性建议

**⚠️ 生产环境警告：**

这些预设账号仅用于开发和测试环境。在生产环境中，请：

1. 修改所有预设账号的密码
2. 删除或禁用不使用的预设账号
3. 使用强密码策略
4. 启用密码加密存储（已启用 bcrypt）

## 常见问题

### Q: 为什么登录时提示"角色不匹配"？

A: 确保：
1. 选择了正确的角色（销售员、区域仓库管理员或总仓库管理员）
2. 输入的是对应角色的预设账号
3. 账号的角色与选择的角色一致

### Q: 预设账号密码可以修改吗？

A: 可以。但需要通过数据库直接修改，或者创建新账号替换。

### Q: 可以创建更多预设账号吗？

A: 可以。编辑 `server/src/scripts/initDefaultUsers.js` 文件，在 `defaultUsers` 数组中添加新账号。

## 技术支持

如果遇到问题，请检查：
1. 服务器是否正常运行
2. 数据库连接是否正常
3. 后端日志中是否有错误信息

---

# Preset Accounts Guide

## Overview

The system has automatically created preset accounts for sales staff, regional warehouse managers, and central warehouse managers. These accounts are automatically initialized when the server starts (if they don't exist).

## Preset Accounts List (Latest)

### Sales Staff Accounts (Store Employees)

> For development and debugging, it is recommended to directly use the account on line 1: **East Store 1 Sales Staff 1**.  
> This account is only associated with `East Store 1`, and after logging in, you can fully experience the complete workflow: store sales → inventory changes → automatic replenishment → regional/central warehouse transfer.

| Account              | Password | Name               | Role  | Store           |
|----------------------|----------|--------------------|-------|-----------------|
| east_store1_sales_01 | 123456   | East Store 1 Sales Staff 1 | sales | East Store 1    |
| east_store1_sales_02 | 123456   | East Store 1 Sales Staff 2 | sales | East Store 1    |
| east_store2_sales_01 | 123456   | East Store 2 Sales Staff 1 | sales | East Store 2    |
| east_store2_sales_02 | 123456   | East Store 2 Sales Staff 2 | sales | East Store 2    |
| west_store1_sales_01 | 123456   | West Store 1 Sales Staff 1 | sales | West Store 1    |
| west_store1_sales_02 | 123456   | West Store 1 Sales Staff 2 | sales | West Store 1    |
| west_store2_sales_01 | 123456   | West Store 2 Sales Staff 1 | sales | West Store 2    |
| west_store2_sales_02 | 123456   | West Store 2 Sales Staff 2 | sales | West Store 2    |
| north_store1_sales_01| 123456   | North Store 1 Sales Staff 1 | sales | North Store 1   |
| north_store1_sales_02| 123456   | North Store 1 Sales Staff 2 | sales | North Store 1   |
| north_store2_sales_01| 123456   | North Store 2 Sales Staff 1 | sales | North Store 2   |
| north_store2_sales_02| 123456   | North Store 2 Sales Staff 2 | sales | North Store 2   |
| south_store1_sales_01| 123456   | South Store 1 Sales Staff 1 | sales | South Store 1   |
| south_store1_sales_02| 123456   | South Store 1 Sales Staff 2 | sales | South Store 1   |
| south_store2_sales_01| 123456   | South Store 2 Sales Staff 1 | sales | South Store 2   |
| south_store2_sales_02| 123456   | South Store 2 Sales Staff 2 | sales | South Store 2   |

### Regional Warehouse Manager Accounts

| Account         | Password | Name                | Role            | Regional Warehouse |
|-----------------|----------|---------------------|-----------------|---------------------|
| east_manager_01 | 123456   | East Warehouse Manager 1 | regionalManager | East Warehouse  |
| east_manager_02 | 123456   | East Warehouse Manager 2 | regionalManager | East Warehouse  |
| west_manager_01 | 123456   | West Warehouse Manager 1 | regionalManager | West Warehouse  |
| west_manager_02 | 123456   | West Warehouse Manager 2 | regionalManager | West Warehouse  |
| north_manager_01| 123456   | North Warehouse Manager 1 | regionalManager | North Warehouse |
| north_manager_02| 123456   | North Warehouse Manager 2 | regionalManager | North Warehouse |
| south_manager_01| 123456   | South Warehouse Manager 1 | regionalManager | South Warehouse |
| south_manager_02| 123456   | South Warehouse Manager 2 | regionalManager | South Warehouse |

### Central Warehouse Manager Accounts

| Account    | Password | Name                    | Role           |
|------------|----------|-------------------------|----------------|
| central001 | 123456   | Central Warehouse Manager 1 | centralManager |
| central002 | 123456   | Central Warehouse Manager 2 | centralManager |

## Usage Instructions

### 1. Login as Sales Staff (Recommended: East Store 1 Sales Staff 1)

1. Select "Sales Staff" on the home page
2. Click the "Login" button
3. Enter account: `east_store1_sales_01`
4. Enter password: `123456`
5. Enter verification code (case-insensitive)
6. Click "Login"

After successful login, you will enter the management system and can access:
- Inventory Management
- Sales Orders
- Reports
- Replenishment Application
- Permission Management

### 2. Login as Regional Warehouse Manager

1. Select "Regional Warehouse Manager" on the home page
2. Click the "Login" button
3. Enter account: e.g., `east_manager_01`, `west_manager_01`, etc.
4. Enter password: `123456`
5. Enter verification code (case-insensitive)
6. Click "Login"

After successful login, you will enter the management system and can access:
- Inventory Count
- Shipment Management
- Receiving and Warehousing
- Replenishment Application

### 3. Login as Central Warehouse Manager

1. Select "Central Warehouse Manager" on the home page
2. Click the "Login" button
3. Enter account: `central001` or `central002`
4. Enter password: `123456`
5. Enter verification code (case-insensitive)
6. Click "Login"

After successful login, you will enter the management system and can access:
- Replenishment Approval
- Regional Transfer
- Supplier Management

## Automatic Initialization

When the server starts, the system automatically checks if these preset accounts exist. If they don't exist, they will be automatically created.

**Important Notes:**
- Preset accounts are automatically created, no manual operation needed
- If accounts already exist, they won't be recreated or overwritten
- It's recommended to test login functionality with preset accounts after first server startup

## Manual Initialization (Optional)

If you need to manually run the initialization script:

```bash
cd server
npm run init:users
```

This will create all preset accounts (if they don't exist).

## Modifying Preset Accounts

If you need to modify preset accounts, you can edit the `server/src/scripts/initDefaultUsers.js` file.

**Note:** After modification, you need to restart the server for changes to take effect.

## Security Recommendations

**⚠️ Production Environment Warning:**

These preset accounts are only for development and testing environments. In production environments, please:

1. Change passwords for all preset accounts
2. Delete or disable unused preset accounts
3. Use strong password policies
4. Enable password encryption storage (bcrypt is already enabled)

## Frequently Asked Questions

### Q: Why does it show "Role mismatch" when logging in?

A: Ensure:
1. You selected the correct role (Sales Staff, Regional Warehouse Manager, or Central Warehouse Manager)
2. You entered the preset account for the corresponding role
3. The account's role matches the selected role

### Q: Can preset account passwords be modified?

A: Yes. However, you need to modify directly through the database, or create a new account to replace it.

### Q: Can more preset accounts be created?

A: Yes. Edit the `server/src/scripts/initDefaultUsers.js` file and add new accounts to the `defaultUsers` array.

## Technical Support

If you encounter problems, please check:
1. Is the server running normally
2. Is the database connection normal
3. Are there any error messages in the backend logs
