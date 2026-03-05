# Trading UI Components

Polymarket-style trading interface components for the Velocity Markets CLOB integration.

## Components

### 1. TradingForm
Interactive form for placing buy/sell orders with real-time fee calculation.

**Features:**
- Buy/Sell toggle
- YES/NO outcome selector
- Limit/Market order types
- Price and size inputs
- Real-time fee calculation
- Potential return display
- Fee transparency (2% taker fee shown)

**Props:**
```typescript
interface TradingFormProps {
  marketId: string;
  auctionId: string;
  auctionTitle: string;
  predictedPrice: number;
  onSubmit: (order: OrderSubmission) => void;
  loading?: boolean;
}
```

**Usage:**
```tsx
<TradingForm
  marketId="market-123"
  auctionId="auction-456"
  auctionTitle="1967 Porsche 911 S"
  predictedPrice={125000}
  onSubmit={(order) => console.log(order)}
/>
```

---

### 2. OrderBook
Real-time order book display showing buy/sell orders with depth visualization.

**Features:**
- Buy orders (bids) sorted by highest price first
- Sell orders (asks) sorted by lowest price first
- Spread calculation and display
- Visual depth bars showing order size
- Separate views for YES/NO outcomes
- Responsive grid layout

**Props:**
```typescript
interface OrderBookProps {
  orders: Order[];
  outcome: 'YES' | 'NO';
  maxDepth?: number; // default: 10
}
```

**Usage:**
```tsx
<OrderBook
  orders={liveOrders}
  outcome="YES"
  maxDepth={10}
/>
```

---

### 3. MarketCard
Polymarket-style market card with probability bars and stats.

**Features:**
- Hover animations
- YES/NO probability bars
- Status badges (ACTIVE/RESOLVED/PENDING)
- Volume and liquidity stats
- Time remaining countdown
- Winning outcome display
- Image support with gradient overlay
- Click to navigate to market

**Props:**
```typescript
interface MarketCardProps {
  marketId: string;
  auctionId: string;
  title: string;
  imageUrl?: string;
  predictedPrice: number;
  volume: number;
  liquidity: number;
  yesProbability: number; // 0-1
  status: 'PENDING' | 'ACTIVE' | 'RESOLVED';
  winningOutcome?: 'YES' | 'NO';
  endsAt?: Date;
  className?: string;
}
```

**Usage:**
```tsx
<MarketCard
  marketId="market-123"
  auctionId="auction-456"
  title="1967 Porsche 911 S"
  imageUrl="https://..."
  predictedPrice={125000}
  volume={45200}
  liquidity={12800}
  yesProbability={0.62}
  status="ACTIVE"
  endsAt={new Date('2026-03-05')}
/>
```

---

### 4. TradeSummary
Detailed breakdown of trade costs, fees, and potential returns.

**Features:**
- Price per share display
- Subtotal calculation
- Fee breakdown with percentages
- Total cost/return
- Potential profit calculation (for buys)
- Fee structure explanation
- Maker/taker fee info

**Props:**
```typescript
interface TradeSummaryProps {
  side: 'BUY' | 'SELL';
  outcome: 'YES' | 'NO';
  price: number;
  size: number;
  takerFee?: number; // default: 0.02 (2%)
  makerFee?: number; // default: 0.00 (0%)
  showPotentialReturn?: boolean; // default: true
}
```

**Usage:**
```tsx
<TradeSummary
  side="BUY"
  outcome="YES"
  price={0.55}
  size={100}
  takerFee={0.02}
/>
```

---

## Design Tokens

### Colors
```typescript
// Tailwind classes
'bg-trading-yes'    // #14B8A6 - Teal for YES
'bg-trading-no'     // #EF4444 - Red for NO
'bg-trading-bg-primary'   // #0A0A1A - Dark background
'bg-trading-bg-secondary' // #1A1B2E - Secondary background
'bg-trading-bg-card'      // #252739 - Card background
```

### Typography
- **Prices, stats, numbers**: `font-mono` (JetBrains Mono implied)
- **Headings**: `font-semibold` or `font-bold`
- **Body text**: System default

### Fee Structure
- **Taker Fee**: 2% (applied to market orders and limit orders that take liquidity)
- **Maker Fee**: 0% or rebate (applied to limit orders that add liquidity)

---

## Demo Page

See `TradingDemo.tsx` for a live showcase of all components with mock data.

To view the demo:
1. Import and render `<TradingDemo />` in any page
2. Includes tabs for each component
3. Shows design tokens and usage examples

---

## Integration Checklist

### Backend Requirements
- [ ] Create `/api/trading/order` endpoint (place orders)
- [ ] Create `/api/trading/orderbook` endpoint (fetch orders)
- [ ] Create `/api/trading/markets` endpoint (fetch markets)
- [ ] Set up WebSocket for real-time order updates

### Frontend Integration
- [ ] Wrap app with Web3Provider (from `/lib/web3`)
- [ ] Create trading pages using these components
- [ ] Connect TradingForm to backend API
- [ ] Connect OrderBook to WebSocket for real-time updates
- [ ] Add wallet balance checks before trades
- [ ] Add transaction signing with wagmi hooks

### Visual QA
- ✅ Dark mode default
- ✅ Teal (#14B8A6) for YES
- ✅ Red (#EF4444) for NO
- ✅ Probability bars showing YES/NO percentages
- ✅ Fee transparency (shown before trade)
- ✅ Real-time total calculation
- ✅ Mobile responsive

---

## File Structure

```
src/app/components/trading/
├── TradingForm.tsx      # Order placement form
├── OrderBook.tsx        # Order book display
├── MarketCard.tsx       # Market cards grid
├── TradeSummary.tsx     # Fee breakdown
├── TradingDemo.tsx      # Demo/showcase page
├── index.ts             # Exports
└── README.md            # This file
```

---

## TypeScript

All components are fully typed with TypeScript. No `any` types used. Props interfaces are exported for reuse.

---

## Next Steps

1. Create trading pages (e.g., `/trading/[auctionId]`)
2. Connect to backend APIs
3. Add WebSocket real-time updates
4. Integrate wallet balance checks
5. Add transaction confirmation modals
6. Add loading states and error handling
