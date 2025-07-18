import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, map } from 'rxjs';
import { VideoFilters, FilterOption } from '../../../core/models/filter.model';
import { VideoResolution, VideoStatus } from '../../../core/models/video.model';

export interface FilterConfiguration {
  statusOptions: FilterOption[];
  resolutionOptions: FilterOption[];
  sortOptions: FilterOption[];
  sortOrderOptions: FilterOption[];
  dateRangePresets: FilterOption[];
}

@Injectable({
  providedIn: 'root'
})
export class FilterService {
  private filtersConfigSubject = new BehaviorSubject<FilterConfiguration>(this.getDefaultConfiguration());
  private activeFiltersCountSubject = new BehaviorSubject<number>(0);

  public filtersConfig$ = this.filtersConfigSubject.asObservable();
  public activeFiltersCount$ = this.activeFiltersCountSubject.asObservable();

  constructor() {}

  private getDefaultConfiguration(): FilterConfiguration {
    return {
      statusOptions: [
        { label: 'All Status', value: 'all' },
        { label: 'Ready', value: 'ready' },
        { label: 'Processing', value: 'processing' },
        { label: 'Pending', value: 'pending' },
        { label: 'Failed', value: 'failed' }
      ],
      resolutionOptions: [
        { label: 'All Resolutions', value: 'all' },
        { label: '480p', value: '480p' },
        { label: '720p', value: '720p' },
        { label: '1080p', value: '1080p' },
        { label: '1440p', value: '1440p' },
        { label: '4K', value: '2160p' }
      ],
      sortOptions: [
        { label: 'Upload Date', value: 'createdAt' },
        { label: 'Title', value: 'title' },
        { label: 'Duration', value: 'duration' },
        { label: 'File Size', value: 'fileSize' }
      ],
      sortOrderOptions: [
        { label: 'Newest First', value: 'desc' },
        { label: 'Oldest First', value: 'asc' }
      ],
      dateRangePresets: [
        { label: 'All Time', value: 'all' },
        { label: 'Last 24 Hours', value: 'day' },
        { label: 'Last Week', value: 'week' },
        { label: 'Last Month', value: 'month' },
        { label: 'Last 3 Months', value: 'quarter' },
        { label: 'Last Year', value: 'year' },
        { label: 'Custom Range', value: 'custom' }
      ]
    };
  }

  // Get filter options
  getStatusOptions(): FilterOption[] {
    return this.filtersConfigSubject.value.statusOptions;
  }

  getResolutionOptions(): FilterOption[] {
    return this.filtersConfigSubject.value.resolutionOptions;
  }

  getSortOptions(): FilterOption[] {
    return this.filtersConfigSubject.value.sortOptions;
  }

  getSortOrderOptions(): FilterOption[] {
    return this.filtersConfigSubject.value.sortOrderOptions;
  }

  getDateRangePresets(): FilterOption[] {
    return this.filtersConfigSubject.value.dateRangePresets;
  }

  // Update filter options with counts (if available from API)
  updateFilterCounts(statusCounts?: Record<string, number>, resolutionCounts?: Record<string, number>): void {
    const currentConfig = this.filtersConfigSubject.value;

    const updatedConfig: FilterConfiguration = {
      ...currentConfig,
      statusOptions: currentConfig.statusOptions.map(option => ({
        ...option,
        count: statusCounts?.[option.value]
      })),
      resolutionOptions: currentConfig.resolutionOptions.map(option => ({
        ...option,
        count: resolutionCounts?.[option.value]
      }))
    };

    this.filtersConfigSubject.next(updatedConfig);
  }

  // Parse and validate filters
  parseFilters(queryParams: any): VideoFilters {
    const filters: VideoFilters = {};

    // Status filter
    if (queryParams.status && this.isValidStatus(queryParams.status)) {
      filters.status = queryParams.status;
    }

    // Search filter
    if (queryParams.search && typeof queryParams.search === 'string') {
      filters.search = queryParams.search.trim();
    }

    // Resolution filter
    if (queryParams.resolution && this.isValidResolution(queryParams.resolution)) {
      filters.resolution = queryParams.resolution;
    }

    // Date filters
    if (queryParams.dateFrom && this.isValidDate(queryParams.dateFrom)) {
      filters.dateFrom = queryParams.dateFrom;
    }

    if (queryParams.dateTo && this.isValidDate(queryParams.dateTo)) {
      filters.dateTo = queryParams.dateTo;
    }

    // Tags filter
    if (queryParams.tags) {
      if (Array.isArray(queryParams.tags)) {
        filters.tags = queryParams.tags.filter((tag: any) => typeof tag === 'string');
      } else if (typeof queryParams.tags === 'string') {
        filters.tags = queryParams.tags.split(',').map((tag: string) => tag.trim()).filter((tag: string | any[]) => tag.length > 0);
      }
    }

    // Sort filters
    if (queryParams.sortBy && this.isValidSortBy(queryParams.sortBy)) {
      filters.sortBy = queryParams.sortBy;
    }

    if (queryParams.sortOrder && this.isValidSortOrder(queryParams.sortOrder)) {
      filters.sortOrder = queryParams.sortOrder;
    }

    return filters;
  }

