import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {

  constructor() { }

  // Main show method using SweetAlert2
  show(toast: Omit<ToastMessage, 'id'>): void {
    const duration = toast.duration || 3000;
    let colorClass = 'color-info';
    
    switch (toast.type) {
      case 'success':
        colorClass = 'color-success';
        break;
      case 'error':
        colorClass = 'color-danger';
        break;
      case 'warning':
        colorClass = 'color-warning';
        break;
      case 'info':
        colorClass = 'color-info';
        break;
    }

    const swalToast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: duration,
      showCloseButton: true,
      customClass: {
        popup: colorClass,
      },
    });

    swalToast.fire({
      title: toast.title || toast.message,
    });
  }

  success(message: string, title?: string, duration?: number): void {
    const swalToast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: duration || 3000,
      showCloseButton: true,
      customClass: {
        popup: 'color-success',
      },
    });
    swalToast.fire({
      title: title || message,
    });
  }

  danger(message: string, title?: string, duration?: number): void {
    const swalToast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: duration || 3000,
      showCloseButton: true,
      customClass: {
        popup: 'color-danger',
      },
    });
    swalToast.fire({
      title: title || message,
    });
  }

  error(message: string, title?: string, duration?: number): void {
    this.danger(message, title, duration);
  }

  warning(message: string, title?: string, duration?: number): void {
    const swalToast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: duration || 3000,
      showCloseButton: true,
      customClass: {
        popup: 'color-warning',
      },
    });
    swalToast.fire({
      title: title || message,
    });
  }

  info(message: string, title?: string, duration?: number): void {
    const swalToast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: duration || 3000,
      showCloseButton: true,
      customClass: {
        popup: 'color-info',
      },
    });
    swalToast.fire({
      title: title || message,
    });
  }

  // Method to show clickable toast with callback
  clickable(message: string) {
    Swal.fire({
      toast: true,
      position: 'top-end',
      text: message,
      showCloseButton: true,
      showConfirmButton: false,
    }).then((result) => {
      if (result.isDismissed) {
        this.info('Thanks for clicking the Dismiss button!');
      }
    });
  }

  // Method to show custom colored toast
  colored(message: string, color: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark', duration: number = 3000) {
    const swalToast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: duration,
      showCloseButton: true,
      customClass: {
        popup: `color-${color}`,
      },
    });
    swalToast.fire({
      title: message,
    });
  }

  // Legacy methods for backward compatibility
  remove(id: string): void {
    // Not needed with SweetAlert2 as it handles removal automatically
  }

  clear(): void {
    Swal.close();
  }
}