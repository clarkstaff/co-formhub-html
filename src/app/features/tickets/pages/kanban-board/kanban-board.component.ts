import { Component } from '@angular/core';
import { PagesModule } from 'src/app/pages/pages.module';

@Component({
  selector: 'app-kanban-board',
  standalone: true,
  imports: [PagesModule],
  templateUrl: './kanban-board.component.html',
  styleUrl: './kanban-board.component.css'
})
export class KanbanBoardComponent {

}
