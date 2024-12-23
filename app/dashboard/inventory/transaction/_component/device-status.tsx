'use client';

import { Button } from '@/components/ui/button';
import { useDisconnectDevice } from '@/lib/devices/disconnect';
import { useDeviceStore } from '@/lib/store';
import { XIcon } from 'lucide-react';

export function DeviceStatus() {
  const { ip, status } = useDeviceStore();
  const { disconnectDevice } = useDisconnectDevice();

  const handleDisconnect = () => {
    disconnectDevice();
  };
  return (
    <div className="flex items-center gap-2">
      <div
        className={`inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-800 ${
          status ? 'hover:cursor-pointer' : ''
        }`}
      >
        <span className="relative mr-1.5 flex h-2 w-2">
          <span
            className={`absolute inline-flex h-full w-full rounded-full ${
              status ? 'bg-green-400' : 'bg-gray-400'
            } ${status ? 'animate-ping' : ''} opacity-75`}
          ></span>
          <span
            className={`relative inline-flex h-2 w-2 rounded-full ${
              status ? 'bg-green-500' : 'bg-gray-500'
            }`}
          ></span>
        </span>
        {ip ? ip : 'No device connected'}
      </div>
      {status && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDisconnect}
          className="h-6 w-6 p-0"
        >
          <XIcon className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
