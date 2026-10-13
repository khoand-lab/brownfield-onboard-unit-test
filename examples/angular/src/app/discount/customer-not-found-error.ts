export class CustomerNotFoundError extends Error {
  constructor(readonly customerId: string) {
    super(`customer not found: ${customerId}`);
    this.name = 'CustomerNotFoundError';
  }
}
