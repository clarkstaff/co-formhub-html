import { createAction, props } from '@ngrx/store';
import { WorkflowTask } from '../services/workflow-task.service';

// Loading Actions
export const loadTasks = createAction(
  '[Approval Board] Load Tasks',
  props<{ filters: any; resetData?: boolean }>()
);

export const loadTasksSuccess = createAction(
  '[Approval Board] Load Tasks Success',
  props<{ tasks: WorkflowTask[]; meta: any; resetData: boolean }>()
);

export const loadTasksFailure = createAction(
  '[Approval Board] Load Tasks Failure',
  props<{ error: string }>()
);

// Task Selection Actions
export const selectTask = createAction(
  '[Approval Board] Select Task',
  props<{ task: WorkflowTask }>()
);

export const clearTaskSelection = createAction(
  '[Approval Board] Clear Task Selection'
);

// Task Processing Actions
export const processTask = createAction(
  '[Approval Board] Process Task',
  props<{ taskId: string; action: 'approved' | 'rejected'; notes?: string }>()
);

export const processTaskSuccess = createAction(
  '[Approval Board] Process Task Success',
  props<{ taskId: string; action: 'approved' | 'rejected' }>()
);

export const processTaskFailure = createAction(
  '[Approval Board] Process Task Failure',
  props<{ error: string }>()
);

// Bulk Processing Actions
export const processBulkTasks = createAction(
  '[Approval Board] Process Bulk Tasks',
  props<{ taskIds: string[]; action: 'approved' | 'rejected' }>()
);

export const processBulkTasksSuccess = createAction(
  '[Approval Board] Process Bulk Tasks Success',
  props<{ processedTaskIds: string[]; successful: number; failed: number; action: 'approved' | 'rejected' }>()
);

// Filter Actions
export const setProcessTypeFilter = createAction(
  '[Approval Board] Set Process Type Filter',
  props<{ processType: string }>()
);

export const setSearchText = createAction(
  '[Approval Board] Set Search Text',
  props<{ searchText: string }>()
);

export const setDisplayType = createAction(
  '[Approval Board] Set Display Type',
  props<{ displayType: 'list' | 'grid' }>()
);

// Pagination Actions
export const changePage = createAction(
  '[Approval Board] Change Page',
  props<{ page: number }>()
);

// Confirmation Preferences Actions
export const setSkipApprovalConfirmation = createAction(
  '[Approval Board] Set Skip Approval Confirmation',
  props<{ skip: boolean }>()
);

export const setSkipRejectConfirmation = createAction(
  '[Approval Board] Set Skip Reject Confirmation',
  props<{ skip: boolean }>()
);

export const resetConfirmationPreferences = createAction(
  '[Approval Board] Reset Confirmation Preferences'
);

// Dialog Actions
export const showConfirmationDialog = createAction(
  '[Approval Board] Show Confirmation Dialog',
  props<{ data: any }>()
);

export const hideConfirmationDialog = createAction(
  '[Approval Board] Hide Confirmation Dialog'
);