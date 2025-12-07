import { defineStore } from 'pinia';

export const useInventoryStore = defineStore('inventory', {
  state: () => ({
    // Track inventory updates for dispatch operations
    dispatchUpdates: [],
    // Track inventory updates for receiving operations
    receivingUpdates: []
  }),
  actions: {
    addDispatchUpdate(update) {
      this.dispatchUpdates.unshift(update);
      // Keep only last 50 updates
      if (this.dispatchUpdates.length > 50) {
        this.dispatchUpdates = this.dispatchUpdates.slice(0, 50);
      }
    },
    addReceivingUpdate(update) {
      this.receivingUpdates.unshift(update);
      // Keep only last 50 updates
      if (this.receivingUpdates.length > 50) {
        this.receivingUpdates = this.receivingUpdates.slice(0, 50);
      }
    }
  }
});

