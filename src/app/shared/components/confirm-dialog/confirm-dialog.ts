import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface ConfirmDialogData {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'info' | 'warning' | 'danger';
  icon?: string;
}

@Component({
  selector: 'app-confirm-dialog',
  imports: [CommonModule],
  templateUrl: './confirm-dialog.html',
  styleUrl: './confirm-dialog.css'
})
export class ConfirmDialog implements OnInit, OnDestroy {
  @Input() isOpen = false;
  @Input() data: ConfirmDialogData = {
    title: 'Confirm Action',
    message: 'Are you sure you want to proceed?',
    type: 'info'
  };
  @Input() closeOnBackdrop = true;
  @Input() closeOnEscape = true;
  @Input() isProcessing = false;

  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();
  @Output() closed = new EventEmitter<void>();

  get type(): string {
    return this.data.type || 'info';
  }

  get iconBackgroundClass(): string {
    const classes = {
      info: 'bg-blue-100',
      warning: 'bg-yellow-100',
      danger: 'bg-red-100'
    };
    return classes[this.type as keyof typeof classes] || classes.info;
  }

  get iconClass(): string {
    const classes = {
      info: 'text-blue-600',
      warning: 'text-yellow-600',
      danger: 'text-red-600'
    };
    return classes[this.type as keyof typeof classes] || classes.info;
  }

  get confirmButtonClass(): string {
    const classes = {
      info: 'text-white bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
      warning: 'text-white bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500',
      danger: 'text-white bg-red-600 hover:bg-red-700 focus:ring-red-500'
    };
    return classes[this.type as keyof typeof classes] || classes.info;
  }

  ngOnInit(): void {
    if (this.closeOnEscape) {
      document.addEventListener('keydown', this.handleEscapeKey);
    }
  }

  ngOnDestroy(): void {
    if (this.closeOnEscape) {
      document.removeEventListener('keydown', this.handleEscapeKey);
    }
  }

  onConfirm(): void {
    this.confirm.emit();
  }

  onCancel(): void {
    this.cancel.emit();
    this.close();
  }

  onBackdropClick(): void {
    if (this.closeOnBackdrop && !this.isProcessing) {
      this.onCancel();
    }
  }

  private handleEscapeKey = (event: KeyboardEvent): void => {
    if (event.key === 'Escape' && this.isOpen && !this.isProcessing) {
      this.onCancel();
    }
  };

  private close(): void {
    this.isOpen = false;
    this.closed.emit();
  }
}
