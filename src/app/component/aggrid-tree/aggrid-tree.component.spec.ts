import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AggridTreeComponent } from './aggrid-tree.component';

describe('AggridTreeComponent', () => {
  let component: AggridTreeComponent;
  let fixture: ComponentFixture<AggridTreeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AggridTreeComponent]
    });
    fixture = TestBed.createComponent(AggridTreeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
