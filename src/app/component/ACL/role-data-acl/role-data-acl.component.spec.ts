import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoleDataAclComponent } from './role-data-acl.component';

describe('RoleDataAclComponent', () => {
  let component: RoleDataAclComponent;
  let fixture: ComponentFixture<RoleDataAclComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RoleDataAclComponent]
    });
    fixture = TestBed.createComponent(RoleDataAclComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
