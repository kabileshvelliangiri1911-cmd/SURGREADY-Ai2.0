import time
import logging
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone

from app.schemas.inventory import (
    InventoryItemSchema,
    StockUpdateRequest,
    LowStockAlertNotification,
    InventoryTransactionSchema
)

logger = logging.getLogger("surgready.inventory_alerts")

# In-memory realistic initial inventory database
INITIAL_HOSPITAL_INVENTORY: List[Dict[str, Any]] = [
    {
        "item_id": "INV-1001",
        "name": "Triathlon Femoral Component - Size 5 Right",
        "category": "Implants",
        "manufacturer": "Stryker",
        "product_model": "STR-TRI-FEM-05R",
        "available_stock": 4,
        "minimum_stock_level": 2,
        "unit": "Units",
        "last_updated": "2026-11-10T14:30:00Z",
        "stock_status": "Normal Stock",
        "alert_active": False
    },
    {
        "item_id": "INV-1002",
        "name": "Triathlon Universal Tibial Baseplate - Size 4",
        "category": "Implants",
        "manufacturer": "Stryker",
        "product_model": "STR-TRI-TIB-04",
        "available_stock": 2,
        "minimum_stock_level": 2,
        "unit": "Units",
        "last_updated": "2026-11-11T08:15:00Z",
        "stock_status": "Low Stock",
        "alert_active": True
    },
    {
        "item_id": "INV-1003",
        "name": "Bone Cement Vacuum Mixing Bowl & Gun System",
        "category": "Sterilization",
        "manufacturer": "Zimmer Biomet",
        "product_model": "ZIM-BC-VAC-22",
        "available_stock": 1,
        "minimum_stock_level": 3,
        "unit": "Kits",
        "last_updated": "2026-11-11T09:00:00Z",
        "stock_status": "Low Stock",
        "alert_active": True
    },
    {
        "item_id": "INV-1004",
        "name": "Pinnacle Acetabular Cup - 54mm Outer Diameter",
        "category": "Implants",
        "manufacturer": "DePuy Synthes",
        "product_model": "DEP-PIN-CUP-54",
        "available_stock": 6,
        "minimum_stock_level": 2,
        "unit": "Units",
        "last_updated": "2026-11-09T16:45:00Z",
        "stock_status": "Normal Stock",
        "alert_active": False
    },
    {
        "item_id": "INV-1005",
        "name": "Heavy Orthopedic Saw Blades - Sagittal Cut 90mm",
        "category": "Surgical Instruments",
        "manufacturer": "Stryker",
        "product_model": "STR-SAW-BLD-90",
        "available_stock": 0,
        "minimum_stock_level": 5,
        "unit": "Packs",
        "last_updated": "2026-11-11T10:20:00Z",
        "stock_status": "Out of Stock",
        "alert_active": True
    },
    {
        "item_id": "INV-1006",
        "name": "Corail Hip Stem - Standard Offset Size 11",
        "category": "Implants",
        "manufacturer": "DePuy Synthes",
        "product_model": "DEP-COR-STM-11",
        "available_stock": 5,
        "minimum_stock_level": 2,
        "unit": "Units",
        "last_updated": "2026-11-10T11:00:00Z",
        "stock_status": "Normal Stock",
        "alert_active": False
    },
    {
        "item_id": "INV-1007",
        "name": "Disposable Surgical Suction Cannula Tubing",
        "category": "Consumables",
        "manufacturer": "Medtronic",
        "product_model": "MDT-SUC-CAN-08",
        "available_stock": 18,
        "minimum_stock_level": 10,
        "unit": "Box",
        "last_updated": "2026-11-08T12:00:00Z",
        "stock_status": "Normal Stock",
        "alert_active": False
    }
]

