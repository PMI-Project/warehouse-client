// warehouse-client/components/tables/tag-tables/tag-table.tsx
'use client';
import {
  ColumnDef,
  PaginationState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable
} from '@tanstack/react-table';
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  DoubleArrowLeftIcon,
  DoubleArrowRightIcon
} from '@radix-ui/react-icons';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Tag } from '@/constants/data'; // Ensure Tag type is imported
import { useTransactionQuery } from '@/lib/queries/transactions';
import Pusher from 'pusher-js';
import { useQueryClient } from '@tanstack/react-query';

interface DataTableProps {
  columns: ColumnDef<Tag>[];
  searchKey: string;
  pageNo: number;
  pageSizeOptions?: number[];
  pageCount: number;
  pageLimit: number;
}

export function TransactionTable({
  columns,
  pageNo,
  searchKey,
  pageCount,
  pageLimit,
  pageSizeOptions = [10, 20, 30, 40, 50]
}: DataTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const { data: transactionData, isLoading } = useTransactionQuery(
    pageNo,
    pageLimit
  );

  // Pagination state
  const [{ pageIndex, pageSize }, setPagination] =
    React.useState<PaginationState>({
      pageIndex: 0,
      pageSize: pageSizeOptions[0] || 10
    });

  const table = useReactTable({
    data: transactionData?.transactions ?? [],
    columns,
    pageCount: pageCount ?? -1,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      pagination: { pageIndex, pageSize }
    },
    onPaginationChange: setPagination,
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: true
  });

  React.useEffect(() => {
    console.log('Initializing Pusher connection...');
    const pusher = new Pusher('41a1ec9bc21c0ec74674', {
      cluster: 'ap1',
      forceTLS: true
    });

    const channel = pusher.subscribe('wms-be-staging');
    console.log('Subscribed to channel: wms-be-staging');

    channel.bind('transaction', (newTransaction: Tag) => {
      console.log('New transaction received:', newTransaction);
      console.log('Invalidating queries and triggering refetch...');
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    });

    // Log connection status
    pusher.connection.bind('connected', () => {
      console.log('Successfully connected to Pusher');
    });

    pusher.connection.bind('error', (err: any) => {
      console.error('Pusher connection error:', err);
    });

    return () => {
      console.log('Cleaning up Pusher connection...');
      channel.unbind_all();
      channel.unsubscribe();
      pusher.disconnect();
    };
  }, [queryClient]);

  return (
    <>
      <Input
        placeholder={`Search ${searchKey}...`}
        value={(table.getColumn(searchKey)?.getFilterValue() as string) ?? ''}
        onChange={(event) =>
          table.getColumn(searchKey)?.setFilterValue(event.target.value)
        }
        className="w-full md:max-w-sm"
      />
      <ScrollArea className="h-[calc(80vh-220px)] rounded-md border">
        <Table className="relative">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      <div className="flex justify-between py-4">
        <div>
          Page {pageIndex + 1} of {table.getPageCount()}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <DoubleArrowLeftIcon />
          </Button>
          <Button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeftIcon />
          </Button>
          <Button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <ChevronRightIcon />
          </Button>
          <Button
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            <DoubleArrowRightIcon />
          </Button>
        </div>
      </div>
    </>
  );
}
