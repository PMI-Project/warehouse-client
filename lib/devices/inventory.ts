import { useEffect, useState } from 'react';
import { conn } from '../signalr';
import { toast } from 'sonner';

export function useInventory() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tags, setTags] = useState<any[]>([]);

  const startInventory = async (ip: string, port: string) => {
    try {
      setLoading(true);
      setError(null);

      conn.on('Connected', () => {
        setData('Connected');
        setLoading(false);
      });

      conn.on('Error', (errorMsg: string) => {
        setError(errorMsg);
        setLoading(false);
      });

      conn.on('InventoryStarted', (tags: any) => {
        console.log(tags);
        setData('InventoryStarted');
        setLoading(false);
      });

      conn.on('TagRead', (tag: any) => {
        toast.success(`New Tag: ${tag.tag}`);
      });

      conn.on('Error', (errorMsg: string) => {
        setError(errorMsg);
        setLoading(false);
      });

      await conn.start();
      await conn.invoke('ConnectToDevice', ip, +port);
      await conn.invoke('GetDeviceVersion');
      await conn.invoke('StartInventory');
    } catch (err) {
      setTags([]);
      setLoading(false);
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  const stopInventory = async () => {
    try {
      setLoading(true);
      setError(null);

      await conn.invoke('StopInventory');

      conn.off('Connected');
      conn.off('Error');
      conn.off('TagRead');
      conn.off('InventoryStarted');

      await conn.stop();

      setTags([]);
      setData(null);
      setLoading(false);
    } catch (error) {
      setError(error instanceof Error ? error.message : String(error));
      setLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      conn.off('Connected');
      conn.off('InventoryStarted');
      conn.off('TagRead');
      conn.off('Error');
    };
  }, []);

  return { loading, data, tags, error, startInventory, stopInventory };
}
