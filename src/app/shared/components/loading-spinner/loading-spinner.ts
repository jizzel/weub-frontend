import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading-spinner',
  imports: [CommonModule],
  templateUrl: './loading-spinner.html',
  standalone: true,
  styleUrl: './loading-spinner.css'
})
export class LoadingSpinner {
  @Input() size: 'xs' | 'sm' | 'md' | 'lg' | 'xl' = 'md';
  @Input() color: 'primary' | 'secondary' | 'white' | 'gray' = 'primary';
  @Input() text?: string;
  @Input() showText = false;
  @Input() centered = true;
  @Input() overlay = false;
  @Input() ariaLabel = 'Loading';

  get containerClass(): string {
    const classes = [];

    if (this.centered) {
      classes.push('w-full h-full min-h-[2rem]');
    }

    if (this.overlay) {
      classes.push(
        'fixed inset-0 bg-black bg-opacity-50 z-50',
        'flex items-center justify-center'
      );
    }

    return classes.join(' ');
  }

  get spinnerClass(): string {
    const sizeClasses = {
      xs: 'w-3 h-3',
      sm: 'w-4 h-4',
      md: 'w-6 h-6',
      lg: 'w-8 h-8',
      xl: 'w-10 h-10'
    };

    const colorClasses = {
      primary: 'text-blue-600',
      secondary: 'text-gray-600',
      white: 'text-white',
      gray: 'text-gray-400'
    };

    return `${sizeClasses[this.size]} ${colorClasses[this.color]}`;
  }

  get textClass(): string {
    const colorClasses = {
      primary: 'text-blue-600',
      secondary: 'text-gray-600',
      white: 'text-white',
      gray: 'text-gray-400'
    };

    return colorClasses[this.color];
  }

  get borderWidth(): string {
    const widths = {
      xs: '1px',
      sm: '1px',
      md: '2px',
      lg: '2px',
      xl: '3px'
    };

    return widths[this.size];
  }
}
