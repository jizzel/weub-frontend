import { Injectable, ComponentRef, ViewContainerRef, inject } from '@angular/core';
import {ConfirmDialog as ConfirmDialogComponent, ConfirmDialogData} from './confirm-dialog/confirm-dialog';

@Injectable({
  providedIn: 'root'
})
export class ConfirmDialogService {
  open(
    data: ConfirmDialogData,
    viewContainerRef: ViewContainerRef
  ): Promise<boolean> {
    return new Promise((resolve) => {
      const componentRef = this.createComponent(data, viewContainerRef);

      componentRef.instance.isOpen = true;

      // Handle confirmation
      componentRef.instance.confirm.subscribe(() => {
        resolve(true);
        this.destroyComponent(componentRef);
      });

      // Handle cancellation
      componentRef.instance.cancel.subscribe(() => {
        resolve(false);
        this.destroyComponent(componentRef);
      });

      // Optionally handle close event if needed
      componentRef.instance.closed.subscribe(() => {
        this.destroyComponent(componentRef);
      });
    });
  }

  private createComponent(
    data: ConfirmDialogData,
    viewContainerRef: ViewContainerRef
  ): ComponentRef<ConfirmDialogComponent> {
    const componentRef = viewContainerRef.createComponent(ConfirmDialogComponent);
    componentRef.instance.data = data;
    return componentRef;
  }

  private destroyComponent(componentRef: ComponentRef<ConfirmDialogComponent>): void {
    componentRef.destroy();
  }
}
