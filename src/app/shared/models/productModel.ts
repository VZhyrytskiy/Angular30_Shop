import { Categories } from './categories';

export interface ProductModel {
    name: string;
    description: string;
    price: number;
    category: Categories;
    isAvailable: boolean;
  }