  // Convert filters to query parameters
  filtersToQueryParams(filters: VideoFilters): any {
    const params: any = {};

    if (filters.status && filters.status !== 'all') {
      params.status = filters.status;
    }

    if (filters.search && filters.search.trim()) {
      params.search = filters.search.trim();
    }

    if (filters.resolution && filters.resolution !== 'all') {
      params.resolution = filters.resolution;
    }

    if (filters.dateFrom) {
      params.dateFrom = filters.dateFrom;
    }

    if (filters.dateTo) {
      params.dateTo = filters.dateTo;
    }

    if (filters.tags && filters.tags.length > 0) {
      params.tags = filters.tags.join(',');
    }

    if (filters.sortBy) {
      params.sortBy = filters.sortBy;
    }

    if (filters.sortOrder) {
      params.sortOrder = filters.sortOrder;
    }

    return params;
  }

  // Generate date range from preset
  getDateRangeFromPreset(preset: string): { dateFrom?: string; dateTo?: string } {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    switch (preset) {
      case 'day':
        return {
          dateFrom: new Date(today.getTime() - 24 * 60 * 60 * 1000).toISOString(),
          dateTo: now.toISOString()
        };

      case 'week':
        return {
          dateFrom: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          dateTo: now.toISOString()
        };

      case 'month':
        return {
          dateFrom: new Date(today.getFullYear(), today.getMonth() - 1, today.getDate()).toISOString(),
          dateTo: now.toISOString()
        };

      case 'quarter':
        return {
          dateFrom: new Date(today.getFullYear(), today.getMonth() - 3, today.getDate()).toISOString(),
          dateTo: now.toISOString()
        };

      case 'year':
        return {
          dateFrom: new Date(today.getFullYear() - 1, today.getMonth(), today.getDate()).toISOString(),
          dateTo: now.toISOString()
        };

      default:
        return {};
    }
  }

  // Count active filters
  countActiveFilters(filters: VideoFilters): number {
    let count = 0;

    if (filters.status && filters.status !== 'all') count++;
    if (filters.search && filters.search.trim()) count++;
    if (filters.resolution && filters.resolution !== 'all') count++;
    if (filters.dateFrom || filters.dateTo) count++;
    if (filters.tags && filters.tags.length > 0) count++;
    if (filters.sortBy && filters.sortBy !== 'createdAt') count++;
    if (filters.sortOrder && filters.sortOrder !== 'desc') count++;

    this.activeFiltersCountSubject.next(count);
    return count;
  }

  // Check if filters have any active values
  hasActiveFilters(filters: VideoFilters): boolean {
    return this.countActiveFilters(filters) > 0;
  }

  // Reset filters to default values
  getDefaultFilters(): VideoFilters {
    return {
      status: 'ready',
      search: '',
      sortBy: 'createdAt',
      sortOrder: 'desc'
    };
  }

  // Validation methods
  private isValidStatus(status: any): status is VideoStatus | 'all' {
    return typeof status === 'string' &&
      ['all', 'ready', 'processing', 'pending', 'failed'].includes(status);
  }

  private isValidResolution(resolution: any): resolution is VideoResolution | 'all' {
    return typeof resolution === 'string' &&
      ['all', '480p', '720p', '1080p', '1440p', '2160p'].includes(resolution);
  }

  private isValidSortBy(sortBy: any): sortBy is VideoFilters['sortBy'] {
    return typeof sortBy === 'string' &&
      ['createdAt', 'title', 'duration', 'fileSize'].includes(sortBy);
  }

  private isValidSortOrder(sortOrder: any): sortOrder is VideoFilters['sortOrder'] {
    return typeof sortOrder === 'string' &&
      ['asc', 'desc'].includes(sortOrder);
  }

  private isValidDate(date: any): boolean {
    if (typeof date !== 'string') return false;
    const parsedDate = new Date(date);
    return !isNaN(parsedDate.getTime());
  }

  // Search suggestions and auto-complete
  generateSearchSuggestions(searchTerm: string, availableTags: string[] = []): string[] {
    if (!searchTerm || searchTerm.length < 2) {
      return [];
    }

    const suggestions: string[] = [];
    const lowerSearchTerm = searchTerm.toLowerCase();

    // Add matching tags as suggestions
    const matchingTags = availableTags.filter(tag =>
      tag.toLowerCase().includes(lowerSearchTerm)
    ).slice(0, 5);

    suggestions.push(...matchingTags);

    // Add common search patterns
    const commonPatterns = [
      'resolution:720p',
      'resolution:1080p',
      'status:ready',
      'duration:>5min',
      'uploaded:today'
    ];

    const matchingPatterns = commonPatterns.filter(pattern =>
      pattern.toLowerCase().includes(lowerSearchTerm)
    ).slice(0, 3);

    suggestions.push(...matchingPatterns);

    return suggestions.slice(0, 8); // Limit to 8 suggestions
  }

  // Filter combination logic
  combineFilters(baseFilters: VideoFilters, additionalFilters: Partial<VideoFilters>): VideoFilters {
    return {
      ...baseFilters,
      ...additionalFilters,
      // Special handling for arrays
      tags: additionalFilters.tags || baseFilters.tags
    };
  }

  // Export/Import filter presets
  exportFilterPreset(name: string, filters: VideoFilters): string {
    const preset = {
      name,
      filters,
      createdAt: new Date().toISOString()
    };
    return JSON.stringify(preset);
  }

  importFilterPreset(presetJson: string): { name: string; filters: VideoFilters } | null {
    try {
      const preset = JSON.parse(presetJson);
      if (preset.name && preset.filters) {
        return {
          name: preset.name,
          filters: this.parseFilters(preset.filters)
        };
      }
    } catch (error) {
      console.error('Failed to import filter preset:', error);
    }
    return null;
  }
}
