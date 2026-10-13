import { CustomerDiscount } from './discount/CustomerDiscount';

export function App() {
  return (
    <main>
      <h1>Shop</h1>
      <CustomerDiscount customerId="c-1" />
    </main>
  );
}
