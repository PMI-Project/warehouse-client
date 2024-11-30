import { useState } from 'react';
import { conn } from '../signalr';
import { toast } from 'sonner';

export function useDisconnectDevice() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const disconnectDevice = async () => {
    try {
      setLoading(true);
      setError(null);
      conn.on('Disconnected', (success) => {
        if (success) {
          toast.success('Device Disconnected');
        }
      });
      await conn.start();
      await conn.invoke('Disconnect');
      setLoading(false);
      setData('Disconnected');
    } catch (error) {
      setError(error instanceof Error ? error.message : String(error));
      setLoading(false);
    }
  };

  return { disconnectDevice, loading, data, error };
}
