import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';
import {Loading} from '../../../core/services/loading';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './header.html',
  styleUrls: ['./header.css']
})
export class Header implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private loadingService = inject(Loading);

  searchForm: FormGroup;
  isSearchActive = false;
  isMobileMenuOpen = false;
  currentRoute = '';
  isLoading$ = this.loadingService.loading$;

  readonly navigationItems = [
    { path: '/', label: 'Home', icon: 'home' },
    { path: '/upload', label: 'Upload', icon: 'upload' },
    { path: '/videos', label: 'Browse', icon: 'video' },
    { path: '/stats', label: 'Stats', icon: 'stats' }
  ];

  constructor() {
    this.searchForm = this.fb.group({
      query: ['']
    });
  }

  ngOnInit(): void {
    // Track current route for active nav highlighting
    this.router.events
      .pipe(takeUntil(this.destroy$))
      .subscribe(event => {
        if (event instanceof NavigationEnd) {
          this.currentRoute = event.urlAfterRedirects;
        }
      });

    // Handle search form changes
    this.searchForm.get('query')?.valueChanges
      .pipe(
        takeUntil(this.destroy$),
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(query => {
        if (query?.trim()) {
          this.handleSearch(query.trim());
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  toggleSearch(): void {
    this.isSearchActive = !this.isSearchActive;
    if (!this.isSearchActive) {
      this.searchForm.reset();
    }
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen = false;
  }

  handleSearch(query: string): void {
    if (query) {
      this.router.navigate(['/videos'], {
        queryParams: { search: query }
      });
      this.isSearchActive = false;
    }
  }

  onSearchSubmit(): void {
    const query = this.searchForm.get('query')?.value?.trim();
    if (query) {
      this.handleSearch(query);
    }
  }

  isActiveRoute(path: string): boolean {
    if (path === '/') {
      return this.currentRoute === '/';
    }
    return this.currentRoute.startsWith(path);
  }

  navigateToUpload(): void {
    this.router.navigate(['/upload']);
    this.closeMobileMenu();
  }
}
