import {HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpEvent, HttpResponse} from '@angular/common/http';
import {Observable, of} from 'rxjs';
import {tap, shareReplay, finalize} from 'rxjs/operators';

interface CacheEntry {
  response: HttpResponse<any>;
  timestamp: number;
  ttl: number;
}

// Encapsulated cache state
const cache = new Map<string, CacheEntry>();
const inFlightRequests = new Map<string, Observable<HttpEvent<any>>>();
const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes
const MAX_CACHE_SIZE = 100;
let lastCleanup = Date.now();
const CLEANUP_INTERVAL = 10 * 60 * 1000; // 10 minutes

export const cacheInterceptor: HttpInterceptorFn = (req: HttpRequest<any>, next: HttpHandlerFn): Observable<HttpEvent<any>> => {
  if (req.method !== 'GET') return next(req);

  const skipCache = req.headers.has('X-Skip-Cache') ||
    req.url.includes('/status') ||
    req.url.includes('/health') ||
    req.url.includes('/stream/');

  if (skipCache) {
    const cleanReq = req.clone({headers: req.headers.delete('X-Skip-Cache')});
    return next(cleanReq);
  }

  const cacheKey = `${req.method}:${req.urlWithParams}`;
  const cached = getFromCache(cacheKey);

  if (cached) {
    console.log(`Cache hit for ${req.url}`);
    return of(cached.response);
  }

  const inFlight = inFlightRequests.get(cacheKey);
  if (inFlight) {
    console.log(`Request already in flight for ${req.url}`);
    return inFlight;
  }

  const request$ = next(req).pipe(
    tap((event) => {
      if (event instanceof HttpResponse) {
        addToCache(cacheKey, event, getCacheTTL(req));
      }
    }),
    shareReplay(1),
    finalize(() => {
      inFlightRequests.delete(cacheKey);
    })
  );

  inFlightRequests.set(cacheKey, request$);
  return request$;
};

// Internal helper functions
function getFromCache(key: string): CacheEntry | null {
  const entry = cache.get(key);
  if (!entry) return null;

  const now = Date.now();
  if (now - entry.timestamp > entry.ttl) {
    cache.delete(key);
    return null;
  }

  return entry;
}

function addToCache(key: string, response: HttpResponse<any>, ttl: number): void {
  if (cache.size >= MAX_CACHE_SIZE) evictOldestEntry();

  cache.set(key, {
    response: response.clone(),
    timestamp: Date.now(),
    ttl
  });

  cleanupExpiredEntries();
}

function getCacheTTL(req: HttpRequest<any>): number {
  const url = req.url.toLowerCase();

  if (url.includes('/assets/') || url.includes('/static/')) return 60 * 60 * 1000;
  if (url.includes('/user/') || url.includes('/profile/')) return 15 * 60 * 1000;
  if (url.includes('/config/') || url.includes('/settings/')) return 30 * 60 * 1000;
  if (url.includes('/categories') || url.includes('/tags') || url.includes('/lookup/')) return 60 * 60 * 1000;
  if (url.includes('/search/')) return 2 * 60 * 1000;
  if (url.includes('/dashboard/')) return 1 * 60 * 1000;

  const cacheControl = req.headers.get('Cache-Control');
  const maxAgeMatch = cacheControl?.match(/max-age=(\d+)/);
  if (maxAgeMatch) return parseInt(maxAgeMatch[1]) * 1000;

  return DEFAULT_TTL;
}

function cleanupExpiredEntries(): void {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;

  let removedCount = 0;
  for (const [key, entry] of cache.entries()) {
    if (now - entry.timestamp > entry.ttl) {
      cache.delete(key);
      removedCount++;
    }
  }

  lastCleanup = now;
  if (removedCount > 0) {
    console.log(`Removed ${removedCount} expired cache entries`);
  }
}

function evictOldestEntry(): void {
  let oldestKey: string | null = null;
  let oldestTime = Date.now();

  for (const [key, entry] of cache.entries()) {
    if (entry.timestamp < oldestTime) {
      oldestTime = entry.timestamp;
      oldestKey = key;
    }
  }

  if (oldestKey) {
    cache.delete(oldestKey);
    console.log(`Evicted oldest cache entry: ${oldestKey}`);
  }
}

// Optional utilities for managing cache externally
export function clearCache(): void {
  cache.clear();
  inFlightRequests.clear();
  console.log('Cache cleared');
}

export function clearCacheForPattern(pattern: string): void {
  let count = 0;
  for (const key of cache.keys()) {
    if (key.includes(pattern)) {
      cache.delete(key);
      count++;
    }
  }
  console.log(`Removed ${count} cache entries matching pattern: ${pattern}`);
}

export function getCacheStats(): { size: number; inFlight: number } {
  return {size: cache.size, inFlight: inFlightRequests.size};
}

