import { ApplicationConfig, provideZonelessChangeDetection } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';

// Điểm lắp ráp: chỉ khai báo provider, không có logic cần test. Ứng dụng chạy zoneless (không có zone.js).
export const appConfig: ApplicationConfig = {
  providers: [provideZonelessChangeDetection(), provideHttpClient()],
};
