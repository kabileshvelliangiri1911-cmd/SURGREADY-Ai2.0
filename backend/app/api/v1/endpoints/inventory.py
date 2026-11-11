from typing import Optional, List
from fastapi import APIRouter, HTTPException, Query, status
from app.schemas.inventory import (
    InventoryItemSchema,
    StockUpdateRequest,
    LowStockAlertNotification,
    InventoryTransactionSchema
)
from app.services.inventory_alert_service import inventory_alert_service

router = APIRouter()

@router.get(
    "/items",
    summary="Retrieve Hospital Inventory Items with Stock Filtering"
)
async def get_inventory_items(
    status: Optional[str] = Query(None, description="Filter: Normal Stock, Low Stock, Out of Stock, or ALL"),
    category: Optional[str] = Query(None, description="Filter by category or ALL"),
    search: Optional[str] = Query(None, description="Search term across name, SKU, manufacturer")
):
    """
    Returns hospital surgical inventory records with status filtering,
    threshold metrics, and low-stock indicators.
    """
    items = inventory_alert_service.get_all_items(
        status_filter=status,
        category_filter=category,
        search=search
    )
    return {
        "success": True,
        "total": len(items),
        "items": items
    }

@router.put(
    "/items/{item_id}/stock",
    summary="Update Stock Quantity & Process Low-Stock Alert Monitoring"
)
async def update_inventory_stock(item_id: str, request: StockUpdateRequest):
    """
    Updates the stock quantity of a specific inventory item.
    - Evaluates available stock against minimum stock level.
    - Automatically triggers a LOW_STOCK notification if threshold is reached.
    - De-duplicates alerts to prevent spamming.
    - Records the audit transaction in inventory history.
    """
    try:
        result = inventory_alert_service.update_stock(
            item_id=item_id,
            new_stock=request.new_stock,
            reason=request.reason,
            updated_by=request.updated_by
        )
        return {
            "success": True,
            "data": result["item"],
            "alert_triggered": result["alert_triggered"],
            "notification": result["notification"],
            "transaction": result["transaction"]
        }
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )

@router.get(
    "/transactions",
    summary="Retrieve Inventory Transaction History Audit Log"
)
async def get_inventory_transactions():
    """
    Returns chronological audit history of all inventory restocks, deductions,
    and adjustments with actor information.
    """
    return {
        "success": True,
        "transactions": inventory_alert_service.get_transactions()
    }

@router.get(
    "/notifications",
    summary="Retrieve Hospital Management Low-Stock Alert History"
)
async def get_inventory_notifications():
    """
    Returns the log of in-app and email notifications dispatched to
    Hospital Management for low-stock and critical inventory levels.
    """
    return {
        "success": True,
        "notifications": inventory_alert_service.get_notifications()
    }
