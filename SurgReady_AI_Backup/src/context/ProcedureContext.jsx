import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { storageService } from '../services/storageService';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

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

  const [isLoadingDb, setIsLoadingDb] = useState(false);
  const [dbError, setDbError] = useState(null);
  const [isDbConnected, setIsDbConnected] = useState(false);

  const selectedProcedure = procedures.find((p) => p.id === selectedProcedureId) || procedures[0];

  /**
   * Fetch Live Patient Cases & Matching Results from Supabase (Phase 7)
   */
  const fetchProceduresFromSupabase = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      setIsDbConnected(false);
      return;
    }

    try {
      setIsLoadingDb(true);
      setDbError(null);

      const { data: dbCases, error } = await supabase
        .from('patient_cases')
        .select(`
          *,
          implant_matching_results (*)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        // Table may not yet be created if migration is pending
        console.warn('[Supabase Sync Notice]', error.message);
        setDbError(error.message);
        setIsDbConnected(false);
        return;
      }

      setIsDbConnected(true);

      if (dbCases && dbCases.length > 0) {
        const mappedCases = dbCases.map((c) => {
          const matchResult = c.implant_matching_results?.[0];
          return {
            id: c.case_id || `SR-2026-${(c.id || '').slice(0, 4)}`,
            dbId: c.id,
            patientId: c.patient_id || c.mrn || 'PT-99100',
            patientName: c.patient_name || c.patient_full_name || 'Patient Case',
            patientAge: c.age || 60,
            patientGender: c.gender || 'Female',
            hospitalId: c.operating_suite_id || 'SJMC-OR-4',
            hospital: c.hospital_name || 'St. Jude Medical Center',
            name: c.procedure_name || 'Orthopedic Procedure',
            code: c.procedure_code || 'CPT 27447',
            type: c.procedure_type || 'Orthopedic Joint Replacement',
            manufacturer: c.manufacturer || 'Stryker',
            systemName: c.system_line_name || 'Triathlon Knee System',
            surgeon: c.lead_surgeon_name || 'Dr. Sarah Jenkins',
            date: c.surgery_date || new Date().toISOString().slice(0, 10),
            time: c.scheduled_or_time || '08:30 AM',
            status: c.case_status === 'Submitted' ? 'Pending Review' : (c.case_status || 'In Progress'),
            priority: c.surgical_priority || 'Elective',
            readiness: c.case_status === 'Approved' ? 95 : c.case_status === 'Completed' ? 100 : 75,
            notes: c.clinical_notes || '',
            matchingStatus: matchResult?.match_status || 'MATCH',
            matchingReason: matchResult?.match_reason || '',
            candidates: c.implant_matching_results || [],
            measurements: {
              varusValgus: c.anatomical_alignment || 'Standard Alignment',
              femoralSizeEst: c.estimated_implant_size || 'Size 5',
              tibialSizeEst: 'Baseplate Size 4',
              jointLineOffset: '+1.5 mm'
            },
            scanInfo: {
              modality: 'Pre-op CT / High-Res Scan',
              scanDate: c.created_at ? c.created_at.slice(0, 10) : new Date().toISOString().slice(0, 10),
              slicesCount: 512,
              thickness: '0.625 mm',
              status: 'AI Processed & Verified',
              fileName: 'PreOp_DICOM_Recon.dcm',
              fileSize: '48.2 MB'
            }
          };
        });

        // Merge database cases with local seed cases to prevent UI disruption
        const localProcs = storageService.getProcedures();
        const existingIds = new Set(mappedCases.map(m => m.id));
        const merged = [...mappedCases, ...localProcs.filter(lp => !existingIds.has(lp.id))];

        setProcedures(merged);
        storageService.saveProcedures(merged);
      }
    } catch (err) {
      console.warn('[Supabase Procedures Fetch Error]', err.message);
      setDbError(err.message);
    } finally {
      setIsLoadingDb(false);
    }
  }, []);

  /**
   * Fetch Live Implant Inventory from Supabase (Phase 8)
   */
  const fetchInventoryFromSupabase = useCallback(async () => {
    if (!isSupabaseConfigured()) return;

    try {
      // 1. Check surgready_implant_stock_status view or surgready_hospital_implant_inventory
      const { data: dbInv, error } = await supabase
        .from('surgready_implant_stock_status')
        .select('*');

      if (!error && dbInv && dbInv.length > 0) {
        const mappedInventory = dbInv.map(item => ({
          id: item.item_id || item.inventory_id,
          item_id: item.item_id,
          name: item.implant_name,
          category: item.category || 'Implants',
          manufacturer: item.manufacturer,
          product_model: item.product_model,
          available_stock: item.available_stock,
          availableQty: item.available_stock,
          minimum_stock_level: item.minimum_stock_level,
          threshold: item.minimum_stock_level,
          unit: item.unit || 'Units',
          stock_status: item.computed_stock_status || (item.available_stock <= 0 ? 'Out of Stock' : item.available_stock <= item.minimum_stock_level ? 'Low Stock' : 'Normal Stock'),
          status: item.computed_stock_status === 'Normal Stock' ? 'In Stock' : item.computed_stock_status,
          anatomical_site: item.anatomical_site || 'Knee',
          material: item.material,
          fixation_type: item.fixation_type,
          available_sizes: item.available_sizes,
          compatibility_doc: item.compatibility_doc,
          last_updated: item.last_updated || new Date().toISOString()
        }));

        setInventory(mappedInventory);
        storageService.saveInventory(mappedInventory);
      }
    } catch (err) {
      console.warn('[Supabase Inventory Fetch Notice]', err.message);
    }
  }, []);

  // Synchronize on mount and when connection changes
  useEffect(() => {
    fetchProceduresFromSupabase();
    fetchInventoryFromSupabase();
  }, [fetchProceduresFromSupabase, fetchInventoryFromSupabase]);

  const refreshData = async () => {
    await Promise.all([
      fetchProceduresFromSupabase(),
      fetchInventoryFromSupabase()
    ]);
  };

  const createProcedure = (newProcedureData) => {
    const newId = newProcedureData.id || `SR-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const completeProcedure = {
      id: newId,
      status: 'In Progress',
      readiness: 45,
      date: newProcedureData.surgeryDate || newProcedureData.date || new Date().toISOString().slice(0, 10),
      time: newProcedureData.surgeryTime || newProcedureData.time || '08:00 AM',
      hospital: newProcedureData.hospital || 'St. Jude Medical Center',
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

    // If Supabase configured, update database
    if (isSupabaseConfigured()) {
      const matchDbCase = procedures.find(p => p.id === procedureId);
      if (matchDbCase?.dbId) {
        supabase
          .from('patient_cases')
          .update({ case_status: newStatus })
          .eq('id', matchDbCase.dbId)
          .catch(() => {});
      }
    }
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

    if (newStatus === 'Normal Stock') {
      nextAlertActive = false;
    } else if ((newStatus === 'Low Stock' || newStatus === 'Out of Stock') && !wasAlertActive) {
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

      const updatedNotifs = storageService.addManagementNotification(triggeredAlert);
      setManagementNotifications(updatedNotifs);

      // Async forward alert to backend
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

    // Update Local Storage
    const updatedInv = storageService.updateInventoryItem(itemId, {
      available_stock: newStockNum,
      availableQty: newStockNum,
      stock_status: newStatus,
      status: newStatus === 'Normal Stock' ? 'In Stock' : newStatus,
      alert_active: nextAlertActive,
      last_updated: new Date().toISOString()
    });
    setInventory(updatedInv);

    // Update Supabase if connected
    if (isSupabaseConfigured()) {
      supabase
        .from('surgready_hospital_implant_inventory')
        .update({
          available_stock: newStockNum,
          stock_status: newStatus,
          last_updated: new Date().toISOString()
        })
        .eq('item_id', item.item_id || item.id)
        .catch(() => {});
    }

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

      const updatedChecklist = { ...current, sections: updatedSections };
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
        activities,
        refreshData,
        isDbConnected,
        isLoadingDb,
        dbError
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
