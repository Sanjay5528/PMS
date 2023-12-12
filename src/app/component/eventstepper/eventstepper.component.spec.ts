import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventstepperComponent } from './eventstepper.component';

describe('EventstepperComponent', () => {
  let component: EventstepperComponent;
  let fixture: ComponentFixture<EventstepperComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EventstepperComponent]
    });
    fixture = TestBed.createComponent(EventstepperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
