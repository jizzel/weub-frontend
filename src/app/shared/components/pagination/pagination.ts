import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {Pagination as P} from '../../../core/models/pagination.model';

@Component({
  selector: 'app-pagination',
  imports: [CommonModule],
  templateUrl: './pagination.html',
  styleUrl: './pagination.css'
})
export class Pagination implements OnInit {
  @Input() pagination!: P;
  @Input() showFirstLast = true;
  @Input() maxVisiblePages = 7;

  @Output() pageChange = new EventEmitter<number>();

  visiblePages: (number | string)[] = [];

  ngOnInit(): void {
    this.calculateVisiblePages();
  }

  ngOnChanges(): void {
    this.calculateVisiblePages();
  }

  get startItem(): number {
    if (this.pagination.totalItems === 0) return 0;
    return (this.pagination.currentPage - 1) * this.pagination.itemsPerPage + 1;
  }

  get endItem(): number {
    const calculated = this.pagination.currentPage * this.pagination.itemsPerPage;
    return Math.min(calculated, this.pagination.totalItems);
  }

  onPageChange(page: number): void {
    if (page >= 1 && page <= this.pagination.totalPages && page !== this.pagination.currentPage) {
      this.pageChange.emit(page);
    }
  }

  trackByPage(index: number, page: number | string): number | string {
    return page;
  }

  private calculateVisiblePages(): void {
    const { currentPage, totalPages } = this.pagination;
    const pages: (number | string)[] = [];

    if (totalPages <= this.maxVisiblePages) {
      // Show all pages if total pages is less than max visible
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Calculate which pages to show with ellipsis
      const delta = Math.floor(this.maxVisiblePages / 2);
      const rangeStart = Math.max(2, currentPage - delta);
      const rangeEnd = Math.min(totalPages - 1, currentPage + delta);

      // Always show first page
      pages.push(1);

      // Add ellipsis if there's a gap
      if (rangeStart > 2) {
        pages.push('...');
      }

      // Add pages around current page
      for (let i = rangeStart; i <= rangeEnd; i++) {
        pages.push(i);
      }

      // Add ellipsis if there's a gap
      if (rangeEnd < totalPages - 1) {
        pages.push('...');
      }

      // Always show last page (if it's not the first page)
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }

    this.visiblePages = pages;
  }
}
