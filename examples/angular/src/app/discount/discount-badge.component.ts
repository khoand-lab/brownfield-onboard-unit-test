import { Component, computed, input, output } from '@angular/core';

/** Nhãn giảm giá: ẩn khi tỉ lệ bằng 0; nút "Áp dụng" phát sự kiện applied kèm tỉ lệ. */
@Component({
  selector: 'app-discount-badge',
  template: `
    @if (visible()) {
      <span class="badge">{{ label() }}</span>
      <button type="button" [disabled]="disabled()" (click)="applied.emit(rate())">Áp dụng</button>
    }
  `,
})
export class DiscountBadgeComponent {
  readonly rate = input.required<number>();
  readonly disabled = input(false);
  readonly applied = output<number>();

  readonly visible = computed(() => this.rate() > 0);
  readonly label = computed(() => `-${Math.round(this.rate() * 100)}%`);
}
