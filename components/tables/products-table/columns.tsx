'use client';

import { Checkbox } from '@/components/ui/checkbox';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger
} from '@/components/ui/hover-card';
import { Product } from '@/constants/data';
import { ColumnDef } from '@tanstack/react-table';

export const columns: ColumnDef<Product>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false
  },
  {
    accessorKey: 'id',
    header: 'ID'
  },
  {
    accessorKey: 'sku',
    header: 'SKU'
  },
  {
    id: 'product',
    header: 'Name',
    accessorFn: (row) => row.name
  },
  {
    accessorKey: 'category',
    header: 'Category'
  },
  {
    accessorKey: 'description',
    header: 'Description',
    cell: ({ row }) => {
      const description = row.getValue<string>('description');
      return (
        <HoverCard>
          <HoverCardTrigger asChild>
            <p>{description.substring(0, 40) + '...'}</p>
          </HoverCardTrigger>
          <HoverCardContent>
            <p>{description}</p>
          </HoverCardContent>
        </HoverCard>
      );
    }
  },
  {
    accessorKey: 'price',
    header: 'Price'
  },
  {
    accessorKey: 'quantity',
    header: 'Quantity'
  },
  {
    accessorKey: 'created_at',
    header: 'Created At'
  },
  {
    accessorKey: 'updated_at',
    header: 'Updated At'
  }
];
