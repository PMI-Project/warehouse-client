'use client';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { StartInventoryForm } from './StartInventoryForm';
import { Dialog } from '@/components/ui/dialog';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ResponsiveDialog } from '@/components/responsive-dialog';
import { useInventory } from '@/lib/devices/inventory';
import { useTaskStore } from '@/lib/store';

export function ProductQuickActions({
  children
}: {
  children: React.ReactNode;
}) {
  const [isScanProductOpen, setIsScanProductOpen] = useState(false);
  const { stopInventory } = useInventory();
  const setBatchId = useTaskStore((state) => state.setBatchId);
  const lastBatchId = useTaskStore((state) => state.batchId);

  const handleScanProduct = async () => {
    console.log('Scan Product button pressed : ', lastBatchId);

    try {
      const response = await fetch(
        'http://localhost:9001/api/v1/batch/list?page=1&perPage=10&q'
      );
      const data = await response.json();

      if (response.ok) {
        const lastBatchId = data.data.data[data.data.data.length - 1].id;
        setBatchId(lastBatchId);
        console.log('Last Batch ID:', lastBatchId);
      } else {
        console.error('Error fetching data:', data.message);
      }
    } catch (error) {
      console.error('Fetch error:', error);
    }

    setIsScanProductOpen(true);
  };

  return (
    <>
      <ResponsiveDialog
        isOpen={isScanProductOpen}
        setIsOpen={setIsScanProductOpen}
        onClose={stopInventory}
        title="Start Scanning Inventory"
      >
        <StartInventoryForm />
      </ResponsiveDialog>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>
            <button
              className="flex w-full justify-start rounded-md p-2 transition-all duration-75"
              onClick={handleScanProduct}
            >
              Scan Product
            </button>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
