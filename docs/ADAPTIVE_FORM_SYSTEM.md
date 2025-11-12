# Adaptive Form Display System

## Overview

The Adaptive Form Display System automatically detects and renders different form structures in the approval board. It supports both known form types (COPC, Purchase Request, Leave Request, etc.) and automatically adapts to completely new form structures.

## How It Works

### 1. Automatic Detection
The system analyzes the `custom_form_response.form_data` structure and:
- Detects form type based on field patterns
- Identifies array fields for table display
- Categorizes individual fields by type (date, currency, text, etc.)
- Generates appropriate column headers and formatting
- **Computes missing summary fields** (totals, balances, etc.)

### 2. Form Type Detection with Smart Computation
```typescript
// COPC structure detection with computed fields
if (formData.transactions || formData.pettyCashHolder || formData.totalPettyCash) {
  formType = 'copc';
  // Auto-computes: Total Amount, Remaining Balance
}
// Purchase request structure with calculations
else if (formData.items || formData.requestType || formData.vendor) {
  formType = 'purchase_request';
  // Auto-computes: Item totals, Tax calculations, Grand Total
}
```

### 3. Dynamic Field Processing with Smart Calculations
- **Arrays**: Automatically converted to tables with smart column detection
- **Dates**: Formatted according to locale (MMM dd, yyyy format)
- **Currency**: PHP peso (₱) formatting with proper number formatting
- **Status/Type fields**: Rendered as colored badges
- **Summary Fields**: Auto-calculated from array data when missing
- **Computed Balances**: Remaining balances calculated automatically

## Adding Support for New Form Types

### Method 1: Add Predefined Form Type (Recommended for recurring forms)

1. **Update Form Type Detection** in `ticket-display.util.ts`:
```typescript
// Add your detection logic
else if (formData.yourField || formData.anotherField) {
  formType = 'your_form_type';
}
```

2. **Add Generator Method**:
```typescript
private static generateYourFormDisplay(ticket: Ticket, formData: any, structure: any): any {
  const header = {
    title: formData.formTitle || 'YOUR FORM TITLE',
    status: ticket.status
  };

  const fields = [];
  if (formData.yourDate) fields.push({ 
    label: 'Your Date', 
    value: formData.yourDate, 
    type: 'date', 
    displayType: 'date' as const 
  });
  // Add more fields...

  const tables = [];
  if (formData.yourArray && Array.isArray(formData.yourArray)) {
    tables.push({
      title: 'Your Data Table',
      data: formData.yourArray,
      columns: [
        { key: 'id', label: 'ID', type: 'text', align: 'left' as const },
        { key: 'amount', label: 'AMOUNT', type: 'currency', align: 'right' as const },
        // Define your columns...
      ]
    });
  }

  const summary = [];
  if (formData.totalAmount) summary.push({ 
    label: 'Total Amount', 
    value: formData.totalAmount, 
    type: 'total' as const 
  });

  return { header, fields, tables, summary, actions: ['approve', 'reject'] };
}
```

3. **Update Switch Statement**:
```typescript
switch (structure.formType) {
  case 'your_form_type':
    return this.generateYourFormDisplay(ticket, formData, structure);
  // ... other cases
}
```

### Method 2: Zero-Code Solution (Automatic for any new form)

**No code changes needed!** The system automatically:

1. **Detects Arrays**: Any array field becomes a table
2. **Smart Field Types**: Automatically detects dates, currency, emails, etc.
3. **Summary Detection**: Fields with 'total', 'sum', 'amount' become summary rows
4. **Badge Fields**: Fields with 'status', 'type', 'priority' become badges

### Example: COPC Replenishment with Computed Fields

Submit this COPC structure:
```json
{
  "form_data": {
    "date": "2024-03-15",
    "pettyCashHolder": "John Doe",
    "department": "Finance",
    "totalPettyCash": "10000.00",
    "transactions": [
      {
        "date": "2024-03-10",
        "invoiceNumber": "INV-001",
        "copcNumber": "COPC-001", 
        "description": "Office Supplies",
        "amount": "2500.00"
      },
      {
        "date": "2024-03-12",
        "invoiceNumber": "INV-002", 
        "copcNumber": "COPC-002",
        "description": "Transportation",
        "amount": "1200.00"
      }
    ]
  }
}
```

**Automatically renders as:**
- Header: "PCF REPLENISHMENT" + status badge
- Fields: Date (Mar 15, 2024), Petty Cash Holder, Department
- Table: Petty Cash Breakdown with proper date/currency formatting
- Summary: 
  - **Total Amount**: PHP 3,700.00 (auto-calculated from transactions)
  - **Total Petty Cash**: PHP 10,000.00 (from form data)
  - **Remaining Balance**: PHP 6,300.00 (auto-computed: totalPettyCash - totalAmount)

### Example: Purchase Request with Auto-Calculations

```json
{
  "form_data": {
    "requestDate": "2024-03-15",
    "requestor": "Jane Smith",
    "department": "IT",
    "items": [
      {
        "itemCode": "IT001",
        "description": "Laptop",
        "quantity": 2,
        "unitPrice": "25000.00",
        "total": "50000.00"
      },
      {
        "itemCode": "IT002",
        "description": "Monitor", 
        "quantity": 4,
        "unitPrice": "8000.00",
        "total": "32000.00"
      }
    ],
    "tax": "9840.00"
  }
}
```

**Automatically renders as:**
- Header: "PURCHASE REQUEST" + status
- Fields: Request Date, Requestor, Department
- Table: Requested Items with right-aligned currency
- Summary:
  - **Total Amount**: PHP 82,000.00 (calculated from items)
  - **Tax**: PHP 9,840.00 (from form data)
  - **Grand Total**: PHP 91,840.00 (auto-computed: total + tax)

## Field Type Detection

The system automatically detects field types:

### Currency Fields
- **Pattern**: Contains numbers with/without currency symbols
- **Keywords**: 'amount', 'price', 'cost', 'total', 'sum', 'cash', 'money', 'fee', 'charge'
- **Formatting**: PHP peso (₱) with proper locale formatting

### Date Fields
- **Pattern**: ISO date format (YYYY-MM-DD) or date objects
- **Formatting**: Localized date display

### Badge Fields
- **Keywords**: 'status', 'type', 'category', 'priority', 'urgency'
- **Styling**: Colored badges based on values

### ID/Reference Fields
- **Keywords**: 'id', 'number', 'code', 'ref', 'index', 'sequence', 'order'
- **Behavior**: Excluded from totals, treated as text

## Performance Features

### Intelligent Caching
- Field type detection cached by value+type+fieldName
- Column generation cached by object keys
- Field name formatting cached

### Optimized Rendering
- OnPush change detection strategy
- TrackBy functions for efficient DOM updates
- Pre-compiled regex patterns

### Memory Management
```typescript
// Clear caches when component destroyed
ngOnDestroy() {
  TicketDisplayUtil.clearCaches();
}
```

## Usage Examples

### Basic Implementation
```html
<!-- Toggle between views -->
<div class="form-check form-switch">
  <input [(ngModel)]="useAdaptiveView" class="form-check-input" type="checkbox">
  <label class="form-check-label">Adaptive View</label>
</div>

<!-- Adaptive display -->
<app-adaptive-form-display 
  *ngIf="useAdaptiveView"
  [ticket]="selectedTicket">
</app-adaptive-form-display>

<!-- Traditional table view -->
<app-form-data-table 
  *ngIf="!useAdaptiveView"
  [ticket]="selectedTicket">
</app-form-data-table>
```

### Debug Mode
```html
<app-adaptive-form-display 
  [ticket]="selectedTicket"
  [showDebugInfo]="true">
</app-adaptive-form-display>
```

## Benefits

1. **Zero Configuration**: New forms work automatically
2. **Consistent UI**: Professional styling matching your COPC sample
3. **Performance**: Intelligent caching and optimization
4. **Flexibility**: Easy to customize for specific form types
5. **Maintainable**: Clean separation of concerns
6. **Future-Proof**: Adapts to any JSON structure

## API Reference

### TicketDisplayUtil.getAdaptiveFormDisplay(ticket)
Returns structured display data for any ticket form.

### TicketDisplayUtil.processCustomFormData(customFormData)
Analyzes form structure and returns metadata.

### TicketDisplayUtil.clearCaches()
Clears all performance caches (call on component destroy).

## Migration Guide

### From FormDataTableComponent to AdaptiveFormDisplayComponent

**Before:**
```html
<app-form-data-table [ticket]="ticket"></app-form-data-table>
```

**After:**
```html
<app-adaptive-form-display [ticket]="ticket"></app-adaptive-form-display>
```

The adaptive component includes all table functionality plus enhanced form rendering.