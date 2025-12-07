import mongoose from 'mongoose';
import ReplenishmentAlert from '../models/ReplenishmentAlert.js';
import ReplenishmentRequest from '../models/ReplenishmentRequest.js';
import Inventory from '../models/Inventory.js';
import TransferOrder from '../models/TransferOrder.js';
import ReceivingSchedule from '../models/ReceivingSchedule.js';
import { adjustInventory } from '../services/inventoryService.js';

const genRequestId = () => {
  const now = new Date();
  return `REQ-${now.toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(Math.random() * 900 + 100)}`;
};

export const getReplenishmentAlerts = async (req, res, next) => {
  try {
    const user = req.user;
    let filter = {};
    
    // 如果是区域仓库管理员，只返回其负责仓库的警报
    if (user && user.role === 'regionalManager' && user.assignedLocationId) {
      filter.warehouseId = user.assignedLocationId;
    } else if (user && user.role === 'regionalManager' && user.accessibleLocationIds && user.accessibleLocationIds.length > 0) {
      // 如果使用 accessibleLocationIds，过滤仓库相关的警报
      const warehouseIds = user.accessibleLocationIds.filter(id => id.startsWith('WH-'));
      if (warehouseIds.length > 0) {
        filter.warehouseId = { $in: warehouseIds };
      }
    }
    // 中央管理员可以看到所有警报，不需要过滤
    
    // 将中文的 alert trigger 转换为英文
    const translateAlertTrigger = (text) => {
      if (!text) return text;
      return text
        .replace(/库存低于总库存的30% \(当前: (\d+) < (\d+)\)/g, 'Inventory below 30% of total stock (current: $1 < $2)')
        .replace(/区域仓库库存低于总库存的30% \(当前: (\d+) < (\d+)\)/g, 'Regional warehouse inventory below 30% of total stock (current: $1 < $2)')
        .replace(/库存低于安全阈值 \(当前: (\d+) < (\d+)\)/g, 'Inventory below safety threshold (current: $1 < $2)')
        .replace(/库存低于安全阈值 \(当前: (\d+)\)/g, 'Inventory below safety threshold (current: $1)');
    };

    const alerts = await ReplenishmentAlert.find(filter).sort({ createdAt: -1 });
    
    // 转换 alert 中的中文 trigger 为英文，并更新数据库
    for (const alert of alerts) {
      if (alert.trigger && /[\u4e00-\u9fa5]/.test(alert.trigger)) {
        const englishTrigger = translateAlertTrigger(alert.trigger);
        if (englishTrigger !== alert.trigger) {
          alert.trigger = englishTrigger;
          await alert.save();
        }
      }
    }
    
    res.json(alerts);
  } catch (error) {
    next(error);
  }
};

export const getReplenishmentProgress = async (req, res, next) => {
  try {
    const user = req.user;
    let filter = {};
    
    // 如果是区域仓库管理员，只返回其负责仓库的进度
    if (user && user.role === 'regionalManager' && user.assignedLocationId) {
      filter.warehouseId = user.assignedLocationId;
    } else if (user && user.role === 'regionalManager' && user.accessibleLocationIds && user.accessibleLocationIds.length > 0) {
      const warehouseIds = user.accessibleLocationIds.filter(id => id.startsWith('WH-'));
      if (warehouseIds.length > 0) {
        filter.warehouseId = { $in: warehouseIds };
      }
    }
    
    const requests = await ReplenishmentRequest.find(filter).sort({ createdAt: -1 }).limit(10);
    const progress = requests
      .flatMap((req) =>
        req.progress.map((step) => ({
          title: step.title,
          desc: step.desc,
          status: step.status,
          time: step.timestamp,
          requestId: req.requestId
        }))
      )
      .sort((a, b) => new Date(b.time) - new Date(a.time))
      .slice(0, 20);

    res.json(progress);
  } catch (error) {
    next(error);
  }
};

