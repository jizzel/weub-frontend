import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Subject, combineLatest, debounceTime, distinctUntilChanged, switchMap, takeUntil, catchError, of } from 'rxjs';
import { VideoSummary } from '../../../core/models/video.model';
import { VideoFilters } from '../../../core/models/filter.model';
import { PaginationParams } from '../../../core/models/pagination.model';
import { VideoListResponse } from '../../../core/models/api-response.model';
import {Video} from '../../../core/services/video';
import {map} from 'rxjs/operators';

export interface VideoListState {
  videos: VideoSummary[];
  loading: boolean;
  error: string | null;
  filters: VideoFilters;
  pagination: {
    currentPage: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
  hasMore: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class VideoListStateService implements OnDestroy {
  private destroy$ = new Subject<void>();

  // State subjects
  private stateSubject = new BehaviorSubject<VideoListState>({
    videos: [],
    loading: false,
    error: null,
    filters: {
      status: 'ready',
      search: '',
      sortBy: 'createdAt',
      sortOrder: 'desc'
    },
    pagination: {
      currentPage: 1,
      pageSize: 12,
      totalItems: 0,
      totalPages: 0
    },
    hasMore: false
  });

  private filtersSubject = new BehaviorSubject<VideoFilters>(this.stateSubject.value.filters);
  private paginationSubject = new BehaviorSubject<PaginationParams>({
    page: 1,
    pageSize: 12
  });

  // Public observables
  public state$ = this.stateSubject.asObservable();
  public videos$ = this.state$.pipe(map(state => state.videos));
  public loading$ = this.state$.pipe(map(state => state.loading));
  public error$ = this.state$.pipe(map(state => state.error));
  public filters$ = this.filtersSubject.asObservable();
  public pagination$ = this.state$.pipe(map(state => state.pagination));

  constructor(private videoService: Video) {
    this.initializeDataFlow();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeDataFlow(): void {
    // Combine filters and pagination, debounce search input
    combineLatest([
      this.filtersSubject.pipe(
        debounceTime(300),
        distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr))
      ),
      this.paginationSubject.pipe(distinctUntilChanged())
    ]).pipe(
      takeUntil(this.destroy$),
      switchMap(([filters, pagination]) => {
        this.updateState({ loading: true, error: null });

        return this.videoService.getVideos(filters, pagination).pipe(
          catchError(error => {
            console.error('Error loading videos:', error);
            this.updateState({
              loading: false,
              error: 'Failed to load videos. Please try again.'
            });
            return of(null);
          })
        );
      })
    ).subscribe(response => {
      if (response) {
        this.handleVideoListResponse(response);
      }
    });
  }

  private handleVideoListResponse(response: VideoListResponse): void {
    const currentState = this.stateSubject.value;
    const isFirstPage = this.paginationSubject.value.page === 1;

    // For first page, replace videos; for subsequent pages, append them (infinite scroll)
    const videos = isFirstPage
      ? response.data.videos
      : [...currentState.videos, ...response.data.videos];

    this.updateState({
      videos,
      loading: false,
      error: null,
      pagination: {
        currentPage: response.data.pagination.currentPage,
        pageSize: response.data.pagination.itemsPerPage,
        totalItems: response.data.pagination.totalItems,
        totalPages: response.data.pagination.totalPages
      },
      hasMore: response.data.pagination.currentPage < response.data.pagination.totalPages
    });
  }

  updateState(partialState: Partial<VideoListState>): void {
    const currentState = this.stateSubject.value;
    this.stateSubject.next({ ...currentState, ...partialState });
  }

  // Public methods for updating filters and pagination
  updateFilters(filters: Partial<VideoFilters>): void {
    const currentFilters = this.filtersSubject.value;
    const newFilters = { ...currentFilters, ...filters };

    this.filtersSubject.next(newFilters);
    this.updateState({ filters: newFilters });

    // Reset to first page when filters change
    this.resetPagination();
  }

  updateSearch(searchTerm: string): void {
    this.updateFilters({ search: searchTerm });
  }

  updateSorting(sortBy: VideoFilters['sortBy'], sortOrder: VideoFilters['sortOrder']): void {
    this.updateFilters({ sortBy, sortOrder });
  }

  updateStatusFilter(status: VideoFilters['status']): void {
    this.updateFilters({ status });
  }

  updateResolutionFilter(resolution: VideoFilters['resolution']): void {
    this.updateFilters({ resolution });
  }

  updateDateRange(dateFrom?: string, dateTo?: string): void {
    this.updateFilters({ dateFrom, dateTo });
  }

  updateTags(tags: string[]): void {
    this.updateFilters({ tags });
  }

  loadNextPage(): void {
    const currentState = this.stateSubject.value;
    if (currentState.hasMore && !currentState.loading) {
      const nextPage = currentState.pagination.currentPage + 1;
      this.paginationSubject.next({
        page: nextPage,
        pageSize: currentState.pagination.pageSize
      });
    }
  }

  refreshVideos(): void {
    this.resetPagination();
    // Trigger reload by emitting current filters
    this.filtersSubject.next(this.filtersSubject.value);
  }

  resetFilters(): void {
    const defaultFilters: VideoFilters = {
      status: 'ready',
      search: '',
      sortBy: 'createdAt',
      sortOrder: 'desc'
    };

    this.filtersSubject.next(defaultFilters);
    this.updateState({ filters: defaultFilters });
    this.resetPagination();
  }

  private resetPagination(): void {
    this.paginationSubject.next({
      page: 1,
      pageSize: this.stateSubject.value.pagination.pageSize
    });
  }

  changePageSize(pageSize: number): void {
    this.updateState({
      pagination: { ...this.stateSubject.value.pagination, pageSize }
    });
    this.paginationSubject.next({
      page: 1,
      pageSize: pageSize
    });
  }

  // Helper methods
  getCurrentFilters(): VideoFilters {
    return this.filtersSubject.value;
  }

  getCurrentState(): VideoListState {
    return this.stateSubject.value;
  }

  isLoading(): boolean {
    return this.stateSubject.value.loading;
  }

  hasError(): boolean {
    return this.stateSubject.value.error !== null;
  }

  getErrorMessage(): string | null {
    return this.stateSubject.value.error;
  }

  getTotalVideos(): number {
    return this.stateSubject.value.pagination.totalItems;
  }

  hasVideos(): boolean {
    return this.stateSubject.value.videos.length > 0;
  }

  canLoadMore(): boolean {
    return this.stateSubject.value.hasMore && !this.stateSubject.value.loading;
  }

  loadPage(page: number) {
    if (page < 1 || page > this.stateSubject.value.pagination.totalPages) {
      return; // Invalid page number
    }

    this.paginationSubject.next({
      page,
      pageSize: this.stateSubject.value.pagination.pageSize
    });

    // Reset videos if loading the first page
    if (page === 1) {
      this.updateState({ videos: [] });
    }
  }
}
