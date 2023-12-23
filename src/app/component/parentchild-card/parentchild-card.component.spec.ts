import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ParentchildCardComponent } from './parentchild-card.component';

describe('ParentchildCardComponent', () => {
  let component: ParentchildCardComponent;
  let fixture: ComponentFixture<ParentchildCardComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ParentchildCardComponent]
    });
    fixture = TestBed.createComponent(ParentchildCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