export const submitReplenishmentApplication = async (req, res, next) => {
  try {
    const {
      alertId,
      productId,
      productName,
      vendor,
      quantity,
      deliveryDate,
      remark,
      warehouseId,
      warehouseName,
      reason
    } = req.body;

    if (!productId || !vendor || !quantity || !deliveryDate || !warehouseId || !warehouseName) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    if (quantity <= 0) {
      return res.status(400).json({ message: 'Quantity must be greater than 0' });
    }

    // 将中文的 remark 和 reason 转换为英文
    const translateToEnglish = (text) => {
      if (!text) return text;
      // 替换中文文本为英文
      return text
        .replace(/库存低于总库存的30% \(当前: (\d+) < (\d+)\)/g, 'Inventory below 30% of total stock (current: $1 < $2)')
        .replace(/区域仓库库存低于总库存的30% \(当前: (\d+) < (\d+)\)/g, 'Regional warehouse inventory below 30% of total stock (current: $1 < $2)')
        .replace(/库存低于安全阈值 \(当前: (\d+) < (\d+)\)/g, 'Inventory below safety threshold (current: $1 < $2)')
        .replace(/库存低于安全阈值 \(当前: (\d+)\)/g, 'Inventory below safety threshold (current: $1)');
    };

    const now = new Date();
    const request = await ReplenishmentRequest.create({
      requestId: genRequestId(),
      productId,
      productName: productName || productId,
      vendor,
      quantity,
      deliveryDate,
      remark: translateToEnglish(remark),
      warehouseId,
      warehouseName,
      reason: translateToEnglish(reason) || 'Safety stock alert',
      status: 'PENDING',
      progress: [
        {
          title: 'Replenishment Alert Generated',
          desc: `${productName || productId} below threshold at ${warehouseName}`,
          status: 'completed',
          timestamp: now
        },
        {
          title: 'Application Submitted',
          desc: `${warehouseName} requested ${quantity} units from ${vendor}`,
          status: 'completed',
          timestamp: now
        },
        {
          title: 'Waiting for Approval',
          desc: 'Awaiting central approval',
          status: 'processing',
          timestamp: now
        }
      ]
    });

    if (alertId) {
      await ReplenishmentAlert.findOneAndDelete({ alertId });
    }

    // 根据用户角色和仓库ID过滤返回的数据
    const user = req.user;
    let alertFilter = {};
    let progressFilter = {};
    
    // 如果是区域仓库管理员，只返回其负责仓库的警报和进度
    if (user && user.role === 'regionalManager') {
      if (user.assignedLocationId) {
        alertFilter.warehouseId = user.assignedLocationId;
        progressFilter.warehouseId = user.assignedLocationId;
      } else if (user.accessibleLocationIds && user.accessibleLocationIds.length > 0) {
        const warehouseIds = user.accessibleLocationIds.filter(id => id.startsWith('WH-'));
        if (warehouseIds.length > 0) {
          alertFilter.warehouseId = { $in: warehouseIds };
          progressFilter.warehouseId = { $in: warehouseIds };
        }
      }
    }
    // 中央管理员可以看到所有数据，不需要过滤

    // 将中文的 alert trigger 转换为英文
    const translateAlertTrigger = (text) => {
      if (!text) return text;
      return text
        .replace(/库存低于总库存的30% \(当前: (\d+) < (\d+)\)/g, 'Inventory below 30% of total stock (current: $1 < $2)')
        .replace(/区域仓库库存低于总库存的30% \(当前: (\d+) < (\d+)\)/g, 'Regional warehouse inventory below 30% of total stock (current: $1 < $2)')
        .replace(/库存低于安全阈值 \(当前: (\d+) < (\d+)\)/g, 'Inventory below safety threshold (current: $1 < $2)')
        .replace(/库存低于安全阈值 \(当前: (\d+)\)/g, 'Inventory below safety threshold (current: $1)');
    };

    const [alerts, progress] = await Promise.all([
      ReplenishmentAlert.find(alertFilter).sort({ createdAt: -1 }),
      ReplenishmentRequest.find(progressFilter).sort({ createdAt: -1 }).limit(10)
    ]);

    // 转换 alert 中的中文 trigger 为英文，并更新数据库
    for (const alert of alerts) {
      if (alert.trigger && /[\u4e00-\u9fa5]/.test(alert.trigger)) {
        const englishTrigger = translateAlertTrigger(alert.trigger);
        if (englishTrigger !== alert.trigger) {
          alert.trigger = englishTrigger;
          await alert.save();
        }
      }
    }

    const progressEntries = progress
      .flatMap((reqItem) =>
        reqItem.progress.map((step) => ({
          title: step.title,
          desc: step.desc,
          status: step.status,
          time: step.timestamp,
          requestId: reqItem.requestId
        }))
      )
      .sort((a, b) => new Date(b.time) - new Date(a.time))
      .slice(0, 20);

    res.status(201).json({
      request,
      alerts,
      progress: progressEntries
    });
  } catch (error) {
    next(error);
  }
};

