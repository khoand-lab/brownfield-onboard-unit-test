import type { Customer } from '../discount/customer';

export const CUSTOMER_API = '/api/customers';

/** Gọi API khách hàng. Trả về null khi API trả 404. */
export async function fetchCustomer(id: string): Promise<Customer | null> {
  const response = await fetch(`${CUSTOMER_API}/${encodeURIComponent(id)}`);
  if (response.status === 404) {
    return null;
  }
  if (!response.ok) {
    throw new Error(`customer api failed: ${response.status}`);
  }
  return (await response.json()) as Customer;
}
