export interface Ticket {
  id: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  type: TicketType;
  assigneeId?: string;
  assigneeName?: string;
  reporterId: string;
  reporterName: string;
  createdAt: Date;
  updatedAt: Date;
  dueDate?: Date;
  tags?: string[];
  attachments?: TicketAttachment[];
  // Custom form task specific data
  customFormData?: {
    taskId: number;
    workflowStage: any;
    formData: any;
    referenceId: string;
    formId: number;
    customForm?: any;
    category?: string;
    formType?: string;
  };
}

export enum TicketStatus {
  OPEN = 'open',
  IN_PROGRESS = 'in_progress',
  PENDING = 'pending',
  RESOLVED = 'resolved',
  CLOSED = 'closed'
}

export enum TicketPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum TicketType {
  BUG = 'bug',
  FEATURE = 'feature',
  SUPPORT = 'support',
  TASK = 'task'
}

export interface TicketAttachment {
  id: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  uploadedAt: Date;
}

export interface CreateTicketRequest {
  title: string;
  description: string;
  priority: TicketPriority;
  type: TicketType;
  assigneeId?: string;
  dueDate?: Date;
  tags?: string[];
}

export interface UpdateTicketRequest {
  id: string;
  title?: string;
  description?: string;
  status?: TicketStatus;
  priority?: TicketPriority;
  type?: TicketType;
  assigneeId?: string;
  dueDate?: Date;
  tags?: string[];
}

export interface TicketFilter {
  status?: TicketStatus[];
  priority?: TicketPriority[];
  type?: TicketType[];
  assigneeId?: string;
  reporterId?: string;
  search?: string;
  dateFrom?: Date;
  dateTo?: Date;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  perPage?: number;
  page?: number;
}