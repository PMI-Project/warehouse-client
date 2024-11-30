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

export function ProductQuickActions({
  children
}: {
  children: React.ReactNode;
}) {
  const [isScanProductOpen, setIsScanProductOpen] = useState(false);
  const { stopInventory } = useInventory();
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
              onClick={() => setIsScanProductOpen(true)}
            >
              Scan Product
            </button>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
