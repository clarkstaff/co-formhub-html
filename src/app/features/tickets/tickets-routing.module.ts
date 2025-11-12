import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ApprovalBoardComponent } from './pages/approval-board/approval-board.component';
import { KanbanBoardComponent } from './pages/kanban-board/kanban-board.component';
import { TableViewComponent } from './pages/table-view/table-view.component';

const routes: Routes = [
  { path: 'kanban', component: KanbanBoardComponent },
  { path: 'table', component: TableViewComponent },
  { path: 'approvals', component: ApprovalBoardComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TicketsRoutingModule {}
