// Export utility for SurgReady AI checklists, inventory, and procedural reports

export const exportService = {
  // Export checklist to CSV
  exportChecklistCSV: (checklist) => {
    if (!checklist || !checklist.sections) return;
    
    let csv = `SurgReady AI - Surgical Checklist\n`;
    csv += `Procedure,${checklist.procedureName}\n`;
    csv += `Patient,${checklist.patientName}\n`;
    csv += `Surgeon,${checklist.surgeonName}\n`;
    csv += `OR Suite,${checklist.orSuite}\n`;
    csv += `Clinical Review Status,${checklist.signOff?.reviewStatus || 'Pending'}\n`;
    csv += `Surgeon Sign-off,${checklist.signOff?.surgeonSignee || 'None'} (${checklist.signOff?.surgeonSignedAt || 'Unsigned'})\n`;
    csv += `Nurse Sign-off,${checklist.signOff?.nurseSignee || 'None'} (${checklist.signOff?.nurseSignedAt || 'Unsigned'})\n\n`;
    
    csv += `Section,Item Description,Critical,Status,Clinical Notes\n`;
    
    checklist.sections.forEach(section => {
      section.items.forEach(item => {
        const row = [
          `"${section.title}"`,
          `"${item.text.replace(/"/g, '""')}"`,
          item.critical ? 'CRITICAL' : 'Standard',
          item.checked ? 'VERIFIED' : 'PENDING',
          `"${(item.notes || '').replace(/"/g, '""')}"`
        ];
        csv += row.join(',') + '\n';
      });
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `SurgReady_Checklist_${checklist.procedureId || 'Procedure'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },

  // Export inventory to CSV
  exportInventoryCSV: (inventory) => {
    if (!inventory || !inventory.length) return;

    let csv = `SurgReady AI - Operating Room Inventory Audit\n`;
    csv += `Exported At,${new Date().toLocaleString()}\n\n`;
    csv += `SKU,Item Name,Category,Manufacturer,Available Qty,Required Qty,Status,Location,Lot Number,Sterility Expiry\n`;

    inventory.forEach(item => {
      const row = [
        `"${item.sku}"`,
        `"${item.name.replace(/"/g, '""')}"`,
        `"${item.category}"`,
        `"${item.manufacturer}"`,
        item.availableQty,
        item.requiredQty,
        `"${item.status}"`,
        `"${item.location}"`,
        `"${item.lotNumber || 'N/A'}"`,
        `"${item.expiryDate || 'N/A'}"`
      ];
      csv += row.join(',') + '\n';
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `SurgReady_Inventory_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },

  // Export report summary
  exportReportSummary: (reportData, format = 'json') => {
    if (format === 'json') {
      const jsonStr = JSON.stringify(reportData, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `SurgReady_Executive_Report_${new Date().toISOString().slice(0, 10)}.json`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } else {
      window.print();
    }
  },

  // Print helper
  triggerPrint: () => {
    window.print();
  }
};

