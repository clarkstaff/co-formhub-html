export interface CustomFormTask {
  id: number;
  custom_form_response_id: number;
  workflow_stage_id: number;
  status: TaskStatus;
  notes: string | null;
  data: any;
  processed_by_type: string | null;
  processed_by_id: number | null;
  created_at: string;
  updated_at: string;
  workflow_stage: WorkflowStage;
  custom_form_response: CustomFormResponse;
  processed_by: any;
}

export interface WorkflowStage {
  id: number;
  slug: string;
  workflow_id: number;
  order: number;
  name: string;
  type: string;
  is_final: boolean;
  conditions: any;
  triggers: any;
  can_skip: boolean;
  auto_approve: boolean;
  instructions: string;
  created_at: string;
  updated_at: string;
  approval_required: string;
  workflow: Workflow;
}

export interface Workflow {
  id: number;
  slug: string;
  name: string;
  description: string;
  is_active: number;
  created_at: string;
  updated_at: string;
}

export interface CustomFormResponse {
  id: number;
  custom_form_id: number;
  reference_id: string;
  form_data: any; // Dynamic JSON data
  created_by: number;
  updated_by: number;
  status: string;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export enum TaskStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed'
}

export interface CustomFormTaskResponse {
  success: boolean;
  data: CustomFormTask[];
}

// Adapter function to convert CustomFormTask to Ticket interface for compatibility
export function adaptCustomFormTaskToTicket(task: CustomFormTask): import('./ticket.interface').Ticket {
  return {
    id: task.id.toString(),
    title: `${task.workflow_stage.workflow.name} - ${task.custom_form_response.reference_id}`,
    description: task.workflow_stage.instructions || task.workflow_stage.workflow.description,
    status: mapTaskStatusToTicketStatus(task.status),
    priority: 'medium' as any, // Default priority, could be enhanced based on workflow
    type: 'task' as any, // Default type for approval tasks
    assigneeId: undefined, // Would be the current user in approval context
    assigneeName: undefined,
    reporterId: task.custom_form_response.created_by.toString(),
    reporterName: 'Form Submitter', // Could be enhanced with user lookup
    createdAt: new Date(task.created_at),
    updatedAt: new Date(task.updated_at),
    dueDate: undefined, // Could be calculated based on workflow rules
    tags: [task.workflow_stage.slug, task.workflow_stage.type],
    attachments: [],
    // Additional properties specific to custom form tasks
    customFormData: {
      taskId: task.id,
      workflowStage: task.workflow_stage,
      formData: task.custom_form_response.form_data,
      referenceId: task.custom_form_response.reference_id,
      formId: task.custom_form_response.custom_form_id
    }
  };
}

function mapTaskStatusToTicketStatus(taskStatus: TaskStatus): import('./ticket.interface').TicketStatus {
  switch (taskStatus) {
    case TaskStatus.PENDING:
      return 'pending' as any;
    case TaskStatus.IN_PROGRESS:
      return 'in_progress' as any;
    case TaskStatus.APPROVED:
      return 'resolved' as any;
    case TaskStatus.REJECTED:
      return 'closed' as any;
    case TaskStatus.COMPLETED:
      return 'resolved' as any;
    default:
      return 'pending' as any;
  }
}