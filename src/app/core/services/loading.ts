import { Injectable } from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class Loading {
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private loadingCountSubject = new BehaviorSubject<number>(0);
  private loadingStatesSubject = new BehaviorSubject<Map<string, boolean>>(new Map());

  public loading$ = this.loadingSubject.asObservable();
  public loadingCount$ = this.loadingCountSubject.asObservable();

  // Start global loading
  startLoading(): void {
    const count = this.loadingCountSubject.value + 1;
    this.loadingCountSubject.next(count);
    this.loadingSubject.next(true);
  }

  // Stop global loading
  stopLoading(): void {
    const count = Math.max(0, this.loadingCountSubject.value - 1);
    this.loadingCountSubject.next(count);
    this.loadingSubject.next(count > 0);
  }

  // Start loading for specific key
  startLoadingFor(key: string): void {
    const states = this.loadingStatesSubject.value;
    states.set(key, true);
    this.loadingStatesSubject.next(new Map(states));
  }

  // Stop loading for specific key
  stopLoadingFor(key: string): void {
    const states = this.loadingStatesSubject.value;
    states.delete(key);
    this.loadingStatesSubject.next(new Map(states));
  }

  // Check if loading for specific key
  isLoadingFor(key: string): Observable<boolean> {
    return new Observable(observer => {
      this.loadingStatesSubject.subscribe(states => {
        observer.next(states.has(key));
      });
    });
  }

  // Get current loading state
  isLoading(): boolean {
    return this.loadingSubject.value;
  }

  // Reset all loading states
  reset(): void {
    this.loadingSubject.next(false);
    this.loadingCountSubject.next(0);
    this.loadingStatesSubject.next(new Map());
  }
}
