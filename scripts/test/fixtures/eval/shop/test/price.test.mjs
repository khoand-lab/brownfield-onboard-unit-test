import { lineTotal } from '../src/price.mjs';

export default [
  { name: 'price > lineTotal multiplies', fn: () => lineTotal(2, 3) === 6 },
  { name: 'price > lineTotal rejects zero', fn: () => { try { lineTotal(1, 0); return false; } catch { return true; } } },
];
