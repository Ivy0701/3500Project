import { defineStore } from 'pinia';
import { login as loginApi, register as registerApi } from '../services/authService';

const getDefaultUser = () => ({
  name: 'Guest',
  role: 'Guest',
  account: ''
});

const translateCnName = (name) => {
  if (!name || /[A-Za-z]/.test(name)) return name || '';
  const mapRegion = { '华东': 'East', '华西': 'West', '华南': 'South', '华北': 'North' };
  let n = name;
  n = n.replace(/^总仓库管理员(\d+)/, 'Central Warehouse Manager $1');
  Object.entries(mapRegion).forEach(([cn, en]) => {
    n = n.replace(new RegExp(cn + '仓管(\\d+)', 'g'), `${en} Warehouse Manager $1`);
    n = n.replace(new RegExp(cn + '门店(\\d+)店员(\\d+)', 'g'), `${en} Store $1 Staff $2`);
  });
  return n;
};

export const useAppStore = defineStore('app', {
  state: () => ({
    user: getDefaultUser(),
    auth: {
      isAuthenticated: false,
      token: null
    },
    selectedRole: null, // 当前选择的角色：customer, sales, regionalManager, centralManager
    alerts: [
      {
        id: 'SKU-001',
        name: 'Smart Handheld Terminal',
        stock: 12,
        unit: 'units',
        threshold: 20,
        status: 'Low Stock',
        level: 'danger'
      },
      {
        id: 'SKU-009',
        name: 'Logistics Scanner',
        stock: 5,
        unit: 'units',
        threshold: 10,
        status: 'Critically Low',
        level: 'danger'
      }
    ],
    tasks: [
      {
        id: 'task-1',
        title: 'Review Sales Order SO-20240123',
        desc: 'Confirm inventory and arrange shipping plan',
        deadline: 'Today 17:00',
        priority: 'warning',
        priorityLabel: 'High',
        role: 'sales'
      },
      {
        id: 'task-2',
        title: 'Handle Replenishment Request RA-8811',
        desc: 'Confirm supplier and estimated arrival time',
        deadline: 'Tomorrow 10:00',
        priority: 'default',
        priorityLabel: 'Medium',
        role: 'sales'
      },
      {
        id: 'task-3',
        title: 'Cycle Count - East China Warehouse',
        desc: 'Complete shelf A/B counting and update discrepancies',
        deadline: 'Today 11:00',
        priority: 'warning',
        priorityLabel: 'High',
        role: 'regionalManager'
      },
      {
        id: 'task-4',
        title: 'Dispatch TRF-20251125-011',
        desc: 'Arrange transport to South China hub',
        deadline: 'Today 15:30',
        priority: 'info',
        priorityLabel: 'Medium',
        role: 'regionalManager'
      },
      {
        id: 'task-5',
        title: 'Approve RA-20251128-018',
        desc: 'Check jogger pants replenishment plan',
        deadline: 'Today 14:00',
        priority: 'warning',
        priorityLabel: 'High',
        role: 'centralManager'
      },
      {
        id: 'task-6',
        title: 'Supplier SLA Review',
        desc: 'Update JingCai Technology 2026 SLA clauses',
        deadline: 'Friday 17:00',
        priority: 'default',
        priorityLabel: 'Medium',
        role: 'centralManager'
      }
    ]
  }),
  actions: {
    async login(credentials) {
      const { user, token } = await loginApi(credentials);
      this.setSession(user, token);
      return true;
    },
    async register(payload) {
      const { user, token } = await registerApi(payload);
      this.setSession(user, token);
      return true;
    },
    setSession(user, token) {
      this.user = { ...user, name: translateCnName(user.name) };
      this.auth.isAuthenticated = true;
      this.auth.token = token;
      // 根据用户角色设置selectedRole
      if (user.role) {
        this.selectedRole = user.role;
      }
      window.sessionStorage.setItem('app-auth', JSON.stringify({ user, token }));
    },
    hydrateFromStorage() {
      const stored = window.sessionStorage.getItem('app-auth');
      if (stored) {
        const { user, token } = JSON.parse(stored);
        if (user && token) {
          this.user = { ...user, name: translateCnName(user.name) };
          this.auth.isAuthenticated = true;
          this.auth.token = token;
          // 恢复角色信息
          if (user.role) {
            this.selectedRole = user.role;
          }
        }
      }
    },
    logout() {
      this.user = getDefaultUser();
      this.auth.isAuthenticated = false;
      this.auth.token = null;
      this.selectedRole = null;
      window.sessionStorage.removeItem('app-auth');
      window.sessionStorage.removeItem('selectedRole');
    },
    normalizeUserName() {
      this.user = { ...this.user, name: translateCnName(this.user.name) };
    }
  }
});
