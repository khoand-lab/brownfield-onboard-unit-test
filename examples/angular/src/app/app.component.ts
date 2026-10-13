import { Component, signal } from '@angular/core';

import { DiscountBadgeComponent } from './discount/discount-badge.component';

// Khung ứng dụng: chỉ ghép component, không có logic cần test.
@Component({
  selector: 'app-root',
  imports: [DiscountBadgeComponent],
  template: `<app-discount-badge [rate]="rate()" (applied)="onApplied()" />`,
})
export class AppComponent {
  readonly rate = signal(0.2);

  onApplied(): void {
    console.log('discount applied');
  }
}
