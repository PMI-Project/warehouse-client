'use client';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useInventoryForm } from '@/hooks/use-inventory-form';

const formSchema = z.object({
  ip: z.string().ip({
    message: 'Input a valid IP ex. 192.x.x.x'
  }),
  port: z.string()
});

export function StartInventoryForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ip: '',
      port: ''
    }
  });

  const {
    isInventoryStarted,
    loading,
    error,
    disconnectLoading,
    devicesLoading,
    disconnectDevice,
    startInventory,
    stopInventory,
    getDevices
  } = useInventoryForm({ form });

  function onSubmit(values: z.infer<typeof formSchema>) {
    startInventory(values.ip, values.port);
  }

  return (
    <div className="p-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="ip"
            render={({ field }) => (
              <FormItem>
                <FormLabel>IP</FormLabel>
                <FormControl>
                  <Input placeholder="IP" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="port"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Port</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="Port" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex justify-between gap-2">
            <Button
              className="w-full"
              type="submit"
              disabled={loading || isInventoryStarted}
            >
              {loading ? 'Loading...' : 'Start Inventory'}
            </Button>
            <Button
              className="w-full"
              variant="destructive"
              onClick={stopInventory}
              disabled={loading || !isInventoryStarted}
            >
              {loading ? 'Loading...' : 'Stop Inventory'}
            </Button>
          </div>
        </form>
      </Form>
      <div className="mt-4 flex gap-2">
        <Button
          className="w-full"
          variant="secondary"
          onClick={getDevices}
          disabled={devicesLoading || isInventoryStarted}
        >
          {devicesLoading ? `Searching...` : 'Get Devices'}
        </Button>
        <Button
          className="w-full"
          variant="secondary"
          onClick={disconnectDevice}
          disabled={disconnectLoading}
        >
          {disconnectLoading ? `Disconnecting...` : 'Disconnect Device'}
        </Button>
      </div>
      {error && (
        <div className="mt-4 rounded bg-red-100 p-4 text-red-700">{error}</div>
      )}
    </div>
  );
}