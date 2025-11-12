import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'dynamic-icon',
  template: `
    <div [ngSwitch]="iconName" [class]="cssClass">
      <icon-menu-dashboard *ngSwitchCase="'icon-menu-dashboard'"></icon-menu-dashboard>
      <icon-ticket *ngSwitchCase="'icon-ticket'"></icon-ticket>
      <icon-menu-chat *ngSwitchCase="'icon-menu-chat'"></icon-menu-chat>
      <icon-menu-mailbox *ngSwitchCase="'icon-menu-mailbox'"></icon-menu-mailbox>
      <icon-menu-todo *ngSwitchCase="'icon-menu-todo'"></icon-menu-todo>
      <icon-menu-notes *ngSwitchCase="'icon-menu-notes'"></icon-menu-notes>
      <icon-menu-scrumboard *ngSwitchCase="'icon-menu-scrumboard'"></icon-menu-scrumboard>
      <icon-menu-contacts *ngSwitchCase="'icon-menu-contacts'"></icon-menu-contacts>
      <icon-menu-calendar *ngSwitchCase="'icon-menu-calendar'"></icon-menu-calendar>
      <icon-menu-charts *ngSwitchCase="'icon-menu-charts'"></icon-menu-charts>
      <icon-menu-widgets *ngSwitchCase="'icon-menu-widgets'"></icon-menu-widgets>
      <icon-menu-font-icons *ngSwitchCase="'icon-menu-font-icons'"></icon-menu-font-icons>
      <icon-menu-drag-and-drop *ngSwitchCase="'icon-menu-drag-and-drop'"></icon-menu-drag-and-drop>
      <icon-menu-tables *ngSwitchCase="'icon-menu-tables'"></icon-menu-tables>
      <icon-menu-documentation *ngSwitchCase="'icon-menu-documentation'"></icon-menu-documentation>
      <icon-menu-invoice *ngSwitchCase="'icon-menu-invoice'"></icon-menu-invoice>
      <icon-menu-components *ngSwitchCase="'icon-menu-components'"></icon-menu-components>
      <icon-menu-elements *ngSwitchCase="'icon-menu-elements'"></icon-menu-elements>
      <icon-menu-datatables *ngSwitchCase="'icon-menu-datatables'"></icon-menu-datatables>
      <icon-menu-forms *ngSwitchCase="'icon-menu-forms'"></icon-menu-forms>
      <icon-menu-users *ngSwitchCase="'icon-menu-users'"></icon-menu-users>
      <icon-menu-pages *ngSwitchCase="'icon-menu-pages'"></icon-menu-pages>
      <icon-menu-authentication *ngSwitchCase="'icon-menu-authentication'"></icon-menu-authentication>
      <!-- Add more icons as needed -->
      <span *ngSwitchDefault class="text-gray-400">?</span>
    </div>
  `
})
export class DynamicIconComponent {
  @Input() iconName: string = '';
  @Input() cssClass: string = 'shrink-0 group-hover:!text-primary';
}