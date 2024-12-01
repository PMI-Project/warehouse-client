import { Breadcrumbs } from '@/components/breadcrumbs';
import PageContainer from '@/components/layout/page-container';
import { columns } from '@/components/tables/product-tables/columns';
import { ProductTable } from '@/components/tables/product-tables/product-table';
import { buttonVariants } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { Product } from '@/constants/data';
import { cn } from '@/lib/utils';
import { Plus } from 'lucide-react';
import Link from 'next/link';

const breadcrumbItems = [
  { title: 'Dashboard', link: '/dashboard' },
  { title: 'Product', link: '/dashboard/inventory/products' }
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
    `${process.env.NEXT_PUBLIC_API_HUB}/product/list?page=${page}&perPage=${pageLimit}`
  );
  const productRes = await res.json();
  console.log('Data : ', productRes);

  const totalProducts = productRes.data.meta.total;
  const pageCount = Math.ceil(totalProducts / pageLimit);
  const products: Product[] = productRes.data.data;

  return (
    <PageContainer>
      <div className="space-y-4">
        <Breadcrumbs items={breadcrumbItems} />

        <div className="flex items-start justify-between">
          <Heading
            title={`Products`}
            description="Manage products and their associated tags to effectively track and process scanned items."
          />

          <Link
            href={'/dashboard/inventory/products/new'}
            className={cn(buttonVariants({ variant: 'default' }))}
          >
            <Plus className="mr-2 h-4 w-4" /> Add New
          </Link>
        </div>
        <Separator />

        <ProductTable
          searchKey="product"
          pageNo={page}
          columns={columns}
          totalUsers={totalProducts}
          data={products}
          pageCount={pageCount}
        />
      </div>
    </PageContainer>
  );
}
