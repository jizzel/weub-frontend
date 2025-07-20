import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VideoFiltersInterface } from './video-filters';

describe('VideoFilters', () => {
  // let component: VideoFiltersInterface;
  // let fixture: ComponentFixture<VideoFiltersInterface>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      // imports: [VideoFiltersInterface]
    })
    .compileComponents();

    // fixture = TestBed.createComponent(VideoFiltersInterface);
    // component = fixture.componentInstance;
    // fixture.detectChanges();
  });

  it('should create', () => {
    // expect(component).toBeTruthy();
  });
});
