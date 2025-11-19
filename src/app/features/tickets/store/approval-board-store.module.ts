import { NgModule } from '@angular/core';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';

import { approvalBoardReducer } from './approval-board.reducer';
import { ApprovalBoardEffects } from './approval-board.effects';

@NgModule({
  imports: [
    StoreModule.forFeature('approvalBoard', approvalBoardReducer),
    EffectsModule.forFeature([ApprovalBoardEffects])
  ]
})
export class ApprovalBoardStoreModule {}