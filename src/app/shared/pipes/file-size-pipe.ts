import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'fileSize',
})
export class FileSizePipe implements PipeTransform {
  transform(bytes: number | null | undefined, precision: number = 2): string {
    if (bytes === null || bytes === undefined || isNaN(bytes)) {
      return '0 Bytes';
    }

    if (bytes === 0) {
      return '0 Bytes';
    }

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    if (i === 0) {
      return `${bytes} ${sizes[i]}`;
    }

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(precision))} ${sizes[i]}`;
  }
}
