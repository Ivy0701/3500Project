import { createRouter, createWebHistory } from 'vue-router';
import { useAppStore } from '../store/appStore';

const routes = [
  {
    path: '/',
    name: 'RoleSelect',
    component: () => import('../views/RoleSelectView.vue')
  },
  // Customer side route
  {
    path: '/customer',
    component: () => import('../layouts/CustomerLayout.vue'),
    meta: { requiresAuth: true, allowedRoles: ['customer'] },
    children: [
      {
        path: '',
        redirect: 'shop'
      },
      {
        path: 'shop',
        name: 'CustomerShop',
        component: () => import('../views/CustomerShopView.vue')
      },
      {
        path: 'orders',
        name: 'CustomerOrders',
        component: () => import('../views/CustomerOrdersView.vue')
      },
      {
        path: 'addresses',
        name: 'CustomerAddresses',
        component: () => import('../views/CustomerAddressView.vue')
      },
      {
        path: 'checkout',
        name: 'CustomerCheckout',
        component: () => import('../views/CheckoutView.vue')
      }
    ]
  },
  {
    path: '/customer/register',
    name: 'CustomerRegister',
    component: () => import('../views/RegisterView.vue'),
    meta: { guestOnly: true }
  },
  {
    path: '/customer/login',
    name: 'CustomerLogin',
    component: () => import('../views/LoginView.vue'),
    meta: { guestOnly: true }
  },
  {
    path: '/forgot-password',
    name: 'ForgotPassword',
    component: () => import('../views/ForgotPasswordView.vue'),
    meta: { guestOnly: true }
  },
  {
    path: '/reset-password',
    name: 'ResetPassword',
    component: () => import('../views/ResetPasswordView.vue'),
    meta: { guestOnly: true }
  },
  // Staff login (sales staff/warehouse manager)
  {
    path: '/staff/login',
    name: 'StaffLogin',
    component: () => import('../views/LoginView.vue'),
    meta: { guestOnly: true }
  },
  // Sales staff route
  {
    path: '/app/sales',
    component: () => import('../layouts/MainLayout.vue'),
    meta: { requiresAuth: true, allowedRoles: ['sales'] },
    children: [
      {
        path: '',
        redirect: 'dashboard'
      },
      {
        path: 'dashboard',
        name: 'SalesDashboard',
        component: () => import('../views/DashboardView.vue')
      },
      {
        path: 'customer-orders',
        name: 'SalesCustomerOrders',
        component: () => import('../views/CustomerOrdersView.vue')
      },
      {
        path: 'store-inventory',
        name: 'SalesStoreInventory',
        component: () => import('../views/StoreInventoryView.vue')
      },
      {
        path: 'return-requests',
        name: 'SalesReturnRequests',
        component: () => import('../views/ReturnRequestsView.vue')
      }
    ]
  },
  // Regional warehouse manager route
  {
    path: '/app/regional',
    component: () => import('../layouts/MainLayout.vue'),
    meta: { requiresAuth: true, allowedRoles: ['regionalManager'] },
    children: [
      {
        path: '',
        redirect: 'dashboard'
      },
      {
        path: 'dashboard',
        name: 'RegionalDashboard',
        component: () => import('../views/DashboardView.vue')
      },
      {
        path: 'inventory-count',
        name: 'RegionalInventoryCount',
        component: () => import('../views/InventoryView.vue')
      },
      {
        path: 'dispatch-goods',
        name: 'RegionalDispatchGoods',
        component: () => import('../views/DispatchGoodsView.vue')
      },
      {
        path: 'receive-goods',
        name: 'RegionalReceiveGoods',
        component: () => import('../views/ReceiveGoodsView.vue')
      },
      {
        path: 'replenishment',
        name: 'RegionalReplenishment',
        component: () => import('../views/ReplenishmentView.vue')
      }
    ]
  },
  // Central warehouse manager route
  {
    path: '/app/central',
    component: () => import('../layouts/MainLayout.vue'),
    meta: { requiresAuth: true, allowedRoles: ['centralManager'] },
    children: [
      {
        path: '',
        redirect: 'dashboard'
      },
      {
        path: 'dashboard',
        name: 'CentralDashboard',
        component: () => import('../views/DashboardView.vue')
      },
      {
        path: 'approvals',
        name: 'CentralApprovals',
        component: () => import('../views/ReplenishmentApprovalView.vue')
      },
      {
        path: 'suppliers',
        name: 'CentralSuppliers',
        component: () => import('../views/SupplierManagementView.vue')
      },
      {
        path: 'inventory-count',
        name: 'CentralInventoryCount',
        component: () => import('../views/CentralInventoryCountView.vue')
      }
    ]
  },
  // Compatible with old routes (handle redirection in route guards)
  {
    path: '/app',
    beforeEnter: (to, from, next) => {
      const appStore = useAppStore();
      const role = appStore.user.role;
      if (role === 'sales') {
        next('/app/sales/dashboard');
      } else if (role === 'regionalManager') {
        next('/app/regional/dashboard');
      } else if (role === 'centralManager') {
        next('/app/central/dashboard');
      } else {
        next('/');
      }
    }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// Route guard
router.beforeEach((to, from, next) => {
  const appStore = useAppStore();

  // If not logged in but needs authentication, redirect to role selection page
  if (to.meta.requiresAuth && !appStore.auth.isAuthenticated) {
    next('/');
    return;
  }

  // If logged in but accessing guest page, redirect based on role
  if (to.meta.guestOnly && appStore.auth.isAuthenticated) {
    const role = appStore.user.role;
      if (role === 'customer') {
        next('/customer/shop');
      } else if (role === 'sales') {
        next('/app/sales/dashboard');
      } else if (role === 'regionalManager') {
        next('/app/regional/dashboard');
      } else if (role === 'centralManager') {
        next('/app/central/dashboard');
      } else {
        next('/');
      }
    return;
  }

  // Permission check: check if the role is allowed to access
  if (to.meta.allowedRoles && appStore.auth.isAuthenticated) {
    const userRole = appStore.user.role;
    if (!to.meta.allowedRoles.includes(userRole)) {
      // Role does not match, redirect to the corresponding home page based on the user role
      if (userRole === 'customer') {
        next('/customer/shop');
      } else if (userRole === 'sales') {
        next('/app/sales/dashboard');
      } else if (userRole === 'regionalManager') {
        next('/app/regional/dashboard');
      } else if (userRole === 'centralManager') {
        next('/app/central/dashboard');
      } else {
        next('/');
      }
      return;
    }
  }

  next();
});

export default router;

