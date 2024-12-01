'use client';

import { Breadcrumbs } from '@/components/breadcrumbs';
import { TagForm } from '@/components/forms/tag-form';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { fetchTagData } from '@/lib/fetch-tag';

const breadcrumbItems = [
  { title: 'Dashboard', link: '/dashboard' },
  { title: 'Tag', link: '/dashboard/inventory/tags' },
  { title: 'Edit', link: '/dashboard/inventory/tag/edit' }
];

export default function Page() {
  const { tag } = useParams();
  const [tagData, setTagData] = useState(null);
  const [loading, setLoading] = useState(true);

  const tagId = Array.isArray(tag) ? tag[0] : tag;

  useEffect(() => {
    const fetchData = async () => {
      if (!tagId) return;

      console.log('Fetching data for tagId:', tagId);
      try {
        const data = await fetchTagData(tagId);
        setTagData(data);
      } catch (error) {
        console.error('Failed to fetch tag data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [tagId]);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!tagData) {
    return <p>Tag not found.</p>;
  }

  return (
    <ScrollArea className="h-[calc(100vh-4rem)] overflow-y-auto">
      <div className="flex-1 space-y-4 p-8">
        <Breadcrumbs items={breadcrumbItems} />
        <TagForm initialData={tagData} />
      </div>
    </ScrollArea>
  );
}
