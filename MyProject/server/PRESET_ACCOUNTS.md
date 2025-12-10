#  Preset Accounts Guide

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
