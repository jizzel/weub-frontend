import { VideoSummary } from '../../../core/models/video.model';
import { Pagination } from '../../../core/models/pagination.model';
import { VideoFilters } from '../../../core/models/filter.model';
import { SortOption } from '../../../core/models/streaming.model';

export interface VideoListState {
  videos: VideoSummary[];
  pagination: Pagination;
  loading: boolean;
  error: string | null;
  filters: VideoFilters;
  searchTerm: string;
  sortBy: SortOption;
}

export interface VideoListResponse {
  videos: VideoSummary[];
  pagination: Pagination;
}
