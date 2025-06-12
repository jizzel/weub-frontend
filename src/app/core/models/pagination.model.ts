export interface Pagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginationRequest {
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'title' | 'duration';
  sortOrder?: 'asc' | 'desc';
}
