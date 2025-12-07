<template>
  <div class="permissions">
    <section class="card">
      <h2 class="section-title">User List</h2>
      <div class="list">
        <button
          v-for="user in users"
          :key="user.id"
          class="list-item permissions__user"
          :class="{ 'permissions__user--active': activeUserId === user.id }"
          type="button"
          @click="selectUser(user.id)"
        >
          <div class="permissions__user-row">
            <span>{{ user.name }}</span>
            <span class="tag">{{ user.role }}</span>
          </div>
          <div class="permissions__user-meta">
            <span>Status: {{ user.status }}</span>
            <span>Last Login: {{ user.lastLogin }}</span>
          </div>
        </button>
      </div>
    </section>

    <section class="card">
      <h2 class="section-title">Permission Matrix</h2>
      <div class="permissions__matrix">
        <div class="permissions__matrix-row permissions__matrix-header">
          <span class="module">Module</span>
          <span>View</span>
          <span>Edit</span>
          <span>Approve</span>
        </div>
        <div
          v-for="entry in permissionMatrix"
          :key="entry.module"
          class="permissions__matrix-row"
        >
          <span class="module">{{ entry.module }}</span>
          <label>
            <input type="checkbox" :checked="entry.view" @change="togglePermission(entry.module, 'view', $event)" />
          </label>
          <label>
            <input type="checkbox" :checked="entry.edit" @change="togglePermission(entry.module, 'edit', $event)" />
          </label>
          <label>
            <input
              type="checkbox"
              :checked="entry.approve"
              @change="togglePermission(entry.module, 'approve', $event)"
            />
          </label>
        </div>
      </div>
      <button class="btn-primary permissions__save" type="button" @click="savePermissions">
        Save Permission Changes
      </button>
    </section>

    <section class="card">
      <h2 class="section-title">Role Management</h2>
      <div class="permissions__role-actions">
        <button class="btn-secondary" type="button" @click="createRole">Create Role</button>
        <button class="btn-secondary" type="button" @click="duplicateRole">Duplicate Role</button>
      </div>
      <div class="permissions__role-list">
        <div v-for="role in roles" :key="role.name" class="permissions__role-item">
          <span class="permissions__role-name">{{ role.name }}</span>
          <span class="permissions__role-desc">{{ role.desc }}</span>
        </div>
      </div>
    </section>

    <section class="card">
      <h2 class="section-title">Operation Logs</h2>
      <div class="list">
        <div v-for="log in logs" :key="log.time" class="list-item permissions__log">
          <span>{{ log.time }}</span>
          <span>{{ log.action }}</span>
          <span>{{ log.user }}</span>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue';

const users = reactive([
  {
    id: 'U-001',
    name: 'Li Min',
    role: 'Warehouse Manager',
    status: 'Enabled',
    lastLogin: '2024-01-12 09:21'
  },
  {
    id: 'U-002',
    name: 'Wang Lei',
    role: 'Sales Supervisor',
    status: 'Enabled',
    lastLogin: '2024-01-12 08:53'
  },
  {
    id: 'U-003',
    name: 'Chen Rong',
    role: 'Procurement Manager',
    status: 'Disabled',
    lastLogin: '2024-01-09 17:40'
  }
]);

const activeUserId = ref(users[0].id);

const permissionMatrix = reactive([
  { module: 'Inventory Management', view: true, edit: true, approve: false },
  { module: 'Sales Orders', view: true, edit: false, approve: true },
  { module: 'Replenishment', view: true, edit: true, approve: true },
  { module: 'Inventory Reports', view: true, edit: false, approve: false },
  { module: 'Permissions', view: false, edit: false, approve: false }
]);

const roles = reactive([
  { name: 'Warehouse Manager', desc: 'Manage inventory information, handle replenishment requests' },
  { name: 'Sales Supervisor', desc: 'Create and approve orders, view reports' },
  { name: 'System Administrator', desc: 'Configure permissions, maintain system data' }
]);

const logs = reactive([
  { time: '2024-01-12 09:30', action: 'Adjusted warehouse manager permissions', user: 'System Administrator' },
  { time: '2024-01-11 16:15', action: 'Added role: Regional Manager', user: 'System Administrator' },
  { time: '2024-01-10 10:05', action: 'Disabled user: Chen Rong', user: 'System Administrator' }
]);

const selectUser = (id) => {
  activeUserId.value = id;
  window.alert('User switched (demo)');
};

const togglePermission = (module, field, event) => {
  const record = permissionMatrix.find((entry) => entry.module === module);
  if (record) {
    record[field] = event.target.checked;
  }
};

const savePermissions = () => {
  window.alert('Permission changes saved (demo)');
};

const createRole = () => {
  window.alert('Open role creation dialog (demo)');
};

const duplicateRole = () => {
  window.alert('Role template duplicated (demo)');
};
</script>

<style scoped>
.permissions {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
  gap: 24px;
}

.permissions__user {
  text-align: left;
}

.permissions__user--active {
  border: 1px solid rgba(43, 181, 192, 0.4);
}

.permissions__user-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
  color: var(--color-text);
}

.permissions__user-meta {
  display: flex;
  justify-content: space-between;
  color: #9ca3af;
  font-size: 13px;
}

.permissions__matrix {
  border-radius: 16px;
  border: 1px solid var(--color-border);
  overflow: hidden;
}

.permissions__matrix-row {
  display: grid;
  grid-template-columns: 2fr repeat(3, 1fr);
  align-items: center;
  padding: 12px 16px;
  gap: 12px;
}

.permissions__matrix-header {
  background-color: var(--color-surface-alt);
  font-weight: 600;
  color: var(--color-text-muted);
}

.permissions__matrix-row:not(.permissions__matrix-header) {
  border-top: 1px solid var(--color-border);
}

.permissions__matrix-row .module {
  font-weight: 600;
  color: var(--color-text);
}

.permissions__matrix-row input[type='checkbox'] {
  width: 16px;
  height: 16px;
}

.permissions__save {
  margin-top: 16px;
  width: 100%;
}

.permissions__role-actions {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.permissions__role-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.permissions__role-item {
  background-color: #ffffff;
  border-radius: 12px;
  padding: 16px;
  box-shadow: var(--shadow-soft);
}

.permissions__role-name {
  font-weight: 600;
}

.permissions__role-desc {
  margin-top: 6px;
  color: var(--color-text-muted);
}

.permissions__log {
  display: flex;
  justify-content: space-between;
  color: var(--color-text-muted);
}

@media (max-width: 960px) {
  .permissions {
    grid-template-columns: 1fr;
  }
}
</style>