export const getReplenishmentApplications = async (req, res, next) => {
  try {
    const { status, warehouseId } = req.query;
    const user = req.user;
    const filter = {};
    
    if (status && status !== 'ALL') {
      filter.status = status;
    }
    
    // 如果是区域仓库管理员，只返回其负责仓库的申请
    if (user && user.role === 'regionalManager') {
      if (warehouseId) {
        filter.warehouseId = warehouseId;
      } else if (user.assignedLocationId) {
        filter.warehouseId = user.assignedLocationId;
      } else if (user.accessibleLocationIds && user.accessibleLocationIds.length > 0) {
        const warehouseIds = user.accessibleLocationIds.filter(id => id.startsWith('WH-'));
        if (warehouseIds.length > 0) {
          filter.warehouseId = { $in: warehouseIds };
        }
      }
    } else if (warehouseId) {
      filter.warehouseId = warehouseId;
    }
    
    // 总仓库管理员只应该看到区域仓库向总仓库的补货申请
    // 区域仓库向总仓库的补货申请：vendor 为 'Central Warehouse'
    // 门店向区域仓库的补货申请：vendor 为空字符串或区域仓库名称，不应该显示给总仓库管理员
    if (user && user.role === 'centralManager') {
      filter.vendor = 'Central Warehouse';
    }
    
    const applications = await ReplenishmentRequest.find(filter).sort({ createdAt: -1 });
    res.json(applications);
  } catch (error) {
    next(error);
  }
};

