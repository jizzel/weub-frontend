import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-error-message',
  imports: [CommonModule],
  templateUrl: './error-message.html',
  standalone: true,
  styleUrl: './error-message.css'
})
export class ErrorMessage {
  @Input() title?: string;
  @Input() message!: string;
  @Input() details?: any;
  @Input() showDetails = false;
  @Input() type: 'error' | 'warning' | 'info' = 'error';
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() dismissible = true;
  @Input() retryable = false;
  @Input() showActions = true;
  @Input() visible = true;

  @Output() retry = new EventEmitter<void>();
  @Output() dismiss = new EventEmitter<void>();

  get containerClass(): string {
    const typeClasses = {
      error: 'bg-red-50 border-red-200',
      warning: 'bg-yellow-50 border-yellow-200',
      info: 'bg-blue-50 border-blue-200'
    };

    return typeClasses[this.type];
  }

  get iconClass(): string {
    const typeClasses = {
      error: 'text-red-400',
      warning: 'text-yellow-400',
      info: 'text-blue-400'
    };

    return typeClasses[this.type];
  }

  get titleClass(): string {
    const typeClasses = {
      error: 'text-red-800',
      warning: 'text-yellow-800',
      info: 'text-blue-800'
    };

    const sizeClasses = {
      sm: 'text-sm',
      md: 'text-base',
      lg: 'text-lg'
    };

    return `${typeClasses[this.type]} ${sizeClasses[this.size]}`;
  }

  get messageClass(): string {
    const typeClasses = {
      error: 'text-red-700',
      warning: 'text-yellow-700',
      info: 'text-blue-700'
    };

    const sizeClasses = {
      sm: 'text-sm',
      md: 'text-sm',
      lg: 'text-base'
    };

    return `${typeClasses[this.type]} ${sizeClasses[this.size]}`;
  }

  get actionClass(): string {
    const typeClasses = {
      error: 'text-red-600 hover:text-red-500',
      warning: 'text-yellow-600 hover:text-yellow-500',
      info: 'text-blue-600 hover:text-blue-500'
    };

    return typeClasses[this.type];
  }

  get closeButtonClass(): string {
    const typeClasses = {
      error: 'text-red-400 hover:text-red-500 focus:ring-red-500',
      warning: 'text-yellow-400 hover:text-yellow-500 focus:ring-yellow-500',
      info: 'text-blue-400 hover:text-blue-500 focus:ring-blue-500'
    };

    return typeClasses[this.type];
  }

  onRetry(): void {
    this.retry.emit();
  }

  onDismiss(): void {
    this.visible = false;
    this.dismiss.emit();
  }
}
