'use client';

import { Breadcrumbs } from '@/components/breadcrumbs';
import PageContainer from '@/components/layout/page-container';
import { columns } from '@/components/tables/tag-tables/columns';
import { TagTable } from '@/components/tables/tag-tables/tag-table';
import { Button } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { Tag } from '@/constants/data';
import { useSearchParams } from 'next/navigation';
import { ProductQuickActions } from '../../products/_components/QuickActions';
import { Loader2 } from 'lucide-react';
import { useTagsList } from '@/lib/queries/tags';

const breadcrumbItems = [
  { title: 'Dashboard', link: '/dashboard' },
  { title: 'Tag', link: '/dashboard/inventory/tags' }
];

export default function Page() {
  const searchParams = useSearchParams();
  const page = Number(searchParams.get('page')) || 1;
  const pageLimit = Number(searchParams.get('limit')) || 10;

  const { data, isLoading, isError } = useTagsList(page, pageLimit);

  if (isLoading) {
    return (
      <PageContainer>
        <div className="flex h-96 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </PageContainer>
    );
  }

  if (isError) {
    return (
      <PageContainer>
        <div className="flex h-96 items-center justify-center">
          <p className="text-destructive">
            Error loading tags. Please try again.
          </p>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="space-y-4">
        <Breadcrumbs items={breadcrumbItems} />

        <div className="flex items-start justify-between">
          <Heading
            title="Tags"
            description="Manage tags, the initial data captured from the scanner, to track and process scanned items effectively."
          />

          <ProductQuickActions>
            <Button>Quick Menu</Button>
          </ProductQuickActions>
        </div>
        <Separator />

        <TagTable
          searchKey="tag"
          pageNo={page}
          columns={columns}
          totalUsers={data?.totalTags || 0}
          data={data?.tags || []}
          pageCount={data?.pageCount || 0}
        />
      </div>
    </PageContainer>
  );
}
