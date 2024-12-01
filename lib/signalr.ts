import * as signalR from '@microsoft/signalr';

export const conn = new signalR.HubConnectionBuilder()
  .withUrl(process.env.NEXT_PUBLIC_DEVICE_HUB as string)
  .configureLogging(signalR.LogLevel.Information)
  .build();
