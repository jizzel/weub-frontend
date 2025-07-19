import { Component, EventEmitter, Output, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';

export interface SearchQuery {
  query: string;
  searchIn: 'all' | 'title' | 'tags' | 'description';
}

@Component({
  selector: 'app-search-bar',
  imports: [CommonModule, FormsModule],
  templateUrl: './search-bar.html',
  styleUrl: './search-bar.css'
})
export class SearchBar implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();

  @ViewChild('searchInput') searchInputRef!: ElementRef<HTMLInputElement>;

  @Output() searchChanged = new EventEmitter<SearchQuery>();
  @Output() searchSubmitted = new EventEmitter<SearchQuery>();

  searchTerm = '';
  searchIn: 'all' | 'title' | 'tags' | 'description' = 'all';
  isSearchFocused = false;
  showAdvancedSearch = false;
  showSuggestions = false;
  selectedSuggestionIndex = -1;

  // Advanced search options
  exactMatch = false;
  caseSensitive = false;
  includeArchived = false;
  minDuration: number | null = null;

  // Search suggestions and history
  searchSuggestions: string[] = [];
  recentSearches: string[] = [];

  // Mock suggestions - in real app, these would come from API
  private mockSuggestions = [
    'tutorial', 'javascript', 'angular', 'web development', 'coding',
    'react', 'typescript', 'css', 'html', 'frontend', 'backend',
    'programming', 'software', 'technology', 'demo', 'presentation'
  ];

  ngOnInit() {
    // Set up debounced search
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(term => {
      this.performSearch(term, false);
    });

    // Load recent searches from localStorage (if available in real environment)
    this.loadRecentSearches();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSearchInput() {
    this.searchSubject.next(this.searchTerm);
    this.updateSearchSuggestions();
  }

  onSearchSubmit() {
    if (this.searchTerm.trim()) {
      this.performSearch(this.searchTerm, true);
      this.addToRecentSearches(this.searchTerm);
      this.hideSuggestions();
    }
  }

  onSearchFocus() {
    this.isSearchFocused = true;
    if (this.searchTerm) {
      this.updateSearchSuggestions();
      this.showSuggestions = true;
    }
  }

  onSearchBlur() {
    this.isSearchFocused = false;
    // Delay hiding suggestions to allow for clicks
    setTimeout(() => {
      this.showSuggestions = false;
    }, 200);
  }

  onSearchTypeChange() {
    if (this.searchTerm) {
      this.performSearch(this.searchTerm, true);
    }
  }

  onAdvancedOptionChange() {
    if (this.searchTerm) {
      this.performSearch(this.searchTerm, true);
    }
  }

  clearSearch() {
    this.searchTerm = '';
    this.hideSuggestions();
    this.performSearch('', true);
    this.searchInputRef.nativeElement.focus();
  }

  toggleAdvancedSearch() {
    this.showAdvancedSearch = !this.showAdvancedSearch;
  }

  selectSuggestion(suggestion: string) {
    this.searchTerm = suggestion;
    this.hideSuggestions();
    this.performSearch(suggestion, true);
    this.addToRecentSearches(suggestion);
  }

  selectRecentSearch(recent: string) {
    this.searchTerm = recent;
    this.performSearch(recent, true);
  }

  private performSearch(term: string, isSubmitted: boolean) {
    const searchQuery: SearchQuery = {
      query: term.trim(),
      searchIn: this.searchIn
    };

    // Add advanced options to the query if needed
    const extendedQuery = {
      ...searchQuery,
      exactMatch: this.exactMatch,
      caseSensitive: this.caseSensitive,
      includeArchived: this.includeArchived,
      minDuration: this.minDuration
    };

    if (isSubmitted) {
      this.searchSubmitted.emit(extendedQuery);
    } else {
      this.searchChanged.emit(extendedQuery);
    }
  }

  private updateSearchSuggestions() {
    if (!this.searchTerm.trim()) {
      this.searchSuggestions = [];
      this.showSuggestions = false;
      return;
    }

    const term = this.searchTerm.toLowerCase();
    this.searchSuggestions = this.mockSuggestions
      .filter(suggestion =>
        suggestion.toLowerCase().includes(term) &&
        suggestion.toLowerCase() !== term
      )
      .slice(0, 5);

    this.showSuggestions = this.searchSuggestions.length > 0 && this.isSearchFocused;
    this.selectedSuggestionIndex = -1;
  }

  private hideSuggestions() {
    this.showSuggestions = false;
    this.selectedSuggestionIndex = -1;
  }

  private addToRecentSearches(term: string) {
    if (!term.trim()) return;

    // Remove if already exists
    this.recentSearches = this.recentSearches.filter(search =>
      search.toLowerCase() !== term.toLowerCase()
    );

    // Add to beginning
    this.recentSearches.unshift(term);

    // Keep only last 10
    this.recentSearches = this.recentSearches.slice(0, 10);

    // Save to localStorage (in real environment)
    this.saveRecentSearches();
  }

  private loadRecentSearches() {
    // In a real app, you would load from localStorage or a service
    // For now, we'll use mock data
    this.recentSearches = [
      'javascript tutorial',
      'angular components',
      'css animations'
    ];
  }

  private saveRecentSearches() {
    // In a real app, you would save to localStorage or a service
    // localStorage.setItem('recentSearches', JSON.stringify(this.recentSearches));
  }
}
