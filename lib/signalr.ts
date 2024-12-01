import * as signalR from '@microsoft/signalr';

export const conn = new signalR.HubConnectionBuilder()
  .withUrl('http://localhost:8080/deviceHub')
  .configureLogging(signalR.LogLevel.Information)
  .build();
