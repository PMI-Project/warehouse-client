import { Breadcrumbs } from '@/components/breadcrumbs';
import PageContainer from '@/components/layout/page-container';
import { columns } from '@/components/tables/tag-tables/columns';
import { TagTable } from '@/components/tables/tag-tables/tag-table';
import { Separator } from '@/components/ui/separator';
import { ProductQuickActions } from '../../products/_components/QuickActions';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { Heading } from '@/components/ui/heading';
import { queryClient } from '@/lib/queryClient';
import { fetchTransactions } from '@/lib/queries/transactions';
import { TransactionTable } from '@/components/tables/transactions-tables/tag-table';
import { Button } from '@/components/ui/button';
import { DeviceStatus } from './_component/device-status';

const breadcrumbItems = [
  { title: 'Dashboard', link: '/dashboard' },
  { title: 'Transaction', link: '/dashboard/inventory/transaction' }
];

const PAGE_LIMIT = 10;

type ParamsProps = {
  searchParams: Promise<{
    [key: string]: string | string[] | undefined;
  }>;
};

export default async function Page(props: ParamsProps) {
  const searchParams = await props.searchParams;
  const page = Number(searchParams.page) || 1;
  const pageLimit = PAGE_LIMIT;

  await queryClient.prefetchQuery({
    queryKey: ['transactions'],
    queryFn: () => fetchTransactions(page, pageLimit)
  });

  const dehydratedState = dehydrate(queryClient);

  return (
    <PageContainer>
      <div className="space-y-4">
        <Breadcrumbs items={breadcrumbItems} />

        <div className="flex items-start justify-between">
          <Heading
            title={`Transactions`}
            description="Manage current tags, the initial data captured from the scanner in certain batch."
          />

          <div className="flex gap-2">
            <DeviceStatus />
            <ProductQuickActions>
              <Button>Quick Menu</Button>
            </ProductQuickActions>
          </div>
        </div>
        <Separator />

        <HydrationBoundary state={dehydratedState}>
          <TransactionTable
            searchKey="transaction"
            pageNo={page}
            columns={columns}
            pageCount={0}
            pageLimit={pageLimit}
          />
        </HydrationBoundary>
      </div>
    </PageContainer>
  );
}
