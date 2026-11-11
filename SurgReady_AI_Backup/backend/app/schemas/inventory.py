from typing import Optional, List, Literal
from pydantic import BaseModel, Field

class InventoryItemSchema(BaseModel):
    item_id: str = Field(..., description="Unique Item ID, e.g. INV-1001")
    name: str = Field(..., description="Item Name")
    category: str = Field(..., description="Category, e.g. Implants, Surgical Instruments")
    manufacturer: str = Field(..., description="Manufacturer, e.g. Stryker, Zimmer Biomet")
    product_model: str = Field(..., description="Product Model / SKU")
    available_stock: int = Field(..., ge=0, description="Available Stock Quantity")
    minimum_stock_level: int = Field(..., ge=0, description="Minimum Stock Level threshold")
    unit: str = Field(default="Units", description="Unit of measurement (Box, Units, Kits, Trays)")
    last_updated: str = Field(..., description="ISO 8601 Timestamp of last update")
    stock_status: Literal["Normal Stock", "Low Stock", "Out of Stock"] = Field(
        ..., description="Stock Status determined by threshold"
    )
    alert_active: bool = Field(
        default=False, description="Flag indicating if low-stock alert has already been dispatched"
    )

class StockUpdateRequest(BaseModel):
    item_id: str
    new_stock: int = Field(..., ge=0, description="New stock quantity")
    reason: Optional[str] = Field(default="Stock replenishment / usage adjustment")
    updated_by: Optional[str] = Field(default="Hospital Management Officer")

class LowStockAlertNotification(BaseModel):
    hospital_name: str = Field(default="St. Jude Medical Center")
    inventory_item_name: str
    item_id: str
    current_stock: int
    minimum_stock_level: int
    manufacturer: str
    alert_type: Literal["LOW_STOCK"] = "LOW_STOCK"
    timestamp: str
    recipient_email: str = Field(default="management@stjude-health.org")
    channel: str = Field(default="IN_APP_AND_EMAIL")
    message: str

class InventoryTransactionSchema(BaseModel):
    id: str
    item_id: str
    item_name: str
    previous_stock: int
    new_stock: int
    change_amount: int
    action_type: Literal["RESTOCK", "DEDUCTION", "THRESHOLD_ADJUSTMENT"]
    updated_by: str
    notes: Optional[str] = None
    timestamp: str