export const updateReplenishmentApplicationStatus = async (req, res, next) => {
  const session = await mongoose.startSession();
  try {
    const { requestId } = req.params;
    const { decision, remark } = req.body;

    if (!['APPROVED', 'REJECTED'].includes(decision)) {
      return res.status(400).json({ message: 'Invalid decision' });
    }

    const request = await ReplenishmentRequest.findOne({ requestId }).session(session);
    if (!request) {
      return res.status(404).json({ message: 'Application not found' });
    }

    await session.withTransaction(async () => {
      request.status = decision === 'APPROVED' ? 'APPROVED' : 'REJECTED';
      request.progress.push({
        title: decision === 'APPROVED' ? 'Application Approved' : 'Application Rejected',
        desc: remark || (decision === 'APPROVED' ? 'Approved by central manager' : 'Rejected by central manager'),
        status: 'completed',
        timestamp: new Date()
      });
      await request.save({ session });

      // 如果请求被拒绝，重新创建 ReplenishmentAlert，使其重新出现在区域仓库管理员的 alerts 中
      if (decision === 'REJECTED') {
        // 获取当前库存信息
        const inventory = await Inventory.findOne({
          productId: request.productId,
          locationId: request.warehouseId
        }).session(session);

        if (inventory) {
          const available = inventory.available || 0;
          const totalStock = inventory.totalStock || 0;
          
          // 如果库存仍然低于阈值，重新创建 alert
          let shouldCreateAlert = false;
          let threshold30Percent = 0;
          let triggerText = '';
          let suggestedQty = 0;
          let shortageQty = 0;
          
          if (totalStock > 0) {
            threshold30Percent = totalStock * 0.3;
            if (available < threshold30Percent) {
              shouldCreateAlert = true;
              suggestedQty = Math.max(0, Math.ceil(totalStock * 0.9 - available));
              shortageQty = Math.max(0, Math.ceil(threshold30Percent - available));
              triggerText = `Regional warehouse inventory below 30% of total stock (current: ${available} < ${Math.ceil(threshold30Percent)})`;
            }
          } else {
            // 如果没有 totalStock，使用默认阈值
            const defaultThreshold = 50;
            if (available < defaultThreshold) {
              shouldCreateAlert = true;
              suggestedQty = Math.max(50, Math.ceil(defaultThreshold - available));
              shortageQty = Math.max(0, Math.ceil(defaultThreshold - available));
              triggerText = `Inventory below safety threshold (current: ${available} < ${defaultThreshold})`;
            }
          }
          
          if (shouldCreateAlert) {
            const alertId = `ALERT-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
            await ReplenishmentAlert.findOneAndUpdate(
              { productId: request.productId, warehouseId: request.warehouseId },
              {
                alertId,
                productId: request.productId,
                productName: request.productName || inventory.productName || request.productId,
                stock: available,
                suggested: suggestedQty > 0 ? suggestedQty : Math.max(50, shortageQty),
                trigger: triggerText,
                warehouseId: request.warehouseId,
                warehouseName: request.warehouseName || inventory.locationName || request.warehouseId,
                level: available < (threshold30Percent * 0.5 || 25) ? 'danger' : 'warning',
                levelLabel: available < (threshold30Percent * 0.5 || 25) ? 'Urgent' : 'Warning',
                threshold: totalStock > 0 ? Math.ceil(threshold30Percent) : 50,
                shortageQty: shortageQty
              },
              { upsert: true, new: true, session }
            );
          }
        }
      }

      // 注意：批准后不再自动创建调拨单
      // 调拨单应该由前端通过 Allocate Commodities 表单手动创建
      // 这样可以允许总仓库管理员选择从哪个仓库调货
    });

    const updatedRequest = await ReplenishmentRequest.findOne({ requestId });
    res.json(updatedRequest);
  } catch (error) {
    next(error);
  } finally {
    session.endSession();
  }
};

// Check inventory and create replenishment alerts for low stock items
export const checkAndCreateReplenishmentAlerts = async (_req, res, next) => {
  try {
    const targetProducts = ['PROD-001', 'PROD-002', 'PROD-003', 'PROD-004', 'PROD-005', 'PROD-006'];
    const regionalWarehouses = ['WH-EAST', 'WH-WEST', 'WH-NORTH', 'WH-SOUTH'];
    
    const createdAlerts = [];
    
    // 检查每个区域仓库中的指定产品
    for (const warehouseId of regionalWarehouses) {
      for (const productId of targetProducts) {
        const inventory = await Inventory.findOne({
          productId,
          locationId: warehouseId
        });
        
        if (inventory && inventory.totalStock > 0) {
          const threshold30Percent = inventory.totalStock * 0.3;
          
          // 如果available < totalStock * 0.3，创建或更新alert
          if (inventory.available < threshold30Percent) {
            // 检查是否已有未完成的补货申请
            const existingRequest = await ReplenishmentRequest.findOne({
              productId,
              warehouseId,
              status: { $in: ['PENDING', 'PROCESSING', 'APPROVED'] }
            });
            
            // 如果没有未完成的申请，创建或更新alert
            if (!existingRequest) {
              const alertId = `ALERT-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
              const suggestedQty = Math.max(0, Math.ceil(inventory.totalStock * 0.9 - inventory.available)); // 建议补到90%
              const shortageQty = Math.ceil(threshold30Percent - inventory.available); // 缺货数量
              
              const alert = await ReplenishmentAlert.findOneAndUpdate(
                { productId, warehouseId },
                {
                  alertId,
                  productId,
                  productName: inventory.productName || productId,
                  stock: inventory.available,
                  suggested: suggestedQty > 0 ? suggestedQty : Math.ceil(threshold30Percent),
                  trigger: `Regional warehouse inventory below 30% of total stock (current: ${inventory.available} < ${Math.ceil(threshold30Percent)})`,
                  warehouseId,
                  warehouseName: inventory.locationName || warehouseId,
                  level: inventory.available < threshold30Percent * 0.5 ? 'danger' : 'warning',
                  levelLabel: inventory.available < threshold30Percent * 0.5 ? 'Urgent' : 'Warning',
                  threshold: Math.ceil(threshold30Percent),
                  shortageQty: shortageQty > 0 ? shortageQty : 0 // Shortage quantity
                },
                { upsert: true, new: true }
              );
              
              createdAlerts.push(alert);
            }
          } else {
            // 如果库存已恢复，删除对应的alert
            await ReplenishmentAlert.findOneAndDelete({ productId, warehouseId });
          }
        }
      }
    }
    
    res.json({ 
      message: 'Inventory check completed',
      alertsCreated: createdAlerts.length,
      alerts: createdAlerts
    });
  } catch (error) {
    next(error);
  }
};

