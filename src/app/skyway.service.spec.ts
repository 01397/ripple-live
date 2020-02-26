import { TestBed } from '@angular/core/testing';

import { SkywayService } from './skyway.service';

describe('SkywayService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: SkywayService = TestBed.get(SkywayService);
    expect(service).toBeTruthy();
  });
});
