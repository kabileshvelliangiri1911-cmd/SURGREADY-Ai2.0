// LocalStorage service for persistence of procedures, inventory, manuals, and checklists

import {
  INITIAL_PROCEDURES,
  INITIAL_MANUALS,
  INITIAL_INVENTORY,
  INITIAL_CHECKLISTS,
  INITIAL_ACTIVITIES,
  INITIAL_INVENTORY_TRANSACTIONS,
  INITIAL_MANAGEMENT_NOTIFICATIONS,
  DEMO_USERS
} from './mockData';

const KEYS = {
  PROCEDURES: 'surgready_procedures_v1',
  MANUALS: 'surgready_manuals_v1',
  INVENTORY: 'surgready_inventory_v1',
  INVENTORY_TRANSACTIONS: 'surgready_inventory_tx_v1',
  MANAGEMENT_NOTIFICATIONS: 'surgready_mgmt_notif_v1',
  CHECKLISTS: 'surgready_checklists_v1',
  ACTIVITIES: 'surgready_activities_v1',
  CURRENT_USER: 'surgready_current_user_v1',
  SETTINGS: 'surgready_settings_v1',
};

export const storageService = {
  // Procedures
  getProcedures: () => {
    try {
      const data = localStorage.getItem(KEYS.PROCEDURES);
      return data ? JSON.parse(data) : INITIAL_PROCEDURES;
    } catch (e) {
      console.warn('Failed to load procedures from storage', e);
      return INITIAL_PROCEDURES;
    }
  },

  saveProcedures: (procedures) => {
    try {
      localStorage.setItem(KEYS.PROCEDURES, JSON.stringify(procedures));
    } catch (e) {
      console.warn('Failed to save procedures to storage', e);
    }
  },

  addProcedure: (newProc) => {
    const procedures = storageService.getProcedures();
    const updated = [newProc, ...procedures];
    storageService.saveProcedures(updated);
    
    // Add corresponding checklist scaffold
    const checklists = storageService.getChecklists();
    checklists[newProc.id] = {
      procedureId: newProc.id,
      procedureName: newProc.name,
      patientName: `${newProc.patientName || 'Patient'} (${newProc.patientId})`,
      surgeonName: newProc.surgeon || 'Dr. Sarah Jenkins',
      orSuite: newProc.hospitalId || 'OR-Suite 4',
      signOff: {
        surgeonSigned: false,
        surgeonSignee: null,
        surgeonSignedAt: null,
        nurseSigned: false,
        nurseSignee: null,
        nurseSignedAt: null,
        reviewStatus: 'Pending Clinical Review'
      },
      sections: [
        {
          id: 'sec-inst',
          title: 'Required Instruments',
          description: `Primary and accessory instruments for ${newProc.type || 'Surgical Case'}`,
          items: [
            { id: 'gen-1', text: `${newProc.manufacturer || 'OEM'} Primary Instrumentation Set`, checked: false, critical: true, notes: 'Autoclave strip verification required' },
            { id: 'gen-2', text: 'Specialized Sizing & Alignment Jig', checked: false, critical: true, notes: 'Calibrate before incision' },
            { id: 'gen-3', text: 'Power Saw Handpieces & Sterile Blades', checked: false, critical: true, notes: 'Battery levels at 100%' }
          ]
        },
        {
          id: 'sec-impl',
          title: 'Implant Checklist',
          description: 'Components recommended by AI Workbench matching anatomical plan',
          items: [
            { id: 'gen-4', text: `Primary Implant: ${newProc.measurements?.femoralSizeEst || 'Standard Sizing'}`, checked: false, critical: true, notes: 'Verify package sterile barrier' },
            { id: 'gen-5', text: `Secondary Component: ${newProc.measurements?.tibialSizeEst || 'Standard Baseplate'}`, checked: false, critical: true, notes: 'Lot and serial scan required' },
            { id: 'gen-6', text: 'Backup Size Implants available on standby cart', checked: false, critical: false, notes: 'One size up and one size down reserved' }
          ]
        },
        {
          id: 'sec-ster',
          title: 'Sterilization Requirements',
          description: 'Biological & chemical indicator verification',
          items: [
            { id: 'gen-7', text: 'Class 5 Chemical Integrator inside each tray confirmed', checked: false, critical: true, notes: 'Dark color transition' },
            { id: 'gen-8', text: 'Biological Indicator incubation negative', checked: false, critical: true, notes: 'Recorded in central sterile log' }
          ]
        },
        {
          id: 'sec-tray',
          title: 'Tool Tray Requirements',
          description: 'Operating room Mayo stand & back table setup',
          items: [
            { id: 'gen-9', text: 'Suction, cautery, and irrigation lines primed & connected', checked: false, critical: true, notes: 'Pressure tested' },
            { id: 'gen-10', text: 'Cement vacuum mixer & delivery gun tested', checked: false, critical: false, notes: 'Ready on secondary table' }
          ]
        },
        {
          id: 'sec-inv',
          title: 'Inventory & Barcode Verification',
          description: 'RFID scan verification and electronic health record reconciliation',
          items: [
            { id: 'gen-11', text: 'RFID barcode match between physical boxes and SurgReady plan', checked: false, critical: true, notes: 'Scanned at OR circulating station' },
            { id: 'gen-12', text: 'Sterility expiration dates verified > 6 months', checked: false, critical: true, notes: 'All lots in valid date range' }
          ]
        }
      ]
    };
    storageService.saveChecklists(checklists);

    // Add activity
    storageService.addActivity({
      id: 'act-' + Date.now(),
      user: 'Dr. Sarah Jenkins',
      action: 'Created New Procedure Plan',
      target: `${newProc.id} (${newProc.name})`,
      timestamp: 'Just now',
      type: 'info',
      badge: 'New Procedure'
    });

    return updated;
  },

  // Manuals
  getManuals: () => {
    try {
      const data = localStorage.getItem(KEYS.MANUALS);
      return data ? JSON.parse(data) : INITIAL_MANUALS;
    } catch (e) {
      return INITIAL_MANUALS;
    }
  },

  saveManuals: (manuals) => {
    try {
      localStorage.setItem(KEYS.MANUALS, JSON.stringify(manuals));
    } catch (e) {
      console.warn(e);
    }
  },

  addManual: (manual) => {
    const list = storageService.getManuals();
    const updated = [manual, ...list];
    storageService.saveManuals(updated);
    return updated;
  },

  // Inventory
  getInventory: () => {
    try {
      const data = localStorage.getItem(KEYS.INVENTORY);
      const rawList = data ? JSON.parse(data) : INITIAL_INVENTORY;
      return rawList.map(item => {
        const available = Number(item.available_stock ?? item.availableQty ?? 0);
        const threshold = Number(item.minimum_stock_level ?? item.threshold ?? 2);
        const status = available <= 0 ? 'Out of Stock' : available <= threshold ? 'Low Stock' : 'Normal Stock';
        return {
          id: item.item_id || item.id,
          item_id: item.item_id || item.id,
          name: item.name,
          category: item.category || 'Implants',
          manufacturer: item.manufacturer || 'Stryker',
          product_model: item.product_model || item.sku || 'MOD-01',
          sku: item.product_model || item.sku || 'MOD-01',
          available_stock: available,
          availableQty: available,
          minimum_stock_level: threshold,
          threshold: threshold,
          unit: item.unit || 'Units',
          last_updated: item.last_updated || new Date().toISOString(),
          stock_status: status,
          status: status === 'Normal Stock' ? 'In Stock' : status,
          alert_active: item.alert_active ?? (available <= threshold),
          location: item.location || 'OR Central Core',
          lotNumber: item.lotNumber || 'LOT-2026',
          unitCost: item.unitCost || 1200
        };
      });
    } catch (e) {
      return INITIAL_INVENTORY;
    }
  },

  saveInventory: (inventory) => {
    try {
      localStorage.setItem(KEYS.INVENTORY, JSON.stringify(inventory));
    } catch (e) {
      console.warn(e);
    }
  },

  updateInventoryItem: (id, updates) => {
    const list = storageService.getInventory();
    const updated = list.map(item => {
      if (item.id === id || item.item_id === id) {
        const merged = { ...item, ...updates };
        const available = Number(merged.available_stock ?? merged.availableQty ?? 0);
        const threshold = Number(merged.minimum_stock_level ?? merged.threshold ?? 2);
        const status = available <= 0 ? 'Out of Stock' : available <= threshold ? 'Low Stock' : 'Normal Stock';
        return {
          ...merged,
          available_stock: available,
          availableQty: available,
          minimum_stock_level: threshold,
          threshold: threshold,
          stock_status: status,
          status: status === 'Normal Stock' ? 'In Stock' : status,
          last_updated: new Date().toISOString()
        };
      }
      return item;
    });
    storageService.saveInventory(updated);
    return updated;
  },

  addInventoryItem: (item) => {
    const list = storageService.getInventory();
    const available = Number(item.available_stock ?? item.availableQty ?? 0);
    const threshold = Number(item.minimum_stock_level ?? item.threshold ?? 2);
    const status = available <= 0 ? 'Out of Stock' : available <= threshold ? 'Low Stock' : 'Normal Stock';
    const normalized = {
      id: item.item_id || item.id || `INV-${Math.floor(2000 + Math.random() * 8000)}`,
      item_id: item.item_id || item.id || `INV-${Math.floor(2000 + Math.random() * 8000)}`,
      name: item.name,
      category: item.category || 'Implants',
      manufacturer: item.manufacturer || 'Stryker',
      product_model: item.product_model || item.sku || 'MOD-01',
      sku: item.product_model || item.sku || 'MOD-01',
      available_stock: available,
      availableQty: available,
      minimum_stock_level: threshold,
      threshold: threshold,
      unit: item.unit || 'Units',
      last_updated: new Date().toISOString(),
      stock_status: status,
      status: status === 'Normal Stock' ? 'In Stock' : status,
      alert_active: available <= threshold,
      location: item.location || 'OR Central Core',
      lotNumber: item.lotNumber || 'LOT-NEW',
      unitCost: item.unitCost || 1200
    };
    const updated = [normalized, ...list];
    storageService.saveInventory(updated);
    return updated;
  },

  // Inventory Transactions History
  getInventoryTransactions: () => {
    try {
      const data = localStorage.getItem(KEYS.INVENTORY_TRANSACTIONS);
      return data ? JSON.parse(data) : INITIAL_INVENTORY_TRANSACTIONS;
    } catch (e) {
      return INITIAL_INVENTORY_TRANSACTIONS;
    }
  },

  saveInventoryTransactions: (transactions) => {
    try {
      localStorage.setItem(KEYS.INVENTORY_TRANSACTIONS, JSON.stringify(transactions));
    } catch (e) {
      console.warn(e);
    }
  },

  addInventoryTransaction: (tx) => {
    const list = storageService.getInventoryTransactions();
    const updated = [tx, ...list];
    storageService.saveInventoryTransactions(updated);
    return updated;
  },

  // Management Notifications History
  getManagementNotifications: () => {
    try {
      const data = localStorage.getItem(KEYS.MANAGEMENT_NOTIFICATIONS);
      return data ? JSON.parse(data) : INITIAL_MANAGEMENT_NOTIFICATIONS;
    } catch (e) {
      return INITIAL_MANAGEMENT_NOTIFICATIONS;
    }
  },

  saveManagementNotifications: (notifs) => {
    try {
      localStorage.setItem(KEYS.MANAGEMENT_NOTIFICATIONS, JSON.stringify(notifs));
    } catch (e) {
      console.warn(e);
    }
  },

  addManagementNotification: (notif) => {
    const list = storageService.getManagementNotifications();
    const updated = [notif, ...list];
    storageService.saveManagementNotifications(updated);
    return updated;
  },

  // Checklists
  getChecklists: () => {
    try {
      const data = localStorage.getItem(KEYS.CHECKLISTS);
      return data ? JSON.parse(data) : INITIAL_CHECKLISTS;
    } catch (e) {
      return INITIAL_CHECKLISTS;
    }
  },

  saveChecklists: (checklists) => {
    try {
      localStorage.setItem(KEYS.CHECKLISTS, JSON.stringify(checklists));
    } catch (e) {
      console.warn(e);
    }
  },

  // Activities
  getActivities: () => {
    try {
      const data = localStorage.getItem(KEYS.ACTIVITIES);
      return data ? JSON.parse(data) : INITIAL_ACTIVITIES;
    } catch (e) {
      return INITIAL_ACTIVITIES;
    }
  },

  addActivity: (act) => {
    const list = storageService.getActivities();
    const updated = [act, ...list.slice(0, 20)];
    try {
      localStorage.setItem(KEYS.ACTIVITIES, JSON.stringify(updated));
    } catch (e) {}
    return updated;
  },

  // User
  getCurrentUser: () => {
    try {
      const data = localStorage.getItem(KEYS.CURRENT_USER);
      return data ? JSON.parse(data) : DEMO_USERS[0];
    } catch (e) {
      return DEMO_USERS[0];
    }
  },

  setCurrentUser: (user) => {
    try {
      localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(user));
    } catch (e) {}
  },

  // Settings
  getSettings: () => {
    try {
      const data = localStorage.getItem(KEYS.SETTINGS);
      return data ? JSON.parse(data) : {
        hospitalName: 'St. Jude Medical Center',
        campus: 'Main Surgical Pavilion - Tower A',
        department: 'Department of Orthopedic Surgery',
        traumaLevel: 'Level 1 Trauma Center',
        orSuitesCount: 16,
        defaultManufacturer: 'Stryker',
        units: 'metric',
        notifications: {
          checklistSignoff: true,
          lowStockAlerts: true,
          aiAnalysisComplete: true,
          scheduleChanges: true
        },
        highContrast: false,
        autoSaveMinutes: 2
      };
    } catch (e) {
      return {};
    }
  },

  saveSettings: (settings) => {
    try {
      localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
    } catch (e) {}
  },

  // Reset to demo defaults
  resetAll: () => {
    localStorage.removeItem(KEYS.PROCEDURES);
    localStorage.removeItem(KEYS.MANUALS);
    localStorage.removeItem(KEYS.INVENTORY);
    localStorage.removeItem(KEYS.CHECKLISTS);
    localStorage.removeItem(KEYS.ACTIVITIES);
    localStorage.removeItem(KEYS.SETTINGS);
    return true;
  }
};

