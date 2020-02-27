import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { YtliveComponent } from './ytlive.component';

describe('YtliveComponent', () => {
  let component: YtliveComponent;
  let fixture: ComponentFixture<YtliveComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ YtliveComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(YtliveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
