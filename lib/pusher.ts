import Pusher from 'pusher-js';

/**
 * Enable Pusher logging for debugging
 */
Pusher.logToConsole = true;

// Get Pusher key and cluster from environment variables
const PUSHER_KEY = process.env.NEXT_PUBLIC_PUSHER_KEY || '41a1ec9bc21c0ec74674';
const PUSHER_CLUSTER = process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'ap1';

/**
 * Extend the Pusher type to include callbacks for client-side simulation
 */
interface ExtendedPusher extends Pusher {
  callbacks?: Record<string, Function[]>;
}

/**
 * Pusher client configuration
 */
export const pusherClient: ExtendedPusher = new Pusher(PUSHER_KEY, {
  cluster: PUSHER_CLUSTER,
  forceTLS: true,
  enabledTransports: ['ws', 'wss'],
  activityTimeout: 30000,
  pongTimeout: 15000
});

// Monkey patch the bind method to store callbacks for client-side simulation
const originalBind = pusherClient.bind;
pusherClient.callbacks = {};

pusherClient.bind = function(eventName: string, callback: Function) {
  // Store the callback for client-side simulation
  if (!this.callbacks) {
    this.callbacks = {};
  }
  
  if (!this.callbacks[eventName]) {
    this.callbacks[eventName] = [];
  }
  
  this.callbacks[eventName].push(callback);
  
  // Call the original bind method
  return originalBind.call(this, eventName, callback);
};

/**
 * Pusher channel and event constants
 */
export const PUSHER_CONSTANTS = {
  CHANNEL: 'rfid-scan',
  EVENTS: {
    TAG_SCANNED: 'tag-scanned'
  }
} as const;

// Pre-subscribe to channel to maintain connection
const channel = pusherClient.subscribe(PUSHER_CONSTANTS.CHANNEL);

// Export channel for reuse
export const pusherChannel = channel; 