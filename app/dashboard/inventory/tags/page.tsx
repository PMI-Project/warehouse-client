import { Breadcrumbs } from '@/components/breadcrumbs';
import PageContainer from '@/components/layout/page-container';
import { columns } from '@/components/tables/tag-tables/columns';
import { TagTable } from '@/components/tables/tag-tables/tag-table';
import { buttonVariants } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { Tag } from '@/constants/data';
import { cn } from '@/lib/utils';
import { Plus } from 'lucide-react';
import Link from 'next/link';

const breadcrumbItems = [
  { title: 'Dashboard', link: '/dashboard' },
  { title: 'Tag', link: '/dashboard/inventory/tags' }
];

type ParamsProps = {
  searchParams: Promise<{
    [key: string]: string | string[] | undefined;
  }>;
};

export default async function Page(props: ParamsProps) {
  const searchParams = await props.searchParams;
  const page = Number(searchParams.page) || 1;
  const pageLimit = Number(searchParams.limit) || 10;

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_HUB}/tag/list?page=${page}&perPage=${pageLimit}`
  );
  const tagRes = await res.json();
  console.log('Data : ', tagRes);

  const totalTags = tagRes.data.meta.total;
  const pageCount = Math.ceil(totalTags / pageLimit);
  const tags: Tag[] = tagRes.data.data;

  return (
    <PageContainer>
      <div className="space-y-4">
        <Breadcrumbs items={breadcrumbItems} />

        <div className="flex items-start justify-between">
          <Heading
            title={`Tags`}
            description="Manage tags, the initial data captured from the scanner, to track and process scanned items effectively."
          />

          {/* <Link
                        href={'/dashboard/inventory/tags/new'}
                        className={cn(buttonVariants({ variant: 'default' }))}
                    >
                        <Plus className="mr-2 h-4 w-4" /> Add New
                    </Link> */}
        </div>
        <Separator />

        <TagTable
          searchKey="tag"
          pageNo={page}
          columns={columns}
          totalUsers={totalTags}
          data={tags}
          pageCount={pageCount}
        />
      </div>
    </PageContainer>
  );
}
