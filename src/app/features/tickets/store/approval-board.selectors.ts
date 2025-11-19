import { createSelector, createFeatureSelector } from '@ngrx/store';
import { ApprovalBoardState } from './approval-board.state';

// Feature selector
export const selectApprovalBoardState = createFeatureSelector<ApprovalBoardState>('approvalBoard');

// Basic selectors
export const selectTasks = createSelector(
  selectApprovalBoardState,
  (state) => state.tasks
);

export const selectSelectedTask = createSelector(
  selectApprovalBoardState,
  (state) => state.selectedTask
);

export const selectProcessTypes = createSelector(
  selectApprovalBoardState,
  (state) => state.processTypes
);

export const selectLoading = createSelector(
  selectApprovalBoardState,
  (state) => state.loading
);

export const selectProcessing = createSelector(
  selectApprovalBoardState,
  (state) => state.processing
);

export const selectError = createSelector(
  selectApprovalBoardState,
  (state) => state.error
);

// Pagination selectors
export const selectCurrentPage = createSelector(
  selectApprovalBoardState,
  (state) => state.currentPage
);

export const selectTotalPages = createSelector(
  selectApprovalBoardState,
  (state) => state.totalPages
);

export const selectTotalItems = createSelector(
  selectApprovalBoardState,
  (state) => state.totalItems
);

export const selectItemsPerPage = createSelector(
  selectApprovalBoardState,
  (state) => state.itemsPerPage
);

export const selectHasNextPage = createSelector(
  selectApprovalBoardState,
  (state) => state.hasNextPage
);

export const selectPaginationInfo = createSelector(
  selectCurrentPage,
  selectTotalPages,
  selectTotalItems,
  selectItemsPerPage,
  selectHasNextPage,
  (currentPage, totalPages, totalItems, itemsPerPage, hasNextPage) => ({
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    hasNextPage
  })
);

// Filter selectors
export const selectProcessTypeFilter = createSelector(
  selectApprovalBoardState,
  (state) => state.processTypeFilter
);

export const selectSearchText = createSelector(
  selectApprovalBoardState,
  (state) => state.searchText
);

export const selectDisplayType = createSelector(
  selectApprovalBoardState,
  (state) => state.displayType
);

export const selectFilters = createSelector(
  selectProcessTypeFilter,
  selectSearchText,
  selectCurrentPage,
  selectItemsPerPage,
  (processTypeFilter, searchText, currentPage, itemsPerPage) => ({
    stage_type: 'approval',
    page: currentPage,
    per_page: itemsPerPage,
    ...(processTypeFilter !== 'all' && { form_type: processTypeFilter }),
    ...(searchText.trim() && { search: searchText.trim() })
  })
);

// UI State selectors
export const selectShowConfirmationDialog = createSelector(
  selectApprovalBoardState,
  (state) => state.showConfirmationDialog
);

export const selectConfirmationDialogData = createSelector(
  selectApprovalBoardState,
  (state) => state.confirmationDialogData
);

// Preference selectors
export const selectSkipApprovalConfirmation = createSelector(
  selectApprovalBoardState,
  (state) => state.skipApprovalConfirmation
);

export const selectSkipRejectConfirmation = createSelector(
  selectApprovalBoardState,
  (state) => state.skipRejectConfirmation
);

export const selectHasSkipPreferences = createSelector(
  selectSkipApprovalConfirmation,
  selectSkipRejectConfirmation,
  (skipApproval, skipReject) => skipApproval || skipReject
);

// Computed selectors
export const selectFilteredTasks = createSelector(
  selectTasks,
  selectProcessTypeFilter,
  selectSearchText,
  (tasks, processTypeFilter, searchText) => {
    let filteredTasks = tasks;

    // Apply process type filter
    if (processTypeFilter !== 'all') {
      filteredTasks = filteredTasks.filter(task => 
        task.form_type === processTypeFilter || task.type === processTypeFilter
      );
    }

    // Apply search filter (client-side for current page)
    if (searchText.trim()) {
      const searchTerm = searchText.toLowerCase().trim();
      filteredTasks = filteredTasks.filter(task =>
        task.title?.toLowerCase().includes(searchTerm) ||
        task.requestor?.toLowerCase().includes(searchTerm) ||
        task.reference_id?.toLowerCase().includes(searchTerm) ||
        task.form_name?.toLowerCase().includes(searchTerm)
      );
    }

    return filteredTasks;
  }
);

export const selectTaskById = (taskId: string) => createSelector(
  selectTasks,
  (tasks) => tasks.find(task => task.id === taskId)
);