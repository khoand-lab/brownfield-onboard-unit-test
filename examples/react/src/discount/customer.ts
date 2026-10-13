export type Tier = 'REGULAR' | 'SILVER' | 'GOLD' | 'PLATINUM';

export interface Customer {
  id: string;
  name: string;
  tier: Tier;
  ordersLastYear: number;
}
