import { WorkflowTask } from '../services/workflow-task.service';
import { ConfirmationDialogData } from '../components/confirmation-dialog/confirmation-dialog.component';

export interface ApprovalBoardState {
  // Data
  tasks: WorkflowTask[];
  selectedTask: WorkflowTask | null;
  processTypes: string[];
  
  // Loading States
  loading: boolean;
  processing: boolean;
  error: string | null;
  
  // Pagination
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  paginationMeta: any;
  
  // Filters
  processTypeFilter: string;
  searchText: string;
  displayType: 'list' | 'grid';
  
  // UI State
  showConfirmationDialog: boolean;
  confirmationDialogData: ConfirmationDialogData | null;
  
  // User Preferences
  skipApprovalConfirmation: boolean;
  skipRejectConfirmation: boolean;
}

export const initialApprovalBoardState: ApprovalBoardState = {
  // Data
  tasks: [],
  selectedTask: null,
  processTypes: ['all'],
  
  // Loading States
  loading: false,
  processing: false,
  error: null,
  
  // Pagination
  currentPage: 1,
  totalPages: 1,
  totalItems: 0,
  itemsPerPage: 20,
  hasNextPage: false,
  paginationMeta: null,
  
  // Filters
  processTypeFilter: 'all',
  searchText: '',
  displayType: 'list',
  
  // UI State
  showConfirmationDialog: false,
  confirmationDialogData: null,
  
  // User Preferences
  skipApprovalConfirmation: false,
  skipRejectConfirmation: false,
};