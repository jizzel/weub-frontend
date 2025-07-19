import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-footer',
  imports: [CommonModule, RouterModule],
  templateUrl: './footer.html',
  styleUrl: './footer.css'
})
export class Footer {
  currentYear = new Date().getFullYear();

  // App version - could be injected from environment
  appVersion = '1.0.0';

  // Social/external links
  links = {
    github: 'https://github.com/weub/weub',
    docs: '/docs',
    api: '/api/docs',
    support: 'mailto:support@weub.com'
  };

  // Footer navigation links
  footerLinks = [
    { label: 'Home', route: '/' },
    { label: 'Upload', route: '/upload' },
    { label: 'Browse', route: '/videos' },
    { label: 'Statistics', route: '/stats' }
  ];

  // Legal/info links
  legalLinks = [
    { label: 'Privacy Policy', route: '/privacy' },
    { label: 'Terms of Service', route: '/terms' },
    { label: 'API Documentation', external: true, url: this.links.api }
  ];

  onLinkClick(link: any): void {
    if (link.external && link.url) {
      window.open(link.url, '_blank', 'noopener,noreferrer');
    }
  }
}
