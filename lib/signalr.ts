import { DEVICE_HUB } from '@/constants/data';
import * as signalR from '@microsoft/signalr';

export const conn = new signalR.HubConnectionBuilder()
  .withUrl(DEVICE_HUB)
  .configureLogging(signalR.LogLevel.Information)
  .build();
