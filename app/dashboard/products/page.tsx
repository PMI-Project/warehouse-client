import { Breadcrumbs } from '@/components/breadcrumbs';
import PageContainer from '@/components/layout/page-container';
import { columns } from '@/components/tables/products-table/columns';
import { ProductTable } from '@/components/tables/products-table/product-table';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { Product } from '@/constants/data';
import { searchAndPaginateProducts } from '@/lib/mock-data/products';
import { generateFakeData, PaginatedResponse } from '@/lib/utils';

const breadcrumbItems = [
  { title: 'Dashboard', link: '/dashboard' },
  { title: 'Products', link: '/dashboard/products' }
];

type paramsProps = {
  searchParams: {
    [key: string]: string | undefined;
  };
};

export default async function page({ searchParams }: paramsProps) {
  const page = Number(searchParams.page) || 1;
  const pageLimit = Number(searchParams.limit) || 10;
  const productName = searchParams.search || undefined;
  const category = searchParams.category || undefined;
  const minPrice = Number(searchParams.minPrice) || undefined;
  const maxPrice = Number(searchParams.minPrice) || undefined;
  const offset = (page - 1) * pageLimit;

  function fetchProducts(): Promise<PaginatedResponse<Product>> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve(
          searchAndPaginateProducts(
            { page, pageSize: pageLimit },
            { name: productName, category, minPrice, maxPrice }
          )
        );
      }, 1000);
    });
  }

  const res = await fetchProducts();
  const totalProducts = res.pagination.totalItems;
  const pageCount = res.pagination.totalPages;
  const products: Product[] = res.data;
  console.log(products);

  return (
    <PageContainer>
      <div className="space-y-4">
        <Breadcrumbs items={breadcrumbItems} />
        <div className="flex items-start justify-between">
          <Heading title={`Products`} description="List of products" />
        </div>
        <Separator />
        <ProductTable
          searchKey="product"
          pageNo={page}
          columns={columns}
          data={products}
          pageCount={pageCount}
          totalProducts={totalProducts}
        />
      </div>
    </PageContainer>
  );
}
