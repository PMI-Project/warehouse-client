import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Active, DataRef, Over } from '@dnd-kit/core';
import { ColumnDragData } from '@/components/kanban/board-column';
import { TaskDragData } from '@/components/kanban/task-card';
import { Faker, faker } from '@faker-js/faker';

type DraggableData = ColumnDragData | TaskDragData;

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function hasDraggableData<T extends Active | Over>(
  entry: T | null | undefined
): entry is T & {
  data: DataRef<DraggableData>;
} {
  if (!entry) {
    return false;
  }

  const data = entry.data.current;

  if (data?.type === 'Column' || data?.type === 'Task') {
    return true;
  }

  return false;
}

export type SchemaFunction<T = any> = (faker: Faker) => T;

export type SchemaValue<T = any> =
  | SchemaFunction<T>
  | { [key: string]: SchemaValue<any> }
  | T;

export type Schema = { [key: string]: SchemaValue<any> };

export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    currentPage: number;
    pageSize: number;
    totalPages: number;
    totalItems: number;
  };
}

export function generateFakeData<T extends Schema>(
  schema: T,
  count: number = 1
): Array<{
  [K in keyof T]: T[K] extends SchemaFunction<infer R>
    ? R
    : T[K] extends object
    ? { [P in keyof T[K]]: T[K][P] extends SchemaFunction<infer R> ? R : any }
    : T[K];
}> {
  const generateItem = (): any => {
    const item: any = {};
    for (const [key, value] of Object.entries(schema)) {
      if (typeof value === 'function') {
        item[key] = (value as SchemaFunction)(faker);
      } else if (typeof value === 'object' && value !== null) {
        item[key] = generateFakeData(value as Schema, 1)[0];
      } else {
        item[key] = value;
      }
    }
    return item;
  };

  return Array.from({ length: count }, generateItem);
}
