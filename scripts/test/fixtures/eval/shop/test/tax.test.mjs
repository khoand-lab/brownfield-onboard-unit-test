// Deliberately failing old test: expects 8% VAT, the code uses 10%.
export default [
  { name: 'tax > adds VAT', fn: () => Math.round(100 * 1.1) === 108 },
];
