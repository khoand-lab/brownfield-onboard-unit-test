// Hard to test on purpose: wall clock and global fetch.
export async function exportInvoice(orderId) {
  const name = `invoice-${orderId}-${Date.now()}.txt`;
  await fetch('http://accounting.internal/api', { method: 'POST', body: name });
  return name;
}
