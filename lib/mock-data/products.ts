import { Faker } from '@faker-js/faker';
import {
  PaginatedResponse,
  PaginationParams,
  Schema,
  SchemaFunction,
  generateFakeData
} from '../utils';
import { Product } from '@/constants/data';
import { format } from 'date-fns';

interface SearchParams {
  name?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
}

const productSchema: { [K in keyof Product]: SchemaFunction<Product[K]> } = {
  id: (f: Faker) => f.number.int({ min: 1, max: 2000 }),
  sku: (f: Faker) => f.helpers.fromRegExp(/[A-Z0-9]{4}-[A-Z0-9]{4}/),
  name: (f: Faker) => f.commerce.product(),
  description: (f: Faker) => f.commerce.productDescription(),
  price: (f: Faker) => Number(f.commerce.price()),
  category: (f: Faker) =>
    f.helpers.arrayElement(['Category A', 'Category B', 'Category C']),
  quantity: (f: Faker) => f.number.int({ max: 100 }),
  created_at: (f: Faker) => format(f.date.recent(), 'yyyy-MM-dd'),
  updated_at: (f: Faker) => format(f.date.recent(), 'yyyy-MM-dd')
};

const allProducts: Product[] = generateFakeData(productSchema, 100);

export function searchAndPaginateProducts(
  paginationParams: PaginationParams,
  searchParams: SearchParams
): PaginatedResponse<Product> {
  const { page, pageSize } = paginationParams;
  const { name, category, minPrice, maxPrice } = searchParams;

  let filteredProducts = allProducts;

  if (name) {
    filteredProducts = filteredProducts.filter((product) =>
      product.name.toLowerCase().includes(name.toLowerCase())
    );
  }

  if (category) {
    filteredProducts = filteredProducts.filter(
      (product) => product.category.toLowerCase() === category.toLowerCase()
    );
  }

  if (minPrice !== undefined) {
    filteredProducts = filteredProducts.filter(
      (product) => product.price >= minPrice
    );
  }

  if (maxPrice !== undefined) {
    filteredProducts = filteredProducts.filter(
      (product) => product.price <= maxPrice
    );
  }

  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedData = filteredProducts.slice(startIndex, endIndex);

  return {
    data: paginatedData,
    pagination: {
      currentPage: page,
      pageSize: pageSize,
      totalPages: Math.ceil(filteredProducts.length / pageSize),
      totalItems: filteredProducts.length
    }
  };
}
