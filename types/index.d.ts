export type Customer = {
  id: string;
  name: string;
  phone: string;
  email: string;
  deleting?: boolean
  address: string;
  created_at?: string;
  updated_at?: string;
};

export type Inventory = {
  id?: string;
  name: string;
  quantity: number;
  description: string;
  unit_price: number;
  unit_cost: number;
  item_id?: string;
  reorder_level: number;
  deleting?: boolean
  reorder_timeline: number;
  created_at?: string;
  updated_at?: string;
}
