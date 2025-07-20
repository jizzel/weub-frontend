import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil, tap } from 'rxjs/operators';

// Core imports
import { VideoSummary, VideoStatus } from '../../core/models/video.model';
import { VideoFilters } from '../../core/models/filter.model';
import { SortOption } from '../../core/models/streaming.model';
import * as VIDEO_CONSTANTS from '../../core/constants/video.constants';

// Services
import { Video } from '../../core/services/video';
import { NotificationService } from '../../core/services/notification.service';
import { VideoListStateService } from './services/video-list-state';

// Components
import { VideoCard } from './components/video-card/video-card';
import { SearchBar } from './components/search-bar/search-bar';
import { VideoFilters as VideoFiltersComponent } from './components/video-filters/video-filters';
import { Pagination as PaginationComponent } from '../../shared/components/pagination/pagination';
import { LoadingSpinner } from '../../shared/components/loading-spinner/loading-spinner';
import { ErrorMessage } from '../../shared/components/error-message/error-message';

type SortField = 'createdAt' | 'title' | 'duration' | 'fileSize';

@Component({
  selector: 'app-video-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    VideoCard,
    VideoFiltersComponent,
    SearchBar,
    PaginationComponent,
    LoadingSpinner,
    ErrorMessage
  ],
  templateUrl: './video-list.html',
  styleUrls: ['./video-list.css']
})
export class VideoList implements OnInit, OnDestroy {
  private readonly videoService = inject(Video);
  private readonly notificationService = inject(NotificationService);
  private readonly stateService = inject(VideoListStateService);
  private readonly destroy$ = new Subject<void>();

  readonly state$ = this.stateService.state$;
  readonly videos$ = this.stateService.videos$;
  readonly loading$ = this.stateService.loading$;
  readonly error$ = this.stateService.error$;
  readonly filters$ = this.stateService.filters$;
  readonly pagination$ = this.stateService.pagination$;

  // View state
  readonly viewMode = signal<'grid' | 'list'>('grid');
  readonly searchControl = new FormControl('');
  readonly availablePageSizes = VIDEO_CONSTANTS.PAGINATION_CONFIG.PAGE_SIZE_OPTIONS;

  // Computed state
  readonly hasVideos = computed(() => this.stateService.hasVideos());
  readonly hasError = computed(() => this.stateService.hasError());
  readonly isLoading = computed(() => this.stateService.isLoading());
  readonly isEmpty = computed(() =>
    !this.isLoading() && !this.hasError() && !this.hasVideos()
  );
  readonly showPagination = computed(() => {
    const state = this.stateService.getCurrentState();
    return state.videos.length > 0 && state.pagination.totalPages > 1;
  });

  ngOnInit(): void {
    this.initializeSearchControl();
    this.restoreState();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeSearchControl(): void {
    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(term => {
      this.stateService.updateSearch(term || '');
    });
  }

  onPageChange(page: number): void {
    this.stateService.loadPage(page);
  }

  onPageSizeChange(pageSize: number): void {
    this.stateService.changePageSize(pageSize);
  }

  onFiltersChange(filters: VideoFilters): void {
    this.stateService.updateFilters(filters);
  }

  onSortChange(sort: SortOption): void {
    this.stateService.updateSorting(sort.field as VideoFilters['sortBy'], sort.order);
  }

  onVideoStatusUpdate(videoId: string, newStatus: VideoStatus): void {
    // Update local state immediately for better UX
    const state = this.stateService.getCurrentState();
    const updatedVideos = state.videos.map(video =>
      video.id === videoId ? { ...video, status: newStatus } : video
    );
    this.stateService.updateState({ videos: updatedVideos });
  }

  onClearFilters(): void {
    this.searchControl.setValue('', { emitEvent: false });
    this.stateService.resetFilters();
  }

  onQuickFilter(status: VideoStatus | 'all'): void {
    this.stateService.updateStatusFilter(status === 'all' ? undefined : status);
  }

  onQuickSort(field: SortField): void {
    const currentFilters = this.stateService.getCurrentFilters();
    const newOrder = currentFilters.sortOrder === 'asc' ? 'desc' : 'asc';
    this.stateService.updateSorting(field as VideoFilters['sortBy'], newOrder);
  }

  onRefresh(): void {
    this.stateService.refreshVideos();
  }

  private restoreState(): void {
    const state = this.stateService.getCurrentState();
    if (state.filters.search) {
      this.searchControl.setValue(state.filters.search, { emitEvent: false });
    }
  }

  // Template helper methods
  getEmptyStateMessage(): string {
    const filters = this.stateService.getCurrentFilters();
    if (filters.search || filters.status || filters.tags?.length) {
      return 'No videos found matching your search criteria. Try adjusting your filters.';
    }
    return 'No videos have been uploaded yet. Be the first to share your content!';
  }

  getLoadingMessage(): string {
    const state = this.stateService.getCurrentState();
    return state.pagination.currentPage === 1
      ? 'Loading videos...'
      : 'Loading more videos...';
  }

  trackByVideoId(index: number, video: VideoSummary): string {
    return video.id;
  }
}
