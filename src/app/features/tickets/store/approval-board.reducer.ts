import { createReducer, on } from '@ngrx/store';
import { ApprovalBoardState, initialApprovalBoardState } from './approval-board.state';
import * as ApprovalBoardActions from './approval-board.actions';

export const approvalBoardReducer = createReducer(
  initialApprovalBoardState,

  // Loading Tasks
  on(ApprovalBoardActions.loadTasks, (state, { resetData = true }) => ({
    ...state,
    loading: resetData,
    error: null,
    ...(resetData && {
      currentPage: 1,
      tasks: [],
    })
  })),

  on(ApprovalBoardActions.loadTasksSuccess, (state, { tasks, meta, resetData }) => {
    const updatedTasks = resetData ? tasks : [...state.tasks, ...tasks];
    
    // Extract process types
    const processTypes = ['all', ...new Set(
      updatedTasks
        .map(task => task.form_type || task.type)
        .filter(Boolean)
    )];

    return {
      ...state,
      tasks: updatedTasks,
      loading: false,
      error: null,
      processTypes,
      currentPage: meta?.current_page || state.currentPage,
      totalPages: meta?.last_page || 1,
      totalItems: meta?.total || 0,
      itemsPerPage: meta?.per_page || state.itemsPerPage,
      hasNextPage: (meta?.current_page || state.currentPage) < (meta?.last_page || 1),
      paginationMeta: meta,
    };
  }),

  on(ApprovalBoardActions.loadTasksFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  // Task Selection
  on(ApprovalBoardActions.selectTask, (state, { task }) => ({
    ...state,
    selectedTask: task,
  })),

  on(ApprovalBoardActions.clearTaskSelection, (state) => ({
    ...state,
    selectedTask: null,
  })),

  // Task Processing
  on(ApprovalBoardActions.processTask, (state) => ({
    ...state,
    processing: true,
    error: null,
  })),

  on(ApprovalBoardActions.processTaskSuccess, (state, { taskId }) => {
    const updatedTasks = state.tasks.filter(task => task.id !== taskId);
    const updatedSelectedTask = state.selectedTask?.id === taskId ? null : state.selectedTask;
    
    return {
      ...state,
      tasks: updatedTasks,
      selectedTask: updatedSelectedTask,
      processing: false,
      totalItems: Math.max(0, state.totalItems - 1),
    };
  }),

  on(ApprovalBoardActions.processTaskFailure, (state, { error }) => ({
    ...state,
    processing: false,
    error,
  })),

  // Bulk Processing
  on(ApprovalBoardActions.processBulkTasks, (state) => ({
    ...state,
    processing: true,
    error: null,
  })),

  on(ApprovalBoardActions.processBulkTasksSuccess, (state, { processedTaskIds }) => {
    const updatedTasks = state.tasks.filter(task => !processedTaskIds.includes(task.id));
    const updatedSelectedTask = processedTaskIds.includes(state.selectedTask?.id || '') 
      ? null 
      : state.selectedTask;
    
    return {
      ...state,
      tasks: updatedTasks,
      selectedTask: updatedSelectedTask,
      processing: false,
      totalItems: Math.max(0, state.totalItems - processedTaskIds.length),
    };
  }),

  // Filters
  on(ApprovalBoardActions.setProcessTypeFilter, (state, { processType }) => ({
    ...state,
    processTypeFilter: processType,
  })),

  on(ApprovalBoardActions.setSearchText, (state, { searchText }) => ({
    ...state,
    searchText,
  })),

  on(ApprovalBoardActions.setDisplayType, (state, { displayType }) => ({
    ...state,
    displayType,
  })),

  // Pagination
  on(ApprovalBoardActions.changePage, (state, { page }) => ({
    ...state,
    currentPage: page,
  })),

  // Confirmation Preferences
  on(ApprovalBoardActions.setSkipApprovalConfirmation, (state, { skip }) => ({
    ...state,
    skipApprovalConfirmation: skip,
  })),

  on(ApprovalBoardActions.setSkipRejectConfirmation, (state, { skip }) => ({
    ...state,
    skipRejectConfirmation: skip,
  })),

  on(ApprovalBoardActions.resetConfirmationPreferences, (state) => ({
    ...state,
    skipApprovalConfirmation: false,
    skipRejectConfirmation: false,
  })),

  // Dialog
  on(ApprovalBoardActions.showConfirmationDialog, (state, { data }) => ({
    ...state,
    showConfirmationDialog: true,
    confirmationDialogData: data,
  })),

  on(ApprovalBoardActions.hideConfirmationDialog, (state) => ({
    ...state,
    showConfirmationDialog: false,
    confirmationDialogData: null,
  })),
);