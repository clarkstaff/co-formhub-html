import { Component } from '@angular/core';
import { PagesModule } from 'src/app/pages/pages.module';

@Component({
  selector: 'app-table-view',
  standalone: true,
  imports: [PagesModule],
  templateUrl: './table-view.component.html',
  styleUrl: './table-view.component.css'
})
export class TableViewComponent {

}
