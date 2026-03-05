# Socket.IO Client Integration

Real-time WebSocket connection for order book updates using Socket.IO.

## Architecture

- **Singleton Client**: `client.ts` provides a single shared Socket.IO connection
- **React Hook**: `useOrderBook` hook manages subscriptions and state
- **Type Safety**: Full TypeScript support for all events and payloads

## Usage

### 1. Basic Order Book Subscription

```tsx
import { useOrderBook } from '@/hooks/useOrderBook';

function TradingPage({ marketId }: { marketId: string }) {
  const { orderBook, isConnected, error, isLoading } = useOrderBook(marketId);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <ConnectionStatus isConnected={isConnected} />
      {/* Render order book */}
    </div>
  );
}
```

### 2. Using the TradingOrderBook Component

```tsx
import { TradingOrderBook } from '@/app/components/trading/TradingOrderBook';

function MarketPage() {
  return <TradingOrderBook marketId="market-123" />;
}
```

## Events

### Server → Client Events

#### `orderBook:update`
Full order book snapshot sent when:
- User first subscribes to a market
- Orders are added/matched/cancelled

Payload:
```typescript
{
  marketId: string;
  orders: Array<{
    id: string;
    side: 'BUY' | 'SELL';
    outcome: 'YES' | 'NO';
    price: number;          // 0-1 range (0.5 = $0.50)
    size: number;
    remainingSize: number;
  }>;
  timestamp: number;
}
```

#### `order:matched`
Sent when a trade executes.

Payload:
```typescript
{
  marketId: string;
  orderId: string;
  matchedSize: number;
  matchedPrice: number;
  timestamp: number;
}
```

#### `order:cancelled`
Sent when an order is cancelled.

Payload:
```typescript
{
  marketId: string;
  orderId: string;
  timestamp: number;
}
```

#### `market:resolved`
Sent when a market is resolved.

Payload:
```typescript
{
  marketId: string;
  winningOutcome: 'YES' | 'NO';
  hammerPrice: number;
  timestamp: number;
}
```

### Client → Server Events

#### `subscribe:market`
Subscribe to a market's order book updates.

```typescript
socket.emit('subscribe:market', marketId);
```

#### `unsubscribe:market`
Unsubscribe from a market's updates.

```typescript
socket.emit('unsubscribe:market', marketId);
```

## Connection Management

### Auto-Reconnection

The client automatically reconnects with exponential backoff:
- Base delay: 1 second
- Max delay: 10 seconds
- Max attempts: 10

### Connection States

- `isConnected: true` - Connected and ready
- `isConnected: false, isLoading: true` - Connecting...
- `isConnected: false, error: string` - Disconnected with error

### Manual Disconnect

```typescript
import { socketClient } from '@/lib/socket/client';

socketClient.disconnect();
```

## Environment Variables

Set the Socket.IO server URL:

```env
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001  # Development
NEXT_PUBLIC_SOCKET_URL=https://admin.velocitymarkets.com  # Production
```

## Authentication

The hook automatically uses the NextAuth session token for authentication:

```typescript
const { data: session } = useSession();
const token = session?.user?.id;
socket.connect(token);
```

## Performance

### Optimistic Updates

The hook merges server updates with local optimistic updates for instant UI feedback.

### Subscription Management

- Automatically subscribes on mount
- Automatically unsubscribes on unmount or marketId change
- Only one subscription per market across all components

### Rate Limiting

The backend limits:
- Max 50 markets subscribed per user
- Rate-limited subscription requests

## Testing

### Manual Testing Checklist

- [ ] Subscribe to market on component mount
- [ ] Receive initial order book snapshot
- [ ] Order book updates when new orders are placed
- [ ] Order book updates when orders are matched
- [ ] Order book updates when orders are cancelled
- [ ] Unsubscribe from market on component unmount
- [ ] Connection status shows "Live" when connected
- [ ] Connection status shows "Connecting..." during reconnect
- [ ] Connection status shows "Disconnected" on error
- [ ] Reconnection works after server disconnect
- [ ] Multiple components can use same hook without duplicate subscriptions

### Integration Test

```bash
# Terminal 1: Start admin backend (Socket.IO server)
cd admin && npm run dev

# Terminal 2: Start frontend
cd frontend && npm run dev

# Terminal 3: Place order via API
curl -X POST http://localhost:3001/api/orders/create \
  -H "Content-Type: application/json" \
  -d '{
    "marketId": "market-123",
    "side": "BUY",
    "outcome": "YES",
    "price": 0.6,
    "size": 100
  }'

# Verify: Order appears in frontend order book within 500ms
```

## Coordination with Backend

Event names and payload formats MUST match between frontend and backend:

**Backend Implementation**: `admin/src/lib/websocket/orderBookServer.ts`
**Frontend Implementation**: `frontend/src/lib/socket/client.ts`

Both must use the same:
- Event names (`orderBook:update`, `order:matched`, etc.)
- Payload structures (TypeScript interfaces)
- Room naming (`market:{marketId}`)

## Troubleshooting

### "Connection error: ..."

Check:
- `NEXT_PUBLIC_SOCKET_URL` is set correctly
- Backend Socket.IO server is running
- CORS is configured on backend to allow frontend origin

### "No orders available"

Check:
- Market exists in database
- Market status is ACTIVE
- Orders exist for the market

### Orders not updating in real-time

Check:
- `isConnected` is true
- Backend is emitting events after order changes
- Event names match between frontend and backend
- Browser console for Socket.IO debug logs

Enable Socket.IO debug logs:
```javascript
localStorage.debug = 'socket.io-client:socket';
```
