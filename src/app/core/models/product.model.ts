export interface Product {
  id?: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  imageUrl: string;
  badge?: string; // e.g. "¡Nuevo!", "Últimos", "Recomendado"
  createdAt?: Date;
}
