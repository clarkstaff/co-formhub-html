import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApprovalBoardComponent } from './approval-board.component';

describe('ApprovalBoardComponent', () => {
  let component: ApprovalBoardComponent;
  let fixture: ComponentFixture<ApprovalBoardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApprovalBoardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ApprovalBoardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
