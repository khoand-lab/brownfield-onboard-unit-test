export function discountRate(tier) {
  return { REGULAR: 0, GOLD: 0.2 }[tier] ?? 0;
}
