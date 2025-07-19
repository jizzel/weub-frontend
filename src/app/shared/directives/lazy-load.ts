import {
  Directive,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  Renderer2
} from '@angular/core';

@Directive({
  selector: '[appLazyLoad]',
})
export class LazyLoad implements OnInit, OnDestroy {
  @Input('appLazyLoad') targetSrc!: string;
  @Input() placeholder?: string;
  @Input() errorSrc?: string;
  @Input() rootMargin = '50px';
  @Input() threshold = 0.1;
  @Input() fadeIn = true;
  @Input() retryAttempts = 3;

  @Output() loaded = new EventEmitter<void>();
  @Output() error = new EventEmitter<Event>();
  @Output() visible = new EventEmitter<void>();

  private observer?: IntersectionObserver;
  private currentRetryAttempt = 0;
  private hasLoaded = false;

  constructor(
    private el: ElementRef<HTMLImageElement>,
    private renderer: Renderer2
  ) {}

  ngOnInit(): void {
    this.setupIntersectionObserver();
    this.setPlaceholder();

    if (this.fadeIn) {
      this.renderer.setStyle(this.el.nativeElement, 'opacity', '0');
      this.renderer.setStyle(this.el.nativeElement, 'transition', 'opacity 0.3s ease-in-out');
    }
  }

  ngOnDestroy(): void {
    if (this.observer) {
      this.observer.disconnect();
    }
  }

  private setupIntersectionObserver(): void {
    if (!('IntersectionObserver' in window)) {
      // Fallback for browsers that don't support IntersectionObserver
      this.loadImage();
      return;
    }

    const options: IntersectionObserverInit = {
      rootMargin: this.rootMargin,
      threshold: this.threshold
    };

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !this.hasLoaded) {
          this.visible.emit();
          this.loadImage();
          this.observer?.unobserve(this.el.nativeElement);
        }
      });
    }, options);

    this.observer.observe(this.el.nativeElement);
  }

  private setPlaceholder(): void {
    if (this.placeholder) {
      this.renderer.setAttribute(this.el.nativeElement, 'src', this.placeholder);
    } else {
      // Create a simple placeholder using data URL for a gray rectangle
      const placeholderSrc = this.createPlaceholderDataUrl();
      this.renderer.setAttribute(this.el.nativeElement, 'src', placeholderSrc);
    }
  }

  private createPlaceholderDataUrl(): string {
    // Create a simple 1x1 gray pixel as placeholder
    return 'data:image/svg+xml;base64,' + btoa(`
      <svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#e5e7eb"/>
        <text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#9ca3af" font-family="Arial, sans-serif" font-size="12">
          Loading...
        </text>
      </svg>
    `);
  }

  private loadImage(): void {
    if (this.hasLoaded || !this.targetSrc) {
      return;
    }

    const img = new Image();

    img.onload = () => {
      this.hasLoaded = true;
      this.renderer.setAttribute(this.el.nativeElement, 'src', this.targetSrc);

      if (this.fadeIn) {
        // Small delay to ensure the image is rendered before fading in
        setTimeout(() => {
          this.renderer.setStyle(this.el.nativeElement, 'opacity', '1');
        }, 10);
      }

      this.loaded.emit();
    };

    img.onerror = (event) => {
      this.currentRetryAttempt++;

      if (this.currentRetryAttempt < this.retryAttempts) {
        // Retry after a delay
        setTimeout(() => {
          this.loadImage();
        }, 1000 * this.currentRetryAttempt); // Exponential backoff
      } else {
        // Max retries reached, show error image or keep placeholder
        if (this.errorSrc) {
          this.renderer.setAttribute(this.el.nativeElement, 'src', this.errorSrc);
        }
        if (event instanceof Event) {
          this.error.emit(event);
        }
      }
    };

    // Start loading the image
    img.src = this.targetSrc;
  }

  /**
   * Manually trigger image loading (useful for programmatic control)
   */
  public forceLoad(): void {
    if (!this.hasLoaded) {
      this.loadImage();
    }
  }

  /**
   * Reset the directive to initial state
   */
  public reset(): void {
    this.hasLoaded = false;
    this.currentRetryAttempt = 0;
    this.setPlaceholder();

    if (this.fadeIn) {
      this.renderer.setStyle(this.el.nativeElement, 'opacity', '0');
    }

    if (this.observer && this.targetSrc) {
      this.observer.observe(this.el.nativeElement);
    }
  }
}