class InventoryAlertService:
    """
    Hospital Inventory Management & Low Stock Alert Processing Service.
    
    Guarantees:
    - Automatically checks threshold whenever stock changes.
    - Prevents duplicate alerts when stock is already low.
    - Re-arms alerts when stock returns to normal and later drops again.
    - Dispatches simulated email alerts to authorized hospital management.
    - Maintains comprehensive transaction & alert audit history.
    - NEVER sends patient data in inventory alerts.
    """

    def __init__(self):
        self.inventory: Dict[str, Dict[str, Any]] = {
            item["item_id"]: item.copy() for item in INITIAL_HOSPITAL_INVENTORY
        }
        self.transactions: List[Dict[str, Any]] = []
        self.notifications: List[Dict[str, Any]] = [
            {
                "id": "NOTIF-001",
                "hospital_name": "St. Jude Medical Center",
                "item_id": "INV-1002",
                "inventory_item_name": "Triathlon Universal Tibial Baseplate - Size 4",
                "current_stock": 2,
                "minimum_stock_level": 2,
                "manufacturer": "Stryker",
                "alert_type": "LOW_STOCK",
                "channel": "IN_APP_AND_EMAIL",
                "recipient_email": "management@stjude-health.org",
                "message": "URGENT: Stock at minimum threshold (2/2 Units). Restock recommended.",
                "timestamp": "2026-11-11T08:15:00Z",
                "is_read": False
            },
            {
                "id": "NOTIF-002",
                "hospital_name": "St. Jude Medical Center",
                "item_id": "INV-1005",
                "inventory_item_name": "Heavy Orthopedic Saw Blades - Sagittal Cut 90mm",
                "current_stock": 0,
                "minimum_stock_level": 5,
                "manufacturer": "Stryker",
                "alert_type": "LOW_STOCK",
                "channel": "IN_APP_AND_EMAIL",
                "recipient_email": "management@stjude-health.org",
                "message": "CRITICAL: Item is completely OUT OF STOCK (0/5 Packs). Immediate order required.",
                "timestamp": "2026-11-11T10:20:00Z",
                "is_read": False
            }
        ]

    def get_all_items(
        self,
        status_filter: Optional[str] = None,
        category_filter: Optional[str] = None,
        search: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        items = list(self.inventory.values())

        if status_filter and status_filter.upper() != "ALL":
            items = [i for i in items if i["stock_status"].lower() == status_filter.lower()]

        if category_filter and category_filter.upper() != "ALL":
            items = [i for i in items if i["category"].lower() == category_filter.lower()]

        if search:
            q = search.lower()
            items = [
                i for i in items if (
                    q in i["name"].lower() or
                    q in i["item_id"].lower() or
                    q in i["manufacturer"].lower() or
                    q in i["product_model"].lower()
                )
            ]

        return items

    def update_stock(
        self,
        item_id: str,
        new_stock: int,
        reason: str = "Stock level manual adjustment",
        updated_by: str = "Hospital Management Officer"
    ) -> Dict[str, Any]:
        """
        Updates an item's stock and processes low-stock alert monitoring.
        """
        if item_id not in self.inventory:
            raise ValueError(f"Inventory item '{item_id}' not found.")

        item = self.inventory[item_id]
        prev_stock = item["available_stock"]
        min_threshold = item["minimum_stock_level"]
        now_iso = datetime.now(timezone.utc).isoformat()

        # Determine new status
        if new_stock <= 0:
            new_status = "Out of Stock"
        elif new_stock <= min_threshold:
            new_status = "Low Stock"
        else:
            new_status = "Normal Stock"

        # Record transaction history
        delta = new_stock - prev_stock
        action_type = "RESTOCK" if delta > 0 else "DEDUCTION" if delta < 0 else "THRESHOLD_ADJUSTMENT"
        
        tx_id = f"TX-{int(time.time() * 1000)}"
        tx_record = {
            "id": tx_id,
            "item_id": item_id,
            "item_name": item["name"],
            "previous_stock": prev_stock,
            "new_stock": new_stock,
            "change_amount": delta,
            "action_type": action_type,
            "updated_by": updated_by,
            "notes": reason,
            "timestamp": now_iso
        }
        self.transactions.insert(0, tx_record)

        # Update item fields
        item["available_stock"] = new_stock
        item["stock_status"] = new_status
        item["last_updated"] = now_iso

        alert_dispatched = False
        notification_data = None

        # Alert Logic & De-duplication:
        # Case A: Stock replenished to Normal -> Re-arm alert
        if new_status == "Normal Stock":
            if item.get("alert_active"):
                logger.info(f"Inventory item {item_id} re-armed: Stock returned to normal ({new_stock} > {min_threshold}).")
            item["alert_active"] = False

        # Case B: Stock dropped below or equal to threshold
        elif new_status in ("Low Stock", "Out of Stock"):
            # Check if alert was already sent for this condition (De-duplication)
            if not item.get("alert_active"):
                # Trigger NEW alert
                item["alert_active"] = True
                alert_dispatched = True

                notif_id = f"NOTIF-{int(time.time() * 1000)}"
                notification_data = {
                    "id": notif_id,
                    "hospital_name": "St. Jude Medical Center",
                    "item_id": item_id,
                    "inventory_item_name": item["name"],
                    "current_stock": new_stock,
                    "minimum_stock_level": min_threshold,
                    "manufacturer": item["manufacturer"],
                    "alert_type": "LOW_STOCK",
                    "channel": "IN_APP_AND_EMAIL",
                    "recipient_email": "management@stjude-health.org",
                    "message": f"ALERT: Stock for '{item['name']}' has reached threshold ({new_stock}/{min_threshold} {item['unit']}). Restock required.",
                    "timestamp": now_iso,
                    "is_read": False
                }
                self.notifications.insert(0, notification_data)

                # Simulated Email Dispatch log (Safe - Zero patient data)
                logger.warning(
                    f"[EMAIL DISPATCHED] To: management@stjude-health.org | "
                    f"Subject: [LOW STOCK ALERT] {item['name']} ({new_stock}/{min_threshold} {item['unit']}) at St. Jude Medical Center"
                )
            else:
                logger.info(f"Low-stock alert suppressed for {item_id}: Alert already active for current low-stock cycle.")

        return {
            "item": item,
            "alert_triggered": alert_dispatched,
            "notification": notification_data,
            "transaction": tx_record
        }

    def get_notifications(self) -> List[Dict[str, Any]]:
        return self.notifications

    def get_transactions(self) -> List[Dict[str, Any]]:
        return self.transactions

inventory_alert_service = InventoryAlertService()
