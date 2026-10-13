interface DiscountBadgeProps {
  rate: number;
  disabled?: boolean;
  onApply: (rate: number) => void;
}

/** Nhãn giảm giá: ẩn khi tỉ lệ bằng 0; nút "Áp dụng" gọi onApply kèm tỉ lệ. */
export function DiscountBadge({ rate, disabled = false, onApply }: DiscountBadgeProps) {
  if (rate <= 0) {
    return null;
  }
  return (
    <div className="discount-badge">
      <span className="badge">-{Math.round(rate * 100)}%</span>
      <button type="button" disabled={disabled} onClick={() => onApply(rate)}>
        Áp dụng
      </button>
    </div>
  );
}
