import { useEffect, useState } from "react";
import {
  Portfolio,
  Balance,
  AgentExecution,
  AgentReasoning,
  AgentDecision,
  RiskAssessment,
  ExecutedTransaction,
  portfolioOperations,
  balanceOperations,
  executionOperations,
  reasoningOperations,
  decisionOperations,
  riskOperations,
  transactionOperations,
  dashboardOperations,
} from "./client";

// Hook for portfolio data
export function usePortfolio(walletAddress?: string) {
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!walletAddress) {
      setLoading(false);
      return;
    }

    const fetchPortfolio = async () => {
      try {
        setLoading(true);
        const data = await portfolioOperations.getByWalletAddress(
          walletAddress
        );
        setPortfolio(data);
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch portfolio"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolio();
  }, [walletAddress]);

  return { portfolio, loading, error };
}

// Hook for portfolio balances
export function useBalances(portfolioId?: string) {
  const [balances, setBalances] = useState<Balance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!portfolioId) {
      setLoading(false);
      return;
    }

    const fetchBalances = async () => {
      try {
        setLoading(true);
        const data = await balanceOperations.getByPortfolioId(portfolioId);
        setBalances(data);
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch balances"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchBalances();
  }, [portfolioId]);

  return { balances, loading, error };
}

// Hook for agent executions
export function useExecutions(portfolioId?: string, limit: number = 10) {
  const [executions, setExecutions] = useState<AgentExecution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!portfolioId) {
      setLoading(false);
      return;
    }

    const fetchExecutions = async () => {
      try {
        setLoading(true);
        const data = await executionOperations.getByPortfolioId(
          portfolioId,
          limit
        );
        setExecutions(data);
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch executions"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchExecutions();
  }, [portfolioId, limit]);

  return { executions, loading, error };
}

// Hook for execution details
export function useExecutionDetails(executionId?: string) {
  const [execution, setExecution] = useState<AgentExecution | null>(null);
  const [decisions, setDecisions] = useState<AgentDecision[]>([]);
  const [reasoning, setReasoning] = useState<AgentReasoning[]>([]);
  const [risks, setRisks] = useState<RiskAssessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!executionId) {
      setLoading(false);
      return;
    }

    const fetchDetails = async () => {
      try {
        setLoading(true);
        const data = await dashboardOperations.getExecutionDetails(executionId);
        setExecution(data.execution);
        setDecisions(data.decisions);
        setReasoning(data.reasoning);
        setRisks(data.risks);
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to fetch execution details"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [executionId]);

  return { execution, decisions, reasoning, risks, loading, error };
}

// Hook for real-time reasoning updates
export function useReasoningSubscription(executionId?: string) {
  const [reasoning, setReasoning] = useState<AgentReasoning[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!executionId) return;

    // Initial fetch
    const fetchInitialReasoning = async () => {
      try {
        const data = await reasoningOperations.getByExecutionId(executionId);
        setReasoning(data);
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch initial reasoning:", err);
        setLoading(false);
      }
    };

    fetchInitialReasoning();

    // Subscribe to updates
    const subscription = reasoningOperations.subscribeToExecution(
      executionId,
      (newReasoning) => {
        setReasoning((prev) => [...prev, newReasoning]);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [executionId]);

  return { reasoning, loading };
}

// Hook for transactions
export function useTransactions(portfolioId?: string, limit: number = 20) {
  const [transactions, setTransactions] = useState<ExecutedTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!portfolioId) {
      setLoading(false);
      return;
    }

    const fetchTransactions = async () => {
      try {
        setLoading(true);
        const data = await transactionOperations.getByPortfolioId(
          portfolioId,
          limit
        );
        setTransactions(data);
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch transactions"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [portfolioId, limit]);

  return { transactions, loading, error };
}

// Hook for portfolio overview
export function usePortfolioOverview(portfolioId?: string) {
  const [overview, setOverview] = useState<{
    portfolio: Portfolio | null;
    balances: Balance[];
    recentExecutions: AgentExecution[];
    recentTransactions: ExecutedTransaction[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!portfolioId) {
      setLoading(false);
      return;
    }

    const fetchOverview = async () => {
      try {
        setLoading(true);
        const data = await dashboardOperations.getPortfolioOverview(
          portfolioId
        );
        setOverview(data);
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to fetch portfolio overview"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchOverview();
  }, [portfolioId]);

  return { overview, loading, error };
}
