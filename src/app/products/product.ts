export interface Product {
  id?: number;
  name: string;
  code: string;
  description?: string;
  status: 'available' | 'out_of_stock' | 'discontinued';
  image?: string; // Pole image - base64 string z natywnej funkcji aparatu
  imageUrl?: string; // Dla kompatybilności wstecznej
  createdAt?: string;
  updatedAt?: string;
}

