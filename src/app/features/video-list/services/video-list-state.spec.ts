import { TestBed } from '@angular/core/testing';

import { VideoListState } from './video-list-state';

describe('VideoListState', () => {
  let service: VideoListState;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VideoListState);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
