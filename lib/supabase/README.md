# Supabase TypeScript Client

This directory contains the TypeScript client for interacting with Supabase from the Next.js frontend.

## Setup

1. Install dependencies:

```bash
npm install @supabase/supabase-js
```

2. Environment variables (`.env.local`):

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Files

- `client.ts` - Main Supabase client with typed operations
- `hooks.ts` - React hooks for common operations
- `index.ts` - Main export file

## Usage

### Basic Client Usage

```typescript
import {
  supabase,
  portfolioOperations,
  executionOperations,
} from "@/lib/supabase";

// Get portfolio by wallet address
const portfolio = await portfolioOperations.getByWalletAddress("0x123...");

// Get executions for a portfolio
const executions = await executionOperations.getByPortfolioId(portfolioId);
```

### React Hooks

```typescript
import { usePortfolio, useBalances, useExecutions } from "@/lib/supabase";

function MyComponent() {
  const { portfolio, loading } = usePortfolio(walletAddress);
  const { balances } = useBalances(portfolio?.id);
  const { executions } = useExecutions(portfolio?.id);

  if (loading) return <div>Loading...</div>;

  return <div>{/* Your component JSX */}</div>;
}
```

## Available Operations

### Portfolio Operations

- `getByWalletAddress(walletAddress)` - Get portfolio by wallet
- `getByUserId(userId)` - Get all portfolios for a user
- `create(userId, walletAddress, chainId)` - Create new portfolio

### Balance Operations

- `getByPortfolioId(portfolioId)` - Get balances for portfolio
- `subscribeToPortfolio(portfolioId, callback)` - Real-time balance updates

### Execution Operations

- `getByPortfolioId(portfolioId, limit)` - Get executions for portfolio
- `getById(executionId)` - Get specific execution
- `subscribeToPortfolio(portfolioId, callback)` - Real-time execution updates

### Decision Operations

- `getByExecutionId(executionId)` - Get decisions for execution

### Reasoning Operations

- `getByExecutionId(executionId)` - Get reasoning for execution
- `subscribeToExecution(executionId, callback)` - Real-time reasoning updates

### Risk Operations

- `getByExecutionId(executionId)` - Get risk assessments

### Transaction Operations

- `getByPortfolioId(portfolioId, limit)` - Get transactions
- `subscribeToPortfolio(portfolioId, callback)` - Real-time transaction updates

### Dashboard Operations

- `getExecutionDetails(executionId)` - Complete execution data
- `getPortfolioOverview(portfolioId)` - Portfolio summary

## Real-time Subscriptions

The client supports real-time subscriptions for live updates:

```typescript
import { balanceOperations } from "@/lib/supabase";

const subscription = balanceOperations.subscribeToPortfolio(
  portfolioId,
  (balance) => {
    console.log("Balance updated:", balance);
    // Update your UI
  }
);

// Don't forget to unsubscribe when component unmounts
subscription.unsubscribe();
```

## TypeScript Types

All database tables have corresponding TypeScript interfaces:

- `Portfolio`
- `Balance`
- `AgentExecution`
- `AgentDecision`
- `AgentReasoning`
- `RiskAssessment`
- `ExecutedTransaction`

## Example Component

See `components/dashboard-example.tsx` for a complete example of using the client in a React component.
