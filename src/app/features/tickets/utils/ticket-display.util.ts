import { Ticket } from '../models/ticket.interface';

export class TicketDisplayUtil {
  // Cache for expensive operations
  private static readonly fieldTypeCache = new Map<string, string>();
  private static readonly columnCache = new Map<string, Array<{ key: string; label: string; type?: string }>>();
  private static readonly formattedNameCache = new Map<string, string>();

  // Compiled regex patterns for better performance
  private static readonly DATE_PATTERN = /^\d{4}-\d{2}-\d{2}/;
  private static readonly CURRENCY_PATTERN = /^\$?\d+(\.\d{2})?$|^\d{1,3}(,\d{3})*(\.\d{2})?$/;
  private static readonly EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  private static readonly URL_PATTERN = /^https?:\/\//;
  
  // Field name patterns for better identification
  private static readonly ID_KEYWORDS = ['id', 'number', 'code', 'ref', 'index', 'sequence', 'order'];
  private static readonly CURRENCY_KEYWORDS = ['amount', 'price', 'cost', 'total', 'sum', 'cash', 'money', 'fee', 'charge'];
  private static readonly EXCLUDED_TOTAL_FIELDS = [
    'id', 'ID', 'Id', 'number', 'Number', 'NUM', 'code', 'Code', 'CODE',
    'reference', 'Reference', 'ref', 'Ref', 'index', 'Index',
    'sequence', 'Sequence', 'seq', 'order', 'Order', 'orderId', 'orderNumber'
  ];
  /**
   * Format ticket description for display with proper line breaks
   */
  static formatDescription(ticket: Ticket): string {
    return ticket.description.replace(/\n/g, '<br>');
  }

  /**
   * Get a short summary of the ticket for list views
   */
  static getShortSummary(ticket: Ticket): string {
    const maxLength = 100;
    const description = ticket.description.replace(/\n/g, ' ');
    
    if (description.length <= maxLength) {
      return description;
    }
    
    return description.substring(0, maxLength) + '...';
  }

