import { Tag } from '@/constants/data';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

interface TagsResponse {
  data: {
    data: Tag[];
    meta: {
      total: number;
    };
  };
}

export interface TransactionQuery {
  Tag: string;
  DeviceNo: number;
  AntennaNo: number;
  batchId: number;
  Timestamp: string;
  ScanCount: number;
}

export function useTransactionQuery(page: number, pageLimit: number) {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ['transactions', page, pageLimit],
    queryFn: async () => {
      console.log(`Fetching transactions for page ${page} with limit ${pageLimit}`);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_HUB}/transaction/list/latest-batch?page=${page}&perPage=${pageLimit}`
      );

      if (!res.ok) {
        console.error('Failed to fetch transactions:', res.statusText);
        throw new Error('Failed to fetch transactions');
      }

      const data = (await res.json()) as TagsResponse;
      console.log('Received transaction data:', {
        totalItems: data.data.meta.total,
        itemsReceived: data.data.data.length,
        pageCount: Math.ceil(data.data.meta.total / pageLimit)
      });

      return {
        transactions: data.data.data,
        totalTransactions: data.data.meta.total,
        pageCount: Math.ceil(data.data.meta.total / pageLimit)
      };
    },
    staleTime: 1000
  });
}

export function useMutationTx() {
  return useMutation({
    mutationFn: async (data: TransactionQuery) => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_HUB}/transaction/add`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        }
      );

      if (!res.ok) {
        throw new Error('Failed to process transaction');
      }

      return await res.json();
    },
    onSuccess: (data) => {
      console.log('Transaction processed successfully:', data);
    },
    onError: (error) => {
      console.error('Error processing transaction:', error);
    }
  });
}

export async function fetchTransactions(page: number, pageLimit: number) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_HUB}/transaction/list/latest-batch?page=${page}&perPage=${pageLimit}`
  );

  if (!res.ok) {
    throw new Error('Failed to fetch transactions');
  }

  const data = await res.json();
  return {
    transactions: data.data.data,
    totalTransactions: data.data.meta.total,
    pageCount: Math.ceil(data.data.meta.total / pageLimit)
  };
}
