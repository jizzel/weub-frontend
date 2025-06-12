import {VideoResolution, VideoStatus} from './video.model';

export interface VideoFilters {
  status?: VideoStatus | 'all';
  search?: string;
  tags?: string[];
  dateFrom?: string;
  dateTo?: string;
  resolution?: VideoResolution | 'all';
  sortBy?: 'createdAt' | 'title' | 'duration';
  sortOrder?: 'asc' | 'desc';
}

export interface FilterOption {
  label: string;
  value: string;
  count?: number;
}
