'use client';

import { useState } from 'react';
import { RealTimeTransactionTable } from '@/components/tables/transactions-tables/real-time-transaction-table';
import { CreateBatchDialog } from '@/components/dialogs/create-batch-dialog';
import { Breadcrumbs } from '@/components/breadcrumbs';
import PageContainer from '@/components/layout/page-container';
import { columns, Transaction } from '@/components/tables/transactions-tables/columns';
import { TransactionTable } from '@/components/tables/transactions-tables/tag-table';
import { Separator } from '@/components/ui/separator';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { Heading } from '@/components/ui/heading';
import { queryClient } from '@/lib/queryClient';
import { fetchTransactions } from '@/lib/queries/transactions';
import { DeviceStatus } from './_component/device-status';
import { QuickActions } from './_component/quick-actions';
import { PusherTest } from './_component/pusher-test';
import { TestEventGenerator } from './_component/test-event-generator';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

const breadcrumbItems = [
  { title: 'Dashboard', link: '/dashboard' },
  { title: 'Transaction', link: '/dashboard/inventory/transaction' }
];

const PAGE_LIMIT = 10;

export default function TransactionPage() {
  const [selectedTransactions, setSelectedTransactions] = useState<Transaction[]>([]);
  const [showDebug, setShowDebug] = useState(false);
  const [isCountMode, setIsCountMode] = useState(false);

  const handleBatchCreated = () => {
    setSelectedTransactions([]);
  };

  // Handle selected transactions from the table
  const handleSelectedChange = (selectedIds: number[]) => {
    // Get the actual transaction objects from the table component
    // This will be implemented in the RealTimeTransactionTable component
    // For now, we'll just store the IDs
    setSelectedTransactions(selectedIds.map(id => ({ 
      id, 
      epc: '', // These will be populated by the RealTimeTransactionTable
      rssi: '',
      timestamp: '',
      mode: ''
    })));
  };

  return (
    <PageContainer>
      <div className="space-y-4">
        <Breadcrumbs items={breadcrumbItems} />
        <div className="flex items-start justify-between">
          <Heading
            title="Transactions"
            description="Manage current tags, the initial data captured from the scanner in certain batch."
          />
          <div className="flex items-center gap-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="count-mode"
                checked={isCountMode}
                onCheckedChange={setIsCountMode}
              />
              <Label htmlFor="count-mode" className="text-sm">
                Count Mode {isCountMode ? "(On)" : "(Off)"}
              </Label>
            </div>
            <DeviceStatus />
            <QuickActions />
            <button 
              onClick={() => setShowDebug(!showDebug)}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              {showDebug ? "Hide Debug" : "Debug"}
            </button>
          </div>
        </div>
        <Separator />
        {showDebug && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <PusherTest isCountMode={isCountMode} />
            <TestEventGenerator />
          </div>
        )}
        <div className="flex justify-end mb-4">
          <CreateBatchDialog
            selectedTransactions={selectedTransactions}
            onBatchCreated={handleBatchCreated}
            buttonLabel="Create Batch & Save"
          />
        </div>
        <RealTimeTransactionTable
          onSelectedChange={handleSelectedChange}
          isCountMode={isCountMode}
        />
      </div>
    </PageContainer>
  );
}
