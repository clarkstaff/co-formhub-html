import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { 
  Ticket, 
  CreateTicketRequest, 
  UpdateTicketRequest, 
  TicketFilter,
  TicketStatus,
  TicketPriority,
  TicketType
} from '../models/ticket.interface';
import { MockTicketService } from './mock-ticket.service';
import { CustomFormTaskService } from './custom-form-task.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TicketService {
  private readonly baseUrl = environment.formhub.url;
  private readonly useMockData = false; // Switch to real API for custom form tasks

  constructor(
    private http: HttpClient,
    private mockService: MockTicketService,
    private customFormTaskService: CustomFormTaskService
  ) { }

  // Get all tickets with optional filtering
  getTickets(filter?: TicketFilter): Observable<Ticket[]> {
    if (this.useMockData) {
      return this.mockService.getMockTickets(filter);
    }

    console.log('TicketService: Using workflow task endpoint');
    let params = new HttpParams();
    
    if (filter) {
      // Status filter
      if (filter.status && filter.status.length > 0) {
        filter.status.forEach(status => {
          params = params.append('status', status);
        });
      }
      
      // Priority filter (if supported by workflow)
      if (filter.priority && filter.priority.length > 0) {
        filter.priority.forEach(priority => {
          params = params.append('priority', priority);
        });
      }
      
      // Type/Form filter
      if (filter.type && filter.type.length > 0) {
        filter.type.forEach(type => {
          params = params.append('form_id', type);
        });
      }
      
      // Workflow filter
      if (filter.assigneeId) {
        params = params.set('workflow_id', filter.assigneeId);
      }
      
      // Search filter
      if (filter.search) {
        params = params.set('search', filter.search);
      }
      
      // Date filters
      if (filter.dateFrom) {
        params = params.set('date_from', filter.dateFrom.toISOString());
      }
      
      if (filter.dateTo) {
        params = params.set('date_to', filter.dateTo.toISOString());
      }

      // Sorting
      if (filter.sortBy) {
        params = params.set('sort_by', filter.sortBy);
        params = params.set('sort_order', filter.sortOrder || 'asc');
      }

      // Pagination
      if (filter.perPage) {
        params = params.set('per_page', filter.perPage.toString());
      }
      
      if (filter.page) {
        params = params.set('page', filter.page.toString());
      }
    }

    return this.http.get<any>(`${this.baseUrl}/custom-forms/task`, { params })
      .pipe(
        map(response => {
          // Transform the API response to match our ticket interface
          if (response.success && response.data) {
            // Handle paginated response
            if (response.data.data) {
              return response.data.data.map((task: any) => this.transformTaskToTicket(task));
            }
            // Handle simple array response
            return response.data.map((task: any) => this.transformTaskToTicket(task));
          }
          return [];
        })
      );
  }

  // Get a single ticket by ID
  getTicket(id: string): Observable<Ticket> {
    if (this.useMockData) {
      return this.mockService.getMockTicket(id);
    }

    return this.http.get<any>(`${this.baseUrl}/custom-forms/task/${id}`)
      .pipe(
        map(response => {
          if (response.success && response.data) {
            return this.transformTaskToTicket(response.data);
          }
          throw new Error('Task not found');
        })
      );
  }

  // Create a new ticket
  createTicket(ticketData: CreateTicketRequest): Observable<Ticket> {
    return this.http.post<Ticket>(`${this.baseUrl}/custom-forms/task`, ticketData);
  }

  // Update an existing ticket
  updateTicket(ticketData: UpdateTicketRequest): Observable<Ticket> {
    if (this.useMockData) {
      return this.mockService.updateMockTicket(ticketData.id, ticketData);
    }

    // Handle custom form task approval/rejection
    if (ticketData.status === 'resolved' || ticketData.status === 'closed') {
      // Find the original ticket to get custom form data
      const taskId = parseInt(ticketData.id);
      if (ticketData.status === 'resolved') {
        return this.customFormTaskService.approveTask(taskId, ticketData.description);
      } else {
        return this.customFormTaskService.rejectTask(taskId, ticketData.description);
      }
    }

    return this.http.put<Ticket>(`${this.baseUrl}/custom-forms/task/${ticketData.id}`, ticketData);
  }

  // Delete a ticket
  deleteTicket(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/custom-forms/task/${id}`);
  }

  // Search tickets
  searchTickets(searchTerm: string): Observable<Ticket[]> {
    const params = new HttpParams().set('q', searchTerm);
    return this.http.get<Ticket[]>(`${this.baseUrl}/search`, { params });
  }

  // Get tickets by assignee
  getTicketsByAssignee(assigneeId: string): Observable<Ticket[]> {
    const params = new HttpParams().set('assigneeId', assigneeId);
    return this.http.get<Ticket[]>(`${this.baseUrl}/by-assignee`, { params });
  }

  // Get tickets by reporter
  getTicketsByReporter(reporterId: string): Observable<Ticket[]> {
    const params = new HttpParams().set('reporterId', reporterId);
    return this.http.get<Ticket[]>(`${this.baseUrl}/by-reporter`, { params });
  }

  // Upload attachment for a ticket
  uploadAttachment(ticketId: string, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.baseUrl}/${ticketId}/attachments`, formData);
  }

  // Delete attachment
  deleteAttachment(ticketId: string, attachmentId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${ticketId}/attachments/${attachmentId}`);
  }

  // Process a workflow task (approve/reject)
  processTask(taskId: string, action: 'approve' | 'reject', notes?: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/custom-forms/task/${taskId}/process`, {
      action,
      notes
    });
  }

  /**
   * Transform workflow task data to ticket format
   */
  private transformTaskToTicket(task: any): Ticket {
    const customFormResponse = task.custom_form_response || {};
    const formData = customFormResponse.form_data || {};
    const customForm = customFormResponse.custom_form || {};
    const workflowStage = task.workflow_stage || {};
    const workflow = workflowStage.workflow || {};
    
    // Extract meaningful information from form data
    const referenceId = customFormResponse.reference_id || task.id.toString();
    const workflowName = workflow.name || 'Unknown Workflow';
    const stageName = workflowStage.name || 'Unknown Stage';
    const formName = customForm.form_name || 'Unknown Form';
    const category = customForm.category || 'General';
    
    // Use enhanced title and description if available from backend
    const title = task.title || `${formName} (${referenceId}) - ${stageName}`;
    const description = task.description || this.generateTaskDescription(task, formData, workflowStage);
    
    // Extract assignee information from the enhanced response
    const assigneeInfo = this.extractAssigneeInfo(task);
    
    // Extract tags from various sources
    const tags = this.generateTaskTags(task, customForm, workflow, workflowStage);
    
    // Use backend-calculated priority if available, otherwise determine from form content
    const priority = task.priority || this.extractPriorityFromTask(task);
    
    // Use backend-calculated due date if available
    const dueDate = task.dueDate || task.due_date;

    return {
      id: task.id.toString(),
      title: title,
      description: description,
      status: this.mapTaskStatusToTicketStatus(task.status),
      priority: priority,
      type: this.mapFormTypeToTicketType(customForm.form_type),
      assigneeId: assigneeInfo.primaryAssigneeId,
      assigneeName: assigneeInfo.primaryAssigneeName,
      assigneeIds: assigneeInfo.assigneeIds,
      assigneeNames: assigneeInfo.assigneeNames,
      assigneeDetails: assigneeInfo.assigneeDetails,
      reporterId: customFormResponse.created_by?.toString() || '0',
      reporterName: customFormResponse.creator?.name || 'Unknown',
      createdAt: new Date(task.created_at),
      updatedAt: new Date(task.updated_at),
      dueDate: dueDate ? new Date(dueDate) : undefined,
      tags: tags,
      customFormData: {
        taskId: task.id,
        workflowStage: workflowStage,
        formData: formData,
        referenceId: referenceId,
        formId: customFormResponse.custom_form_id || 0,
        customForm: customForm,
        category: category,
        formType: customForm.form_type,
        assignees: task.assignees || [] // Include assignee data
      }
    };
  }

  /**
   * Extract assignee information from task data
   */
  private extractAssigneeInfo(task: any): { 
    primaryAssigneeId?: string; 
    primaryAssigneeName?: string;
    assigneeIds?: string[];
    assigneeNames?: string[];
    assigneeDetails?: any[];
    // Keep legacy fields for backward compatibility
    assigneeId?: string;
    assigneeName?: string;
  } {
    // Use processed_by first (if task is assigned to someone specific)
    if (task.processed_by) {
      return {
        primaryAssigneeId: task.processed_by.id?.toString(),
        primaryAssigneeName: task.processed_by.name,
        assigneeId: task.processed_by.id?.toString(), // Legacy support
        assigneeName: task.processed_by.name, // Legacy support
        assigneeIds: [task.processed_by.id?.toString()].filter(Boolean),
        assigneeNames: [task.processed_by.name].filter(Boolean),
        assigneeDetails: [task.processed_by]
      };
    }
    
    // Use assignees from workflow stage (multiple assignees)
    if (task.assignees && task.assignees.length > 0) {
      const assigneeIds = task.assignees.map((a: any) => a.assignee_id?.toString()).filter(Boolean);
      const assigneeNames = task.assignees.map((a: any) => a.assignee_name).filter(Boolean);
      const primaryAssignee = task.assignees[0]; // Use first assignee as primary
      
      return {
        primaryAssigneeId: primaryAssignee.assignee_id?.toString(),
        primaryAssigneeName: primaryAssignee.assignee_name || 'Assigned',
        assigneeId: primaryAssignee.assignee_id?.toString(), // Legacy support  
        assigneeName: this.formatMultipleAssignees(assigneeNames), // Legacy support with multiple names
        assigneeIds: assigneeIds,
        assigneeNames: assigneeNames,
        assigneeDetails: task.assignees
      };
    }
    
    return { 
      primaryAssigneeId: undefined, 
      primaryAssigneeName: undefined,
      assigneeId: undefined,
      assigneeName: undefined,
      assigneeIds: [],
      assigneeNames: [],
      assigneeDetails: []
    };
  }

  /**
   * Format multiple assignee names for display in legacy assigneeName field
   */
  private formatMultipleAssignees(assigneeNames: string[]): string {
    if (assigneeNames.length === 0) return 'Unassigned';
    if (assigneeNames.length === 1) return assigneeNames[0];
    if (assigneeNames.length === 2) return `${assigneeNames[0]} & ${assigneeNames[1]}`;
    if (assigneeNames.length <= 3) return `${assigneeNames[0]}, ${assigneeNames[1]} & ${assigneeNames[2]}`;
    return `${assigneeNames[0]} +${assigneeNames.length - 1} others`;
  }

  /**
   * Generate a descriptive task description based on available data
   */
  private generateTaskDescription(task: any, formData: any, workflowStage: any): string {
    const instructions = workflowStage.instructions || '';
    const notes = task.notes || '';
    
    // Start with workflow stage instructions
    let description = instructions;
    
    // Add form-specific details based on form data
    const formDetails = this.extractFormDetails(formData);
    if (formDetails) {
      description += description ? '\n\n' : '';
      description += `Form Details:\n${formDetails}`;
    }
    
    // Add any task notes
    if (notes) {
      description += description ? '\n\n' : '';
      description += `Notes: ${notes}`;
    }
    
    return description || 'Approval required for this workflow task.';
  }

  /**
   * Extract meaningful details from form data
   */
  private extractFormDetails(formData: any): string {
    const details: string[] = [];
    
    // Handle different form types
    if (formData.department) {
      details.push(`Department: ${formData.department}`);
    }
    
    if (formData.date) {
      details.push(`Date: ${formData.date}`);
    }
    
    if (formData.totalPettyCash) {
      details.push(`Total Amount: ${formData.totalPettyCash}`);
    }
    
    if (formData.pettyCashHolder) {
      details.push(`Holder: ${formData.pettyCashHolder}`);
    }
    
    // Handle transactions array
    if (formData.transactions && Array.isArray(formData.transactions)) {
      const transactionCount = formData.transactions.length;
      details.push(`Transactions: ${transactionCount} item${transactionCount !== 1 ? 's' : ''}`);
      
      // Show details of first transaction if available
      if (transactionCount > 0 && formData.transactions[0]) {
        const firstTransaction = formData.transactions[0];
        if (firstTransaction.description) {
          details.push(`First Transaction: ${firstTransaction.description}`);
        }
        if (firstTransaction.amount) {
          details.push(`Amount: ${firstTransaction.amount}`);
        }
      }
    }
    
    // Handle other common fields
    if (formData.description) {
      details.push(`Description: ${formData.description}`);
    }
    
    if (formData.amount) {
      details.push(`Amount: ${formData.amount}`);
    }
    
    if (formData.purpose) {
      details.push(`Purpose: ${formData.purpose}`);
    }
    
    return details.join('\n');
  }

  /**
   * Generate relevant tags for the task
   */
  private generateTaskTags(task: any, customForm: any, workflow: any, workflowStage: any): string[] {
    const tags: string[] = [];
    
    // Add workflow name
    if (workflow.name) {
      tags.push(workflow.name);
    }
    
    // Add stage name
    if (workflowStage.name) {
      tags.push(workflowStage.name);
    }
    
    // Add form category
    if (customForm.category) {
      tags.push(customForm.category);
    }
    
    // Add form type
    if (customForm.form_type) {
      tags.push(customForm.form_type);
    }
    
    // Add status-based tags
    if (task.status) {
      tags.push(`Status: ${task.status}`);
    }
    
    // Add approval type if final stage
    if (workflowStage.is_final) {
      tags.push('Final Approval');
    }
    
    // Remove duplicates and return
    return [...new Set(tags)];
  }

  /**
   * Map form type to ticket type
   */
  private mapFormTypeToTicketType(formType: string): TicketType {
    if (!formType) return TicketType.TASK;
    
    const type = formType.toLowerCase();
    
    // Map common form types to ticket types
    if (type.includes('support') || type.includes('help')) {
      return TicketType.SUPPORT;
    }
    
    if (type.includes('bug') || type.includes('issue') || type.includes('problem')) {
      return TicketType.BUG;
    }
    
    if (type.includes('feature') || type.includes('enhancement') || type.includes('request')) {
      return TicketType.FEATURE;
    }
    
    // Default to task for workflow approvals
    return TicketType.TASK;
  }

  /**
   * Map task status to ticket status
   */
  private mapTaskStatusToTicketStatus(taskStatus: string): TicketStatus {
    switch (taskStatus?.toLowerCase()) {
      case 'pending':
        return TicketStatus.PENDING;
      case 'completed':
      case 'approved':
        return TicketStatus.RESOLVED;
      case 'rejected':
        return TicketStatus.CLOSED;
      case 'in_progress':
        return TicketStatus.IN_PROGRESS;
      default:
        return TicketStatus.OPEN;
    }
  }

  /**
   * Extract priority from task (based on workflow or form data)
   */
  private extractPriorityFromTask(task: any): TicketPriority {
    // Check if priority is defined in workflow stage conditions
    const conditions = task.workflow_stage?.conditions;
    if (conditions?.priority) {
      switch (conditions.priority.toLowerCase()) {
        case 'high':
        case 'urgent':
          return TicketPriority.HIGH;
        case 'critical':
          return TicketPriority.CRITICAL;
        case 'low':
          return TicketPriority.LOW;
        default:
          return TicketPriority.MEDIUM;
      }
    }

    // Check form data for priority indicators
    const formData = task.custom_form_response?.form_data || {};
    if (formData.priority) {
      return this.mapStringToPriority(formData.priority);
    }

    // Default priority based on workflow type
    const workflowName = task.workflow_stage?.workflow?.name?.toLowerCase() || '';
    if (workflowName.includes('urgent') || workflowName.includes('critical')) {
      return TicketPriority.HIGH;
    }

    return TicketPriority.MEDIUM;
  }

  /**
   * Map string to priority enum
   */
  private mapStringToPriority(priority: string): TicketPriority {
    switch (priority?.toLowerCase()) {
      case 'high':
      case 'urgent':
        return TicketPriority.HIGH;
      case 'critical':
        return TicketPriority.CRITICAL;
      case 'low':
        return TicketPriority.LOW;
      default:
        return TicketPriority.MEDIUM;
    }
  }
}