  /**
   * Get form type display name
   */
  static getFormTypeDisplayName(ticket: Ticket): string {
    const formType = ticket.customFormData?.formType;
    if (!formType) return 'General';
    
    // Convert kebab-case to Title Case
    return formType
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  /**
   * Get category display with icon
   */
  static getCategoryDisplay(ticket: Ticket): { name: string; icon: string; color: string } {
    const category = ticket.customFormData?.category || 'General';
    
    const categoryMap: Record<string, { icon: string; color: string }> = {
      'Finance': { icon: 'dollar-sign', color: 'text-success' },
      'HR': { icon: 'users', color: 'text-info' },
      'IT': { icon: 'laptop', color: 'text-warning' },
      'Operations': { icon: 'cog', color: 'text-secondary' },
      'General': { icon: 'file-text', color: 'text-primary' }
    };
    
    const config = categoryMap[category] || categoryMap['General'];
    
    return {
      name: category,
      icon: config.icon,
      color: config.color
    };
  }

  /**
   * Get workflow stage progress information
   */
  static getWorkflowProgress(ticket: Ticket): { stage: string; isFinal: boolean; order: number } {
    const workflowStage = ticket.customFormData?.workflowStage;
    
    return {
      stage: workflowStage?.name || 'Unknown',
      isFinal: workflowStage?.is_final || false,
      order: workflowStage?.order || 0
    };
  }

  /**
   * Enhanced form data processor to handle different form structures
   */
  static processCustomFormData(customFormData: any): {
    hasArrayData: boolean;
    formType: string;
    structureVersion: string;
    arrayFields: string[];
    metadata: any;
  } {
    if (!customFormData?.formData) {
      return {
        hasArrayData: false,
        formType: 'unknown',
        structureVersion: 'v1',
        arrayFields: [],
        metadata: null
      };
    }

    const formData = customFormData.formData;
    const arrayFields: string[] = [];
    
    // Detect array fields dynamically
    for (const [key, value] of Object.entries(formData)) {
      if (Array.isArray(value) && value.length > 0) {
        arrayFields.push(key);
      }
    }

    // Detect form structure type
    let formType = 'generic';
    let structureVersion = 'v1';
    
    // COPC structure detection
    if (formData.transactions || formData.pettyCashHolder || formData.totalPettyCash) {
      formType = 'copc';
    }
    // Purchase request structure
    else if (formData.items || formData.requestType || formData.vendor) {
      formType = 'purchase_request';
    }
    // Leave request structure
    else if (formData.leaveType || formData.startDate || formData.endDate) {
      formType = 'leave_request';
    }
    // Expense report structure
    else if (formData.expenses || formData.receipts || formData.reimbursement) {
      formType = 'expense_report';
    }
    // Detect structure version based on field patterns
    if (formData.hasOwnProperty('created_at') || formData.hasOwnProperty('updated_at')) {
      structureVersion = 'v2'; // Laravel timestamps pattern
    } else if (formData.hasOwnProperty('createdAt') || formData.hasOwnProperty('updatedAt')) {
      structureVersion = 'v3'; // JavaScript camelCase pattern
    }

    return {
      hasArrayData: arrayFields.length > 0,
      formType,
      structureVersion,
      arrayFields,
      metadata: {
        totalFields: Object.keys(formData).length,
        customFormId: customFormData.formId,
        workflowStage: customFormData.workflowStage?.name,
        referenceId: customFormData.referenceId
      }
    };
  }

  /**
   * Get form data summary based on detected structure
   */
  static getAdaptiveFormDataSummary(ticket: Ticket): string {
    const customFormData = ticket.customFormData;
    if (!customFormData?.formData) {
      return ticket.description;
    }
    
    const structure = this.processCustomFormData(customFormData);
    const formData = customFormData.formData;
    
    switch (structure.formType) {
      case 'copc':
        if (formData.totalPettyCash && formData.pettyCashHolder) {
          return `Petty Cash: ${formData.totalPettyCash} - Holder: ${formData.pettyCashHolder}`;
        }
        break;
        
      case 'purchase_request':
        if (formData.requestType && formData.totalAmount) {
          return `${formData.requestType}: ${formData.totalAmount}${formData.vendor ? ' - ' + formData.vendor : ''}`;
        }
        break;
        
      case 'leave_request':
        if (formData.leaveType && formData.days) {
          return `${formData.leaveType}: ${formData.days} days`;
        }
        break;
        
      case 'expense_report':
        if (formData.totalAmount && formData.department) {
          return `Expense: ${formData.totalAmount} - ${formData.department}`;
        }
        break;
    }
    
    // Generic fallback - show key fields with array counts
    const keys = Object.keys(formData).slice(0, 2);
    const summary = keys.map(key => {
      const value = formData[key];
      if (Array.isArray(value)) {
        return `${this.formatFieldName(key)}: ${value.length} items`;
      }
      return `${this.formatFieldName(key)}: ${value}`;
    }).join(', ');
    
    return summary || ticket.description;
  }

  /**
   * Enhanced adaptive form renderer that can handle any form structure
   */
  static getAdaptiveFormDisplay(ticket: Ticket): {
    header: { title: string; status: string };
    fields: Array<{ label: string; value: string; type: string; displayType: 'field' | 'badge' | 'date' | 'currency' }>;
    tables: Array<{
      title: string;
      data: any[];
      columns: Array<{ key: string; label: string; type?: string; align?: 'left' | 'right' | 'center' }>;
    }>;
    summary: Array<{ label: string; value: string; type: 'total' | 'subtotal' | 'balance' }>;
    actions: string[];
  } {
    const customFormData = ticket.customFormData;
    
    if (!customFormData?.formData) {
      return this.getDefaultFormDisplay(ticket);
    }

    const structure = this.processCustomFormData(customFormData);
    const formData = customFormData.formData;
    
    // Generate form display based on detected structure
    switch (structure.formType) {
      case 'copc':
        return this.generateCOPCDisplay(ticket, formData, structure);
      default:
        return this.generateGenericFormDisplay(ticket, formData, structure);
    }
  }

  /**
   * Generate COPC-specific display matching your sample with computed fields
   */
  private static generateCOPCDisplay(ticket: Ticket, formData: any, structure: any): any {
    // Header
    const header = null;

    // Main fields (non-array, non-summary fields)
    const fields = [];
    if (formData.date) {
      fields.push({
        label: 'Date',
        value: formData.date,
        type: 'date',
        displayType: 'date' as const
      });
    }
    if (formData.pettyCashHolder) {
      fields.push({
        label: 'Petty Cash Holder',
        value: formData.pettyCashHolder,
        type: 'text',
        displayType: 'field' as const
      });
    }
    if (formData.department) {
      fields.push({
        label: 'Department',
        value: formData.department,
        type: 'text',
        displayType: 'field' as const
      });
    }

    // Tables - transactions with proper column mapping
    const tables = [];
    if (formData.transactions && Array.isArray(formData.transactions)) {
      tables.push({
        title: 'Petty Cash Breakdown',
        data: formData.transactions,
        columns: [
          { key: 'date', label: 'DATE OF TRANSACTION', type: 'date', align: 'left' as const },
          { key: 'invoiceNumber', label: 'INVOICE NUMBER', type: 'text', align: 'left' as const },
          { key: 'copcNumber', label: 'COPC NUMBER', type: 'text', align: 'left' as const },
          { key: 'description', label: 'DESCRIPTION', type: 'text', align: 'left' as const },
          { key: 'amount', label: 'AMOUNT', type: 'currency', align: 'right' as const }
        ]
      });
    }

    // Summary calculations with computed fields
    const summary = [];
    
    // Calculate total amount from transactions
    let calculatedTotalAmount = 0;
    if (formData.transactions && Array.isArray(formData.transactions)) {
      calculatedTotalAmount = formData.transactions.reduce((sum: number, transaction: any) => {
        const amount = parseFloat(String(transaction.amount || '0').replace(/[^\d.]/g, '')) || 0;
        return sum + amount;
      }, 0);
    }

    // Get total petty cash (base amount)
    const totalPettyCash = parseFloat(String(formData.totalPettyCash || '0').replace(/[^\d.]/g, '')) || 0;

    // Calculate remaining balance
    const remainingBalance = totalPettyCash - calculatedTotalAmount;

    // Add summary items
    summary.push({
      label: 'Total Amount',
      value: calculatedTotalAmount.toFixed(2),
      type: 'subtotal' as const
    });

    if (formData.totalPettyCash) {
      summary.push({
        label: 'Total Petty Cash',
        value: totalPettyCash.toFixed(2),
        type: 'total' as const
      });
    }

    // Add calculated remaining balance
    summary.push({
      label: 'Remaining Balance',
      value: remainingBalance.toFixed(2),
      type: 'balance' as const
    });

    return { header, fields, tables, summary, actions: ['approve', 'reject'] };
  }

  /**
   * Generate generic display for unknown form types with smart computations
   */
  private static generateGenericFormDisplay(ticket: Ticket, formData: any, structure: any): any {
    const header = {
      title: formData.formTitle || formData.title || ticket.title || 'FORM SUBMISSION',
      status: ticket.status
    };

    // Automatically detect and categorize fields
    const fields = [];
    const excludedFromFields = ['id', 'created_at', 'updated_at', 'createdAt', 'updatedAt', 'formTitle', 'title'];
    
    for (const [key, value] of Object.entries(formData)) {
      if (!Array.isArray(value) && !excludedFromFields.includes(key)) {
        const fieldType = this.detectFieldType(value, key);
        let displayType: 'field' | 'badge' | 'date' | 'currency' = 'field';
        
        if (fieldType === 'date') displayType = 'date';
        else if (fieldType === 'currency') displayType = 'currency';
        else if (['status', 'type', 'category', 'priority', 'urgency'].some(term => key.toLowerCase().includes(term))) {
          displayType = 'badge';
        }

        fields.push({
          label: this.formatFieldName(key),
          value: String(value),
          type: fieldType,
          displayType
        });
      }
    }

    // Automatically detect tables
    const tables: Array<{
      title: string;
      data: any[];
      columns: Array<{ key: string; label: string; type?: string; align?: 'left' | 'right' | 'center' }>;
    }> = [];
    structure.arrayFields.forEach((fieldName: string) => {
      if (formData[fieldName] && Array.isArray(formData[fieldName]) && formData[fieldName].length > 0) {
        const columns = this.generateColumnsFromObject(formData[fieldName][0]).map(col => ({
          ...col,
          align: col.type === 'currency' || col.type === 'number' ? 'right' as const : 'left' as const
        }));

        tables.push({
          title: this.formatFieldName(fieldName),
          data: formData[fieldName],
          columns
        });
      }
    });

    // Auto-detect and calculate summary fields
    const summary = [];
    
    // First, check for provided totals
    for (const [key, value] of Object.entries(formData)) {
      const lowerKey = key.toLowerCase();
      if (['total', 'sum', 'amount', 'cost', 'price'].some(term => lowerKey.includes(term)) && 
          !Array.isArray(value) && value !== null && value !== undefined) {
        let summaryType: 'total' | 'subtotal' | 'balance' = 'subtotal';
        if (lowerKey.includes('total') || lowerKey.includes('grand')) summaryType = 'total';
        if (lowerKey.includes('balance')) summaryType = 'balance';

        const numValue = parseFloat(String(value).replace(/[^\d.]/g, ''));
        if (!isNaN(numValue)) {
          summary.push({
            label: this.formatFieldName(key),
            value: numValue.toFixed(2),
            type: summaryType
          });
        }
      }
    }

    // If no totals found, try to calculate from arrays
    if (summary.length === 0) {
      tables.forEach(table => {
        const currencyColumns = table.columns.filter(col => col.type === 'currency');
        currencyColumns.forEach(currencyCol => {
          const total = table.data.reduce((sum: number, row: any) => {
            const amount = parseFloat(String(row[currencyCol.key] || '0').replace(/[^\d.]/g, '')) || 0;
            return sum + amount;
          }, 0);

          if (total > 0) {
            summary.push({
              label: `Total ${currencyCol.label}`,
              value: total.toFixed(2),
              type: 'total' as const
            });
          }
        });
      });
    }

    return { header, fields, tables, summary, actions: ['approve', 'reject'] };
  }

  /**
   * Default display for tickets without custom form data
   */
  private static getDefaultFormDisplay(ticket: Ticket): any {
    return {
      header: { title: ticket.title, status: ticket.status },
      fields: [
        { label: 'Description', value: ticket.description, type: 'text', displayType: 'field' as const },
        { label: 'Created', value: ticket.createdAt.toString(), type: 'date', displayType: 'date' as const }
      ],
      tables: [],
      summary: [],
      actions: ['approve', 'reject']
    };
  }
  static getFormDataArrays(ticket: Ticket): Array<{
    label: string;
    data: any[];
    columns: Array<{ key: string; label: string; type?: string }>;
  }> {
    const formData = ticket.customFormData?.formData;
    if (!formData) return [];

    const cacheKey = `arrays_${JSON.stringify(Object.keys(formData))}`;
    
    const arrays: Array<{
      label: string;
      data: any[];
      columns: Array<{ key: string; label: string; type?: string }>;
    }> = [];

    // Process array fields efficiently
    for (const [key, value] of Object.entries(formData)) {
      if (Array.isArray(value) && value.length > 0) {
        const sampleItem = value[0];
        if (sampleItem && typeof sampleItem === 'object') {
          const columns = this.generateColumnsFromObject(sampleItem);
          
          arrays.push({
            label: this.formatFieldName(key),
            data: value,
            columns: columns
          });
        }
      }
    }

    return arrays;
  }

  /**
   * Generate table columns from an object structure with caching
   */
  static generateColumnsFromObject(obj: any): Array<{ key: string; label: string; type?: string }> {
    if (!obj || typeof obj !== 'object') {
      return [];
    }

    const keys = Object.keys(obj);
    const cacheKey = keys.join('|');
    
    if (this.columnCache.has(cacheKey)) {
      return this.columnCache.get(cacheKey)!;
    }

    const columns = keys.map(key => ({
      key: key,
      label: this.formatFieldName(key),
      type: this.detectFieldType(obj[key], key)
    }));

    this.columnCache.set(cacheKey, columns);
    return columns;
  }

  /**
   * Format field name for display with caching
   */
  static formatFieldName(fieldName: string): string {
    if (this.formattedNameCache.has(fieldName)) {
      return this.formattedNameCache.get(fieldName)!;
    }

    const formatted = fieldName
      // Handle camelCase
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      // Handle snake_case
      .replace(/_/g, ' ')
      // Handle kebab-case
      .replace(/-/g, ' ')
      // Capitalize each word
      .replace(/\b\w/g, l => l.toUpperCase());

    this.formattedNameCache.set(fieldName, formatted);
    return formatted;
  }

  /**
   * Detect field type for appropriate formatting with caching and optimized logic
   */
  static detectFieldType(value: any, fieldName?: string): string {
    if (value === null || value === undefined) return 'text';
    
    const cacheKey = `${typeof value}_${String(value).substring(0, 20)}_${fieldName || ''}`;
    if (this.fieldTypeCache.has(cacheKey)) {
      return this.fieldTypeCache.get(cacheKey)!;
    }

    let detectedType = 'text';
    
    // Check field name patterns first for better ID detection
    if (fieldName) {
      const lowerFieldName = fieldName.toLowerCase();
      
      // ID fields should be treated as text/number, not currency
      if (this.ID_KEYWORDS.some(pattern => lowerFieldName.includes(pattern))) {
        detectedType = typeof value === 'number' ? 'number' : 'text';
        this.fieldTypeCache.set(cacheKey, detectedType);
        return detectedType;
      }
    }
    
    if (typeof value === 'number') {
      detectedType = 'number';
    } else if (typeof value === 'boolean') {
      detectedType = 'boolean';
    } else if (typeof value === 'string') {
      const stringValue = value.trim();
      
      // Use compiled regex patterns
      if (this.DATE_PATTERN.test(stringValue)) {
        detectedType = 'date';
      } else if (this.EMAIL_PATTERN.test(stringValue)) {
        detectedType = 'email';
      } else if (this.URL_PATTERN.test(stringValue)) {
        detectedType = 'url';
      } else if (this.CURRENCY_PATTERN.test(stringValue) && fieldName) {
        // Check for currency keywords only if pattern matches
        const lowerFieldName = fieldName.toLowerCase();
        const hasCurrencyKeyword = this.CURRENCY_KEYWORDS.some(keyword => 
          lowerFieldName.includes(keyword)
        );
        
        if (hasCurrencyKeyword) {
          detectedType = 'currency';
        }
      }
    }
    
    this.fieldTypeCache.set(cacheKey, detectedType);
    return detectedType;
  }

  /**
   * Format cell value based on type
   */
  static formatCellValue(value: any, type: string = 'text'): string {
    if (value === null || value === undefined || value === '') {
      return '-';
    }

    switch (type) {
      case 'date':
        return this.formatDate(value);
      case 'currency':
        return this.formatCurrency(value);
      case 'boolean':
        return value ? 'Yes' : 'No';
      case 'email':
        return value;
      case 'url':
        return value;
      case 'number':
        return parseFloat(value).toLocaleString();
      default:
        return String(value);
    }
  }

  /**
   * Generate table HTML for form data arrays
   */
  static generateFormDataTableHtml(arrayData: {
    label: string;
    data: any[];
    columns: Array<{ key: string; label: string; type?: string }>;
  }): string {
    if (!arrayData.data || arrayData.data.length === 0) {
      return '';
    }

    let html = `
      <div class="mb-4">
        <h6 class="text-lg font-semibold mb-3">${arrayData.label}</h6>
        <div class="table-responsive">
          <table class="table-hover">
            <thead>
              <tr>`;
    
    // Generate table headers
    arrayData.columns.forEach(column => {
      html += `<th>${column.label}</th>`;
    });
    
    html += `</tr></thead><tbody>`;
    
    // Generate table rows
    arrayData.data.forEach((item, index) => {
      html += `<tr${index % 2 === 0 ? ' class="bg-gray-50"' : ''}>`;
      
      arrayData.columns.forEach(column => {
        const value = item[column.key];
        const formattedValue = this.formatCellValue(value, column.type);
        
        let cellClass = '';
        if (column.type === 'currency') {
          cellClass = 'text-right';
        } else if (column.type === 'number') {
          cellClass = 'text-right';
        } else if (column.type === 'date') {
          cellClass = 'whitespace-nowrap';
        }
        
        html += `<td class="${cellClass}">${formattedValue}</td>`;
      });
      
      html += `</tr>`;
    });
    
    html += `</tbody></table></div></div>`;
    
    return html;
  }

  /**
   * Get status badge configuration
   */
  static getStatusBadge(ticket: Ticket): { text: string; class: string } {
    const statusMap: Record<string, { text: string; class: string }> = {
      'pending': { text: 'Pending', class: 'badge-warning' },
      'in_progress': { text: 'In Progress', class: 'badge-info' },
      'resolved': { text: 'Resolved', class: 'badge-success' },
      'closed': { text: 'Closed', class: 'badge-secondary' },
      'open': { text: 'Open', class: 'badge-primary' }
    };
    
    return statusMap[ticket.status] || statusMap['open'];
  }

  /**
   * Get priority badge configuration
   */
  static getPriorityBadge(ticket: Ticket): { text: string; class: string } {
    const priorityMap: Record<string, { text: string; class: string }> = {
      'low': { text: 'Low', class: 'badge-light' },
      'medium': { text: 'Medium', class: 'badge-primary' },
      'high': { text: 'High', class: 'badge-warning' },
      'critical': { text: 'Critical', class: 'badge-danger' }
    };
    
    return priorityMap[ticket.priority] || priorityMap['medium'];
  }

  /**
   * Check if ticket requires immediate attention
   */
  static requiresAttention(ticket: Ticket): boolean {
    // High or critical priority
    if (['high', 'critical'].includes(ticket.priority)) {
      return true;
    }
    
    // Final approval stage
    const workflowProgress = this.getWorkflowProgress(ticket);
    if (workflowProgress.isFinal) {
      return true;
    }
    
    // Pending for more than 2 days
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    if (ticket.createdAt < twoDaysAgo && ticket.status === 'pending') {
      return true;
    }
    
    return false;
  }

  /**
   * Get action buttons configuration for ticket
   */
  static getActionButtons(ticket: Ticket): Array<{ label: string; action: string; class: string; icon?: string }> {
    const buttons: Array<{ label: string; action: string; class: string; icon?: string }> = [];
    
    if (ticket.status === 'pending') {
      buttons.push({
        label: 'Approve',
        action: 'approve',
        class: 'btn-success',
        icon: 'check'
      });
      
      buttons.push({
        label: 'Reject',
        action: 'reject',
        class: 'btn-danger',
        icon: 'x'
      });
    }
    
    buttons.push({
      label: 'View Details',
      action: 'view',
      class: 'btn-info',
      icon: 'eye'
    });
    
    return buttons;
  }

  /**
   * Format date in dd/mmmm/yyyy format
   */
  static formatDate(date: string | Date): string {
    if (!date) return '-';
    
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      
      if (isNaN(dateObj.getTime())) {
        return String(date); // Return original if invalid date
      }
      
      const day = dateObj.getDate().toString().padStart(2, '0');
      const months = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
      ];
      const month = months[dateObj.getMonth()];
      const year = dateObj.getFullYear();
      
      return `${day}/${month}/${year}`;
    } catch (error) {
      return String(date);
    }
  }

  /**
   * Clear caches to prevent memory leaks (call when component is destroyed)
   */
  static clearCaches(): void {
    this.fieldTypeCache.clear();
    this.columnCache.clear();
    this.formattedNameCache.clear();
  }

  /**
   * Get cache statistics for monitoring
   */
  static getCacheStats(): { 
    fieldTypeEntries: number;
    columnEntries: number;
    formattedNameEntries: number;
  } {
    return {
      fieldTypeEntries: this.fieldTypeCache.size,
      columnEntries: this.columnCache.size,
      formattedNameEntries: this.formattedNameCache.size
    };
  }
  static formatCurrency(value: any): string {
    if (value === null || value === undefined || value === '') {
      return '-';
    }

    const stringValue = String(value).trim();
    
    // If value already has a currency symbol, return as is
    if (stringValue.includes('$') || stringValue.includes('₱') || stringValue.includes('PHP')) {
      return stringValue;
    }
    
    // Parse numeric value
    const numericValue = parseFloat(stringValue.replace(/[^0-9.-]/g, ''));
    
    if (isNaN(numericValue)) {
      return stringValue; // Return original if not parseable
    }
    
    // Format with PHP currency as default
    return `₱${numericValue.toLocaleString('en-PH', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    })}`;
  }
}