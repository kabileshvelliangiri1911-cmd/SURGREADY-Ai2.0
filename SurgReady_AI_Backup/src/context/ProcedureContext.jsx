import React, { createContext, useContext, useState } from 'react';
import { storageService } from '../services/storageService';

const ProcedureContext = createContext(null);

export const ProcedureProvider = ({ children }) => {
  const [procedures, setProcedures] = useState(() => storageService.getProcedures());
  const [selectedProcedureId, setSelectedProcedureId] = useState(() => {
    const list = storageService.getProcedures();
    return list.length > 0 ? list[0].id : null;
  });
  const [inventory, setInventory] = useState(() => storageService.getInventory());
  const [inventoryTransactions, setInventoryTransactions] = useState(() => storageService.getInventoryTransactions());
  const [managementNotifications, setManagementNotifications] = useState(() => storageService.getManagementNotifications());
  const [manuals, setManuals] = useState(() => storageService.getManuals());
  const [checklists, setChecklists] = useState(() => storageService.getChecklists());
  const [activities, setActivities] = useState(() => storageService.getActivities());

  const selectedProcedure = procedures.find((p) => p.id === selectedProcedureId) || procedures[0];

  const createProcedure = (newProcedureData) => {
    const newId = `SR-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const completeProcedure = {
      id: newId,
      status: 'In Progress',
      readiness: 45,
      date: newProcedureData.surgeryDate || new Date().toISOString().slice(0, 10),
      time: newProcedureData.surgeryTime || '08:00 AM',
      hospital: 'St. Jude Medical Center',
      ...newProcedureData
    };

    const updated = storageService.addProcedure(completeProcedure);
    setProcedures(updated);
    setSelectedProcedureId(newId);
    
    // Refresh checklists & activities from storage
    setChecklists(storageService.getChecklists());
    setActivities(storageService.getActivities());
    return completeProcedure;
  };

  const updateProcedureStatus = (procedureId, newStatus) => {
    const updated = procedures.map(p => {
      if (p.id === procedureId) {
        return {
          ...p,
          status: newStatus,
          readiness: newStatus === 'Completed' ? 100 : p.readiness
        };
      }
      return p;
    });
    setProcedures(updated);
    storageService.saveProcedures(updated);
  };

  const updateInventoryStock = async (itemId, newQty, reason = "Stock level manual adjustment", updatedBy = "Hospital Management Officer") => {
    const item = inventory.find(i => i.id === itemId || i.item_id === itemId);
    if (!item) return;

    const prevQty = Number(item.available_stock ?? item.availableQty ?? 0);
    const minThreshold = Number(item.minimum_stock_level ?? item.threshold ?? 2);
    const newStockNum = Math.max(0, Number(newQty));
    
    // Determine new status
    const newStatus = newStockNum <= 0 ? 'Out of Stock' : newStockNum <= minThreshold ? 'Low Stock' : 'Normal Stock';
    const wasAlertActive = Boolean(item.alert_active);

    let nextAlertActive = wasAlertActive;
    let triggeredAlert = null;

    // Alert Decision Logic:
    // Case A: Stock returns to Normal -> Re-arm alert
    if (newStatus === 'Normal Stock') {
      nextAlertActive = false;
    }
    // Case B: Stock enters Low Stock / Out of Stock and has not been alerted in this cycle
    else if ((newStatus === 'Low Stock' || newStatus === 'Out of Stock') && !wasAlertActive) {
      nextAlertActive = true;
      triggeredAlert = {
        id: 'NOTIF-' + Date.now(),
        hospital_name: 'St. Jude Medical Center',
        item_id: item.item_id || item.id,
        inventory_item_name: item.name,
        current_stock: newStockNum,
        minimum_stock_level: minThreshold,
        manufacturer: item.manufacturer,
        alert_type: 'LOW_STOCK',
        channel: 'IN_APP_AND_EMAIL',
        recipient_email: 'management@stjude-health.org',
        message: `ALERT: Stock for '${item.name}' reached minimum threshold (${newStockNum}/${minThreshold} ${item.unit || 'Units'}). Immediate restocking recommended.`,
        timestamp: new Date().toISOString(),
        is_read: false
      };

      // Add to notifications
      const updatedNotifs = storageService.addManagementNotification(triggeredAlert);
      setManagementNotifications(updatedNotifs);

      // Async forward alert to FastAPI backend (safe, zero patient info)
      fetch('http://127.0.0.1:8000/api/v1/inventory/items/' + encodeURIComponent(item.item_id || item.id) + '/stock', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          item_id: item.item_id || item.id,
          new_stock: newStockNum,
          reason,
          updated_by: updatedBy
        })
      }).catch(err => console.warn('[Backend Inventory Sync Notice]', err.message));
    }

    // Record Transaction
    const delta = newStockNum - prevQty;
    const actionType = delta > 0 ? 'RESTOCK' : delta < 0 ? 'DEDUCTION' : 'THRESHOLD_ADJUSTMENT';
    const txRecord = {
      id: 'TX-' + Date.now(),
      item_id: item.item_id || item.id,
      item_name: item.name,
      previous_stock: prevQty,
      new_stock: newStockNum,
      change_amount: delta,
      action_type: actionType,
      updated_by: updatedBy,
      notes: reason,
      timestamp: new Date().toISOString()
    };
    const updatedTxs = storageService.addInventoryTransaction(txRecord);
    setInventoryTransactions(updatedTxs);

    // Update Inventory Storage
    const updatedInv = storageService.updateInventoryItem(itemId, {
      available_stock: newStockNum,
      availableQty: newStockNum,
      stock_status: newStatus,
      status: newStatus === 'Normal Stock' ? 'In Stock' : newStatus,
      alert_active: nextAlertActive,
      last_updated: new Date().toISOString()
    });
    setInventory(updatedInv);

    // Log Activity
    const act = storageService.addActivity({
      id: 'act-' + Date.now(),
      user: updatedBy,
      action: actionType === 'RESTOCK' ? 'Restocked Inventory' : 'Adjusted Stock Quantity',
      target: `${item.name}: ${newStockNum} ${item.unit || 'Units'} (${newStatus})`,
      timestamp: 'Just now',
      type: newStatus === 'Out of Stock' ? 'error' : newStatus === 'Low Stock' ? 'warning' : 'info',
      badge: 'Inventory'
    });
    setActivities(act);

    return { item: updatedInv.find(i => i.id === itemId), triggeredAlert, txRecord };
  };

  const markNotificationAsRead = (notifId) => {
    const updated = managementNotifications.map(n => n.id === notifId ? { ...n, is_read: true } : n);
    setManagementNotifications(updated);
    storageService.saveManagementNotifications(updated);
  };

  const addInventoryItem = (item) => {
    const newItem = {
      id: `INV-${Math.floor(2000 + Math.random() * 8000)}`,
      status: item.availableQty <= item.threshold ? 'Low Stock' : 'In Stock',
      ...item
    };
    const updated = storageService.addInventoryItem(newItem);
    setInventory(updated);
    return newItem;
  };

  const toggleChecklistItem = (procedureId, sectionId, itemId) => {
    setChecklists(prev => {
      const current = prev[procedureId] || storageService.getChecklists()[procedureId];
      if (!current) return prev;

      const updatedSections = current.sections.map(section => {
        if (section.id !== sectionId) return section;
        return {
          ...section,
          items: section.items.map(item => {
            if (item.id !== itemId) return item;
            return { ...item, checked: !item.checked };
          })
        };
      });

      const updatedChecklist = {
        ...current,
        sections: updatedSections
      };

      const next = { ...prev, [procedureId]: updatedChecklist };
      storageService.saveChecklists(next);
      return next;
    });
  };

  const addCustomChecklistItem = (procedureId, sectionId, text, isCritical = false) => {
    setChecklists(prev => {
      const current = prev[procedureId] || storageService.getChecklists()[procedureId];
      if (!current) return prev;

      const updatedSections = current.sections.map(sec => {
        if (sec.id !== sectionId) return sec;
        return {
          ...sec,
          items: [
            ...sec.items,
            {
              id: 'custom-' + Date.now(),
              text,
              checked: false,
              critical: isCritical,
              notes: 'Added manually by clinical team'
            }
          ]
        };
      });

      const updatedChecklist = { ...current, sections: updatedSections };
      const next = { ...prev, [procedureId]: updatedChecklist };
      storageService.saveChecklists(next);
      return next;
    });
  };

  const signOffChecklist = (procedureId, roleType, signerName) => {
    setChecklists(prev => {
      const current = prev[procedureId] || storageService.getChecklists()[procedureId];
      if (!current) return prev;

      const now = new Date().toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });

      const newSignOff = {
        ...current.signOff,
        ...(roleType === 'surgeon' ? {
          surgeonSigned: true,
          surgeonSignee: signerName,
          surgeonSignedAt: now
        } : {
          nurseSigned: true,
          nurseSignee: signerName,
          nurseSignedAt: now
        })
      };

      if (newSignOff.surgeonSigned && newSignOff.nurseSigned) {
        newSignOff.reviewStatus = 'Clinically Verified & Cleared';
      }

      const updatedChecklist = { ...current, signOff: newSignOff };
      const next = { ...prev, [procedureId]: updatedChecklist };
      storageService.saveChecklists(next);

      // Also log activity
      const act = storageService.addActivity({
        id: 'act-' + Date.now(),
        user: signerName,
        action: `Signed Surgical Checklist (${roleType === 'surgeon' ? 'Attending Surgeon' : 'Circulating Nurse'})`,
        target: `Procedure ${procedureId}`,
        timestamp: 'Just now',
        type: 'success',
        badge: 'Sign-Off'
      });
      setActivities(act);

      return next;
    });
  };

  const addManual = (manualData) => {
    const newManual = {
      id: `MAN-CUSTOM-${Date.now()}`,
      verified: true,
      releaseDate: new Date().toISOString().slice(0, 10),
      ...manualData
    };
    const updated = storageService.addManual(newManual);
    setManuals(updated);
    return newManual;
  };

  return (
    <ProcedureContext.Provider
      value={{
        procedures,
        selectedProcedureId,
        setSelectedProcedureId,
        selectedProcedure,
        createProcedure,
        updateProcedureStatus,
        inventory,
        inventoryTransactions,
        managementNotifications,
        updateInventoryStock,
        addInventoryItem,
        markNotificationAsRead,
        manuals,
        addManual,
        checklists,
        toggleChecklistItem,
        addCustomChecklistItem,
        signOffChecklist,
        activities
      }}
    >
      {children}
    </ProcedureContext.Provider>
  );
};

export const useProcedure = () => {
  const context = useContext(ProcedureContext);
  if (!context) {
    throw new Error('useProcedure must be used within a ProcedureProvider');
  }
  return context;
};

