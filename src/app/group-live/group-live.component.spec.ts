import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupLiveComponent } from './group-live.component';

describe('GroupLiveComponent', () => {
  let component: GroupLiveComponent;
  let fixture: ComponentFixture<GroupLiveComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GroupLiveComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupLiveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
