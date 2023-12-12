import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NestedtablesComponent } from './nestedtables.component';

describe('NestedtablesComponent', () => {
  let component: NestedtablesComponent;
  let fixture: ComponentFixture<NestedtablesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [NestedtablesComponent]
    });
    fixture = TestBed.createComponent(NestedtablesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
