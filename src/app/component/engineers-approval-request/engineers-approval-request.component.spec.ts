import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EngineersApprovalRequestComponent } from './engineers-approval-request.component';

describe('EngineersApprovalRequestComponent', () => {
  let component: EngineersApprovalRequestComponent;
  let fixture: ComponentFixture<EngineersApprovalRequestComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EngineersApprovalRequestComponent]
    });
    fixture = TestBed.createComponent(EngineersApprovalRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
