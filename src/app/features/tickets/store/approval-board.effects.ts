import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { map, catchError, exhaustMap, tap, withLatestFrom } from 'rxjs/operators';

import { WorkflowTaskService, ProcessTaskRequest } from '../services/workflow-task.service';
import { ToastService } from '../../../shared/toast/services/toast.service';
import * as ApprovalBoardActions from './approval-board.actions';
import * as ApprovalBoardSelectors from './approval-board.selectors';

@Injectable()
export class ApprovalBoardEffects {
  constructor(
    private actions$: Actions,
    private store: Store,
    private workflowTaskService: WorkflowTaskService,
    private toastService: ToastService
  ) {}

  // Load Tasks Effect
  loadTasks$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ApprovalBoardActions.loadTasks),
      exhaustMap(({ filters, resetData = true }) =>
        this.workflowTaskService.getTasks(filters).pipe(
          map(response => {
            // Handle different response structures
            let tasks = [];
            if (Array.isArray(response.data)) {
              tasks = response.data;
            } else if (Array.isArray(response)) {
              tasks = response;
            } else if (response.data && typeof response.data === 'object') {
              const dataObj = response.data as any;
              tasks = dataObj.items || dataObj.data || Object.values(dataObj) || [];
            }
            
            if (!Array.isArray(tasks)) {
              tasks = [];
            }

            return ApprovalBoardActions.loadTasksSuccess({
              tasks,
              meta: response.meta,
              resetData
            });
          }),
          catchError(error =>
            of(ApprovalBoardActions.loadTasksFailure({
              error: 'Failed to load pending tasks'
            }))
          )
        )
      )
    )
  );

  // Auto-load tasks on filter changes
  loadTasksOnFilterChange$ = createEffect(() =>
    this.actions$.pipe(
      ofType(
        ApprovalBoardActions.setProcessTypeFilter,
        ApprovalBoardActions.setSearchText
      ),
      withLatestFrom(this.store.select(ApprovalBoardSelectors.selectFilters)),
      map(([action, filters]) =>
        ApprovalBoardActions.loadTasks({ filters, resetData: true })
      )
    )
  );

  // Load tasks on page change
  loadTasksOnPageChange$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ApprovalBoardActions.changePage),
      withLatestFrom(this.store.select(ApprovalBoardSelectors.selectFilters)),
      map(([action, filters]) =>
        ApprovalBoardActions.loadTasks({ filters, resetData: false })
      )
    )
  );

  // Process Single Task Effect
  processTask$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ApprovalBoardActions.processTask),
      withLatestFrom(this.store.select(ApprovalBoardSelectors.selectTasks)),
      exhaustMap(([{ taskId, action, notes }, tasks]) => {
        const task = tasks.find(t => t.id === taskId);
        if (!task) {
          return of(ApprovalBoardActions.processTaskFailure({
            error: 'Task not found'
          }));
        }

        const processRequest: ProcessTaskRequest = {
          action,
          ...(notes && { notes })
        };

        return this.workflowTaskService.processTask(
          task.custom_form_response_id.toString(),
          processRequest
        ).pipe(
          map(response => {
            if (response.success) {
              const actionText = action === 'approved' ? 'approved' : 'rejected';
              this.toastService.success(
                `Task "${task.title}" has been ${actionText} successfully!`,
                `Task ${actionText.charAt(0).toUpperCase() + actionText.slice(1)}`,
                4000
              );
              return ApprovalBoardActions.processTaskSuccess({ taskId, action });
            } else {
              this.toastService.error(
                response.message || 'Failed to process task',
                'Processing Failed'
              );
              return ApprovalBoardActions.processTaskFailure({
                error: response.message || 'Failed to process task'
              });
            }
          }),
          catchError(error => {
            this.toastService.error(
              'An unexpected error occurred while processing the task',
              'Processing Failed'
            );
            return of(ApprovalBoardActions.processTaskFailure({
              error: 'Failed to process task'
            }));
          })
        );
      })
    )
  );

  // Process Bulk Tasks Effect
  processBulkTasks$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ApprovalBoardActions.processBulkTasks),
      withLatestFrom(this.store.select(ApprovalBoardSelectors.selectTasks)),
      exhaustMap(([{ taskIds, action }, tasks]) => {
        const tasksToProcess = tasks.filter(t => taskIds.includes(t.id));
        if (tasksToProcess.length === 0) {
          return of(ApprovalBoardActions.processTaskFailure({
            error: 'No tasks found to process'
          }));
        }

        let successful = 0;
        let failed = 0;
        const processedTaskIds: string[] = [];

        // Process all tasks
        const processPromises = tasksToProcess.map(task => {
          const processRequest: ProcessTaskRequest = {
            action,
            notes: `Bulk ${action}`
          };

          return this.workflowTaskService.processTask(
            task.custom_form_response_id.toString(),
            processRequest
          ).toPromise().then(response => {
            if (response?.success) {
              successful++;
              processedTaskIds.push(task.id);
            } else {
              failed++;
            }
          }).catch(() => {
            failed++;
          });
        });

        return Promise.all(processPromises).then(() => {
          const actionText = action === 'approved' ? 'approved' : 'rejected';
          const total = tasksToProcess.length;
          
          if (failed === 0) {
            this.toastService.success(
              `All ${total} task(s) have been ${actionText} successfully!`,
              `Bulk ${action.charAt(0).toUpperCase() + action.slice(1)} Completed`,
              5000
            );
          } else if (successful === 0) {
            this.toastService.error(
              `Failed to ${action} ${total} task(s)`,
              `Bulk ${action.charAt(0).toUpperCase() + action.slice(1)} Failed`
            );
          } else {
            this.toastService.warning(
              `${successful} task(s) ${actionText}, ${failed} failed`,
              `Bulk ${action.charAt(0).toUpperCase() + action.slice(1)} Partial Success`
            );
          }

          return ApprovalBoardActions.processBulkTasksSuccess({
            processedTaskIds,
            successful,
            failed,
            action
          });
        });
      })
    )
  );

  // Confirmation Preference Effects
  confirmationPreferenceToast$ = createEffect(() =>
    this.actions$.pipe(
      ofType(
        ApprovalBoardActions.setSkipApprovalConfirmation,
        ApprovalBoardActions.setSkipRejectConfirmation
      ),
      tap(action => {
        if ('skip' in action && action.skip) {
          const type = action.type.includes('Approval') ? 'approvals' : 'rejections';
          this.toastService.info(
            `Future ${type} will skip confirmation dialog`,
            'Confirmation Preference Saved',
            3000
          );
        }
      })
    ),
    { dispatch: false }
  );

  resetPreferencesToast$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ApprovalBoardActions.resetConfirmationPreferences),
      tap(() => {
        this.toastService.success(
          'Confirmation dialogs will now be shown for all actions',
          'Preferences Reset',
          3000
        );
      })
    ),
    { dispatch: false }
  );

  // Hide dialog after successful task processing
  hideDialogAfterProcessing$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ApprovalBoardActions.processTaskSuccess),
      map(() => ApprovalBoardActions.hideConfirmationDialog())
    )
  );
}