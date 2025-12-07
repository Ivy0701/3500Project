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
