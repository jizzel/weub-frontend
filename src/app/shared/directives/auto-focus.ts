import {
  Directive,
  ElementRef,
  Input,
  OnInit,
  OnDestroy,
  AfterViewInit,
  Renderer2
} from '@angular/core';

@Directive({
  selector: '[appAutoFocus]',
})
export class AutoFocus implements OnInit, AfterViewInit, OnDestroy {
  @Input() appAutoFocus: boolean | string = true;
  @Input() focusDelay = 0;
  @Input() selectText = false;
  @Input() focusOnInit = true;
  @Input() focusOnVisible = false;

  private timeoutId?: number;
  private intersectionObserver?: IntersectionObserver;

  constructor(
    private el: ElementRef<HTMLElement>,
    private renderer: Renderer2
  ) {}

  ngOnInit(): void {
    if (this.focusOnVisible) {
      this.setupVisibilityObserver();
    }
  }

  ngAfterViewInit(): void {
    if (this.shouldFocus() && this.focusOnInit && !this.focusOnVisible) {
      this.focus();
    }
  }

  ngOnDestroy(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }

    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
    }
  }

  private shouldFocus(): boolean {
    if (typeof this.appAutoFocus === 'string') {
      return this.appAutoFocus.toLowerCase() !== 'false';
    }
    return this.appAutoFocus;
  }

  private setupVisibilityObserver(): void {
    if (!('IntersectionObserver' in window)) {
      // Fallback for browsers without IntersectionObserver
      this.focus();
      return;
    }

    this.intersectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && this.shouldFocus()) {
            this.focus();
            // Disconnect after first focus to prevent repeated focusing
            this.intersectionObserver?.disconnect();
          }
        });
      },
      {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
      }
    );

    this.intersectionObserver.observe(this.el.nativeElement);
  }

  private focus(): void {
    if (this.focusDelay > 0) {
      this.timeoutId = window.setTimeout(() => {
        this.performFocus();
      }, this.focusDelay);
    } else {
      // Use requestAnimationFrame to ensure DOM is ready
      requestAnimationFrame(() => {
        this.performFocus();
      });
    }
  }

  private performFocus(): void {
    const element = this.el.nativeElement;

    if (!element || !this.isElementFocusable(element)) {
      return;
    }

    try {
      element.focus({ preventScroll: false });

      if (this.selectText && this.isTextInputElement(element)) {
        (element as HTMLInputElement | HTMLTextAreaElement).select();
      }
    } catch (error) {
      console.warn('AutoFocus directive: Unable to focus element', error);
    }
  }

  private isElementFocusable(element: HTMLElement): boolean {
    // Check if element is visible and not disabled
    if (!element.offsetParent && element.offsetWidth === 0 && element.offsetHeight === 0) {
      return false;
    }

    // Check if element is disabled
    if (element.hasAttribute('disabled')) {
      return false;
    }

    // Check if element is focusable
    const focusableElements = [
      'input',
      'textarea',
      'select',
      'button',
      'a',
      'area',
      'object',
      'embed',
      'iframe'
    ];

    const tagName = element.tagName.toLowerCase();

    // Check if it's a naturally focusable element
    if (focusableElements.includes(tagName)) {
      return true;
    }

    // Check if it has tabindex
    if (element.hasAttribute('tabindex')) {
      const tabIndex = parseInt(element.getAttribute('tabindex') || '0', 10);
      return tabIndex >= 0;
    }

    // Check if it's contenteditable
    if (element.hasAttribute('contenteditable')) {
      const contentEditable = element.getAttribute('contenteditable');
      return contentEditable === 'true' || contentEditable === '';
    }

    return false;
  }

  private isTextInputElement(element: HTMLElement): boolean {
    const tagName = element.tagName.toLowerCase();

    if (tagName === 'textarea') {
      return true;
    }

    if (tagName === 'input') {
      const inputType = (element as HTMLInputElement).type?.toLowerCase() || 'text';
      const textInputTypes = [
        'text',
        'password',
        'email',
        'url',
        'tel',
        'search',
        'number'
      ];
      return textInputTypes.includes(inputType);
    }

    return false;
  }

  /**
   * Manually trigger focus
   */
  public triggerFocus(): void {
    if (this.shouldFocus()) {
      this.focus();
    }
  }

  /**
   * Check if element currently has focus
   */
  public hasFocus(): boolean {
    return document.activeElement === this.el.nativeElement;
  }
}
