import { Component, EventEmitter, Output, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';

export interface VideoFiltersInterface {
  resolution?: string;
  uploadDateFrom?: string;
  uploadDateTo?: string;
  status?: string;
  tags?: string[];
  sortBy?: 'uploadDate' | 'title' | 'duration';
  sortOrder?: 'asc' | 'desc';
}

@Component({
  selector: 'app-video-filters',
  imports: [CommonModule, FormsModule],
  templateUrl: './video-filters.html',
  styleUrl: './video-filters.css'
})
export class VideoFilters implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  @Output() filtersChanged = new EventEmitter<VideoFiltersInterface>();

  showAdvanced = false;
  tagInput = '';

  currentFilters: VideoFiltersInterface = {
    resolution: '',
    uploadDateFrom: '',
    uploadDateTo: '',
    status: '',
    tags: [],
    sortBy: 'uploadDate',
    sortOrder: 'desc'
  };

  ngOnInit() {
    // Initialize with default filters
    this.onFilterChange();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  toggleFilters() {
    this.showAdvanced = !this.showAdvanced;
  }

  toggleSortOrder() {
    this.currentFilters.sortOrder = this.currentFilters.sortOrder === 'asc' ? 'desc' : 'asc';
    this.onFilterChange();
  }

  addTag(event: Event) {
    event.preventDefault();
    const tag = this.tagInput.trim();
    if (tag && !this.currentFilters.tags?.includes(tag)) {
      if (!this.currentFilters.tags) {
        this.currentFilters.tags = [];
      }
      this.currentFilters.tags.push(tag);
      this.tagInput = '';
      this.onFilterChange();
    }
  }

  removeTag(tag: string) {
    if (this.currentFilters.tags) {
      this.currentFilters.tags = this.currentFilters.tags.filter(t => t !== tag);
      this.onFilterChange();
    }
  }

  onFilterChange() {
    // Emit the current filters
    const filters = this.getCleanFilters();
    this.filtersChanged.emit(filters);
  }

  applyFilters() {
    // Force emit current filters
    const filters = this.getCleanFilters();
    this.filtersChanged.emit(filters);
  }

  clearAllFilters() {
    this.currentFilters = {
      resolution: '',
      uploadDateFrom: '',
      uploadDateTo: '',
      status: '',
      tags: [],
      sortBy: 'uploadDate',
      sortOrder: 'desc'
    };
    this.tagInput = '';
    this.onFilterChange();
  }

  getActiveFiltersCount(): number {
    let count = 0;

    if (this.currentFilters.resolution) count++;
    if (this.currentFilters.status) count++;
    if (this.currentFilters.uploadDateFrom) count++;
    if (this.currentFilters.uploadDateTo) count++;
    if (this.currentFilters.tags && this.currentFilters.tags.length > 0) count++;

    return count;
  }

  private getCleanFilters(): VideoFiltersInterface {
    const filters: VideoFiltersInterface = {
      sortBy: this.currentFilters.sortBy,
      sortOrder: this.currentFilters.sortOrder
    };

    // Only include non-empty values
    if (this.currentFilters.resolution) {
      filters.resolution = this.currentFilters.resolution;
    }
    if (this.currentFilters.status) {
      filters.status = this.currentFilters.status;
    }
    if (this.currentFilters.uploadDateFrom) {
      filters.uploadDateFrom = this.currentFilters.uploadDateFrom;
    }
    if (this.currentFilters.uploadDateTo) {
      filters.uploadDateTo = this.currentFilters.uploadDateTo;
    }
    if (this.currentFilters.tags && this.currentFilters.tags.length > 0) {
      filters.tags = [...this.currentFilters.tags];
    }

    return filters;
  }
}
