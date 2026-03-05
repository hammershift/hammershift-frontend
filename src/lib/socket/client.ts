/**
 * Socket.IO Client Singleton
 *
 * Provides a single Socket.IO connection instance shared across the app.
 * Features:
 * - Automatic reconnection with exponential backoff
 * - Session-based authentication
 * - Type-safe event handlers
 * - Connection state management
 */

import { io, Socket } from 'socket.io-client';

/**
 * Order Book Event Payloads
 */
export interface OrderBookUpdate {
  marketId: string;
  orders: Array<{
    id: string;
    side: 'BUY' | 'SELL';
    outcome: 'YES' | 'NO';
    price: number;
    size: number;
    remainingSize: number;
  }>;
  timestamp: number;
}

export interface OrderMatched {
  marketId: string;
  orderId: string;
  matchedSize: number;
  matchedPrice: number;
  timestamp: number;
}

export interface OrderCancelled {
  marketId: string;
  orderId: string;
  timestamp: number;
}

export interface MarketResolved {
  marketId: string;
  winningOutcome: 'YES' | 'NO';
  hammerPrice: number;
  timestamp: number;
}

/**
 * Socket.IO Client Events
 */
export interface ServerToClientEvents {
  'orderBook:update': (data: OrderBookUpdate) => void;
  'order:matched': (data: OrderMatched) => void;
  'order:cancelled': (data: OrderCancelled) => void;
  'market:resolved': (data: MarketResolved) => void;
  connect: () => void;
  disconnect: (reason: string) => void;
  connect_error: (error: Error) => void;
}

export interface ClientToServerEvents {
  'subscribe:market': (marketId: string) => void;
  'unsubscribe:market': (marketId: string) => void;
}

/**
 * Socket.IO Client Singleton
 */
class SocketClient {
  private socket: Socket<ServerToClientEvents, ClientToServerEvents> | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private baseReconnectDelay = 1000; // 1 second

  /**
   * Initialize socket connection
   */
  connect(sessionToken?: string): Socket<ServerToClientEvents, ClientToServerEvents> {
    if (this.socket?.connected) {
      return this.socket;
    }

    // Determine socket server URL (admin backend)
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';

    this.socket = io(socketUrl, {
      auth: {
        token: sessionToken,
      },
      reconnection: true,
      reconnectionDelay: this.baseReconnectDelay,
      reconnectionDelayMax: 10000, // 10 seconds
      reconnectionAttempts: this.maxReconnectAttempts,
      transports: ['websocket', 'polling'],
    });

    // Setup event listeners
    this.setupEventListeners();

    return this.socket;
  }

  /**
   * Get current socket instance
   */
  getSocket(): Socket<ServerToClientEvents, ClientToServerEvents> | null {
    return this.socket;
  }

  /**
   * Disconnect socket
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  /**
   * Subscribe to market updates
   */
  subscribeToMarket(marketId: string): void {
    if (!this.socket?.connected) {
      console.warn('Socket not connected, cannot subscribe to market:', marketId);
      return;
    }

    this.socket.emit('subscribe:market', marketId);
  }

  /**
   * Unsubscribe from market updates
   */
  unsubscribeFromMarket(marketId: string): void {
    if (!this.socket?.connected) {
      return;
    }

    this.socket.emit('unsubscribe:market', marketId);
  }

  /**
   * Check if socket is connected
   */
  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  /**
   * Setup internal event listeners for connection management
   */
  private setupEventListeners(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('[Socket] Connected');
      this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('[Socket] Disconnected:', reason);

      // Auto-reconnect on unexpected disconnect
      if (reason === 'io server disconnect') {
        // Server initiated disconnect, manual reconnect needed
        this.handleReconnect();
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('[Socket] Connection error:', error.message);
      this.handleReconnect();
    });
  }

  /**
   * Handle reconnection with exponential backoff
   */
  private handleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('[Socket] Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(
      this.baseReconnectDelay * Math.pow(2, this.reconnectAttempts),
      10000
    );

    console.log(`[Socket] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);

    setTimeout(() => {
      this.socket?.connect();
    }, delay);
  }
}

// Export singleton instance
export const socketClient = new SocketClient();
