import { useState, useEffect, useMemo } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { pusherClient, PUSHER_CONSTANTS } from '@/lib/pusher';
import { Transaction, TransactionEvent } from './columns';
import { Loader2 } from 'lucide-react';
import { simulatePusherEvent } from '@/lib/pusher-client-utils';
import axios from 'axios';
import { CreateBatchDialog } from '@/components/dialogs/create-batch-dialog';

interface RealTimeTransactionTableProps {
  onSelectedChange: (selectedIds: number[]) => void;
  isCountMode?: boolean;
}

// Interface for grouped transactions with count
interface GroupedTransaction extends Transaction {
  count: number;
}

export function RealTimeTransactionTable({ 
  onSelectedChange, 
  isCountMode = false 
}: RealTimeTransactionTableProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [epcCounts, setEpcCounts] = useState<Record<string, number>>({});
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [isSaving, setIsSaving] = useState(false);
  const [showBatchDialog, setShowBatchDialog] = useState(false);
  const { toast } = useToast();
  
  // Process transactions based on mode (normal or count)
  const processedTransactions = useMemo(() => {
    if (!isCountMode) {
      return transactions;
    }

    // Create a map of unique EPCs with their latest transaction and count
    const uniqueEpcs = new Map<string, GroupedTransaction>();
    
    transactions.forEach(transaction => {
      const key = transaction.epc;
      const count = epcCounts[key] || 1;
      
      // Always keep the most recent transaction for each EPC
      if (!uniqueEpcs.has(key) || 
          new Date(transaction.timestamp) > new Date(uniqueEpcs.get(key)!.timestamp)) {
        uniqueEpcs.set(key, {
          ...transaction,
          count
        });
      }
    });

    return Array.from(uniqueEpcs.values());
  }, [transactions, epcCounts, isCountMode]);

  useEffect(() => {
    // Log when component mounts
    console.log('RealTimeTransactionTable mounted, subscribing to Pusher events');
    
    // Handle incoming transactions
    const handleTagScanned = (data: TransactionEvent) => {
      console.log('Received tag scan event:', data);
      
      // Update EPC counts and show toast notification
      setEpcCounts(prev => {
        const currentCount = prev[data.epc] || 0;
        const newCount = currentCount + 1;
        
        // Show toast notification with count
        toast({
          title: "Tag Scanned",
          description: `EPC: ${data.epc} (Count: ${newCount})`,
        });
        
        return {
          ...prev,
          [data.epc]: newCount
        };
      });
      
      // Create a new transaction object
      const newTransaction: Transaction = {
        id: data.id || Date.now(),
        epc: data.epc,
        rssi: data.rssi,
        timestamp: data.timestamp,
        mode: data.mode,
        isTemp: data.isTemp || false
      };
      
      setTransactions(prev => [newTransaction, ...prev]);
    };
    
    // Subscribe to the event
    pusherClient.bind(PUSHER_CONSTANTS.EVENTS.TAG_SCANNED, handleTagScanned);

    return () => {
      // Cleanup
      console.log('RealTimeTransactionTable unmounting, unbinding Pusher events');
      pusherClient.unbind(PUSHER_CONSTANTS.EVENTS.TAG_SCANNED, handleTagScanned);
    };
  }, [toast]);

  const handleRowSelect = (id: number) => {
    const newSelected = new Set(selectedRows);
    if (selectedRows.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedRows(newSelected);
    
    // Find the selected transactions and pass them to the parent
    const selectedTransactionObjects = processedTransactions
      .filter(t => t.id !== undefined && newSelected.has(t.id));
    
    // Pass the IDs to maintain backward compatibility
    onSelectedChange(Array.from(newSelected));
    
    // Store the selected transactions in localStorage for batch creation
    if (typeof window !== 'undefined') {
      localStorage.setItem('selectedTransactions', JSON.stringify(selectedTransactionObjects));
    }
  };

  const handleSelectAll = () => {
    if (selectedRows.size === processedTransactions.length) {
      setSelectedRows(new Set());
      onSelectedChange([]);
      
      // Clear localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('selectedTransactions');
      }
    } else {
      // Ensure all IDs are numbers by filtering out any undefined values
      const allIds: number[] = processedTransactions
        .map(t => t.id)
        .filter((id): id is number => id !== undefined);
      setSelectedRows(new Set(allIds));
      onSelectedChange(allIds);
      
      // Store all transactions in localStorage
      if (typeof window !== 'undefined') {
        const allTransactions = processedTransactions.filter(t => t.id !== undefined);
        localStorage.setItem('selectedTransactions', JSON.stringify(allTransactions));
      }
    }
  };

  // Function to reset counts
  const resetCounts = () => {
    setEpcCounts({});
  };

  // Function to prepare transactions for batch
  const prepareForBatch = () => {
    if (processedTransactions.length === 0) {
      toast({
        title: "No transactions to select",
        description: "There are no transactions to select for batching.",
        variant: "destructive"
      });
      return;
    }

    // Check if any transactions are selected
    if (selectedRows.size === 0) {
      toast({
        title: "No transactions selected",
        description: "Please select transactions to add to a batch.",
        variant: "destructive"
      });
      return;
    }

    // Open the batch creation dialog
    setShowBatchDialog(true);
  };

  // Function to handle batch creation completion
  const handleBatchCreated = () => {
    setShowBatchDialog(false);
    setSelectedRows(new Set());
    onSelectedChange([]);
    
    // Clear localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('selectedTransactions');
    }
    
    toast({
      title: "Success",
      description: "Selected transactions have been added to the batch",
    });
  };

  return (
    <div className="rounded-md border">
      <div className="p-2 bg-muted/20 flex justify-between items-center">
        <span className="text-sm text-muted-foreground">
          {isCountMode 
            ? "Count Mode: Showing unique EPCs with running count" 
            : "Normal Mode: Showing all transactions"}
        </span>
        <div className="flex gap-2">
          {isCountMode && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={resetCounts}
              className="text-xs"
            >
              Reset Counts
            </Button>
          )}
          <CreateBatchDialog
            selectedTransactions={processedTransactions.filter(t => selectedRows.has(t.id || 0))}
            onBatchCreated={handleBatchCreated}
            buttonLabel="Create Batch"
          />
        </div>
      </div>
      <table className="w-full">
        <thead>
          <tr className="border-b bg-muted/50">
            <th className="h-12 px-4">
              <Checkbox
                checked={selectedRows.size === processedTransactions.length && processedTransactions.length > 0}
                onCheckedChange={handleSelectAll}
              />
            </th>
            <th className="px-4 text-left">EPC</th>
            <th className="px-4 text-left">RSSI</th>
            <th className="px-4 text-left">Timestamp</th>
            <th className="px-4 text-left">Mode</th>
            <th className="px-4 text-left">Status</th>
            {isCountMode && <th className="px-4 text-left">Count</th>}
          </tr>
        </thead>
        <tbody>
          {processedTransactions.map((transaction) => {
            // Ensure id is a number
            const id = transaction.id;
            if (id === undefined) return null;
            
            return (
              <tr key={id} className="border-b">
                <td className="h-12 px-4">
                  <Checkbox
                    checked={selectedRows.has(id)}
                    onCheckedChange={() => handleRowSelect(id)}
                  />
                </td>
                <td className="px-4">{transaction.epc}</td>
                <td className="px-4">{transaction.rssi} dBm</td>
                <td className="px-4">
                  {transaction.timestamp}
                </td>
                <td className="px-4">{transaction.mode}</td>
                <td className="px-4">
                  <Badge variant={transaction.isTemp ? "outline" : "default"}>
                    {transaction.isTemp ? "Pending" : "Saved"}
                  </Badge>
                </td>
                {isCountMode && (
                  <td className="px-4 font-medium">
                    {epcCounts[transaction.epc] || 1}
                  </td>
                )}
              </tr>
            );
          })}
          {processedTransactions.length === 0 && (
            <tr>
              <td colSpan={isCountMode ? 7 : 6} className="h-24 text-center">
                No transactions yet. Waiting for RFID scans...
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
} 