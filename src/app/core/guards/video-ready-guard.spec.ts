import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { videoReadyGuard } from './video-ready-guard';

describe('videoReadyGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => videoReadyGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
