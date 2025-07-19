import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeResourceUrl, SafeUrl } from '@angular/platform-browser';

@Pipe({
  name: 'safeUrl',
})
export class SafeUrlPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}

  transform(url: string | null | undefined, type: 'url' | 'resourceUrl' = 'url'): SafeUrl | SafeResourceUrl | null {
    if (!url) {
      return null;
    }

    try {
      switch (type) {
        case 'resourceUrl':
          return this.sanitizer.bypassSecurityTrustResourceUrl(url);
        case 'url':
        default:
          return this.sanitizer.bypassSecurityTrustUrl(url);
      }
    } catch (error) {
      console.warn('SafeUrl pipe: Error sanitizing URL', error);
      return null;
    }
  }
}