// Create replenishment alerts for low stock items from frontend
export const createAlertsForLowStockItems = async (req, res, next) => {
  try {
    const { items } = req.body;
    
    if (!Array.isArray(items) || items.length === 0) {
      return res.json({ 
        message: 'No low stock items provided',
        alertsCreated: 0,
        alerts: []
      });
    }
    
    const createdAlerts = [];
    
    for (const item of items) {
      const { productId, productName, locationId, locationName, available, totalStock, threshold } = item;
      
      if (!productId || !locationId) {
        continue;
      }
      
      // 检查是否已存在alert
      const existingAlert = await ReplenishmentAlert.findOne({
        productId,
        warehouseId: locationId
      });
      
      // 只要商品是low stock状态，就应该创建或更新alert
      // 无论是否有未完成的申请，都应该显示alert（因为申请可能被拒绝，或者需要再次补货）
      
        // 计算缺货数量：如果totalStock存在，使用30%阈值；否则使用threshold
      let shortageQty = 0;
      let suggestedQty = 0;
      let triggerText = '';
      
      if (totalStock && totalStock > 0) {
        const threshold30Percent = totalStock * 0.3;
          shortageQty = Math.max(0, Math.ceil(threshold30Percent - available));
          suggestedQty = Math.max(0, Math.ceil(totalStock * 0.9 - available));
        triggerText = `Inventory below 30% of total stock (current: ${available} < ${Math.ceil(threshold30Percent)})`;
      } else if (threshold && threshold > 0) {
          shortageQty = Math.max(0, Math.ceil(threshold - available));
          suggestedQty = Math.max(0, Math.ceil((threshold * 3) - available)); // 近似为 totalStock=threshold/0.3, 0.9*totalStock=3*threshold
        triggerText = `Inventory below safety threshold (current: ${available} < ${threshold})`;
      } else {
        shortageQty = Math.max(0, Math.ceil(50 - available)); // 默认阈值50
        suggestedQty = Math.max(0, Math.ceil(100 - available));
        triggerText = `Inventory below safety threshold (current: ${available})`;
      }
      
      const alertId = existingAlert?.alertId || `ALERT-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
      
      const alert = await ReplenishmentAlert.findOneAndUpdate(
        { productId, warehouseId: locationId },
        {
          alertId,
          productId,
          productName: productName || productId,
          stock: available,
          suggested: suggestedQty > 0 ? suggestedQty : Math.max(50, shortageQty),
          trigger: triggerText,
          warehouseId: locationId,
          warehouseName: locationName || locationId,
          level: available === 0 ? 'danger' : 'warning',
          levelLabel: available === 0 ? 'Urgent' : 'Warning',
          threshold: totalStock ? Math.ceil(totalStock * 0.3) : (threshold || 50),
          shortageQty: shortageQty
        },
        { upsert: true, new: true }
      );
      
      createdAlerts.push(alert);
    }
    
    res.json({ 
      message: 'Alerts created for low stock items',
      alertsCreated: createdAlerts.length,
      alerts: createdAlerts
    });
  } catch (error) {
    next(error);
  }
};

