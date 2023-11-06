import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IndividualAccessComponent } from './individual-access.component';

describe('IndividualAccessComponent', () => {
  let component: IndividualAccessComponent;
  let fixture: ComponentFixture<IndividualAccessComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [IndividualAccessComponent]
    });
    fixture = TestBed.createComponent(IndividualAccessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
