import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Database table types
export interface Portfolio {
  id: string;
  user_id: string;
  wallet_address: string;
  chain_id: number;
  created_at?: string;
  updated_at?: string;
}

export interface Balance {
  id?: string;
  portfolio_id: string;
  asset: string;
  amount: number;
  location: string;
  created_at?: string;
  updated_at?: string;
}

export interface AgentExecution {
  execution_id: string;
  portfolio_id: string;
  state_data: any; // JSON data
  status: "running" | "completed" | "failed";
  created_at?: string;
  updated_at?: string;
}

export interface AgentDecision {
  id?: string;
  execution_id: string;
  portfolio_id: string;
  agent_name: string;
  decision_type: string;
  decision_data: any; // JSON data
  reasoning: string;
  created_at?: string;
}

export interface AgentReasoning {
  id?: string;
  execution_id: string;
  agent_name: string;
  step_number: number;
  reasoning_text: string;
  created_at?: string;
}

export interface RiskAssessment {
  id?: string;
  execution_id: string;
  portfolio_id: string;
  protocol: string;
  risk_score: number;
  risk_factors: any; // JSON data
  safe: boolean;
  created_at?: string;
}

export interface ExecutedTransaction {
  id?: string;
  execution_id: string;
  portfolio_id: string;
  tx_hash: string;
  protocol: string;
  action: string;
  amount: number;
  status: "success" | "failed" | "pending";
  created_at?: string;
}

// Supabase client configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing Supabase environment variables");
}

// Create and export the Supabase client
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Portfolio operations
export const portfolioOperations = {
  // Get portfolio by wallet address
  getByWalletAddress: async (
    walletAddress: string
  ): Promise<Portfolio | null> => {
    const { data, error } = await supabase
      .from("portfolios")
      .select("*")
      .eq("wallet_address", walletAddress)
      .single();

    if (error && error.code !== "PGRST116") {
      // PGRST116 is "not found"
      console.error("Error fetching portfolio:", error);
      return null;
    }

    return data;
  },

  // Get all portfolios for a user
  getByUserId: async (userId: string): Promise<Portfolio[]> => {
    const { data, error } = await supabase
      .from("portfolios")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching portfolios:", error);
      return [];
    }

    return data || [];
  },

  // Create a new portfolio
  create: async (
    userId: string,
    walletAddress: string,
    chainId: number = 1
  ): Promise<Portfolio | null> => {
    const { data, error } = await supabase
      .from("portfolios")
      .upsert(
        {
          user_id: userId,
          wallet_address: walletAddress,
          chain_id: chainId,
        },
        {
          onConflict: "wallet_address",
        }
      )
      .select()
      .single();

    if (error) {
      console.error("Error creating portfolio:", error);
      return null;
    }

    return data;
  },
};

// Balance operations
export const balanceOperations = {
  // Get balances for a portfolio
  getByPortfolioId: async (portfolioId: string): Promise<Balance[]> => {
    const { data, error } = await supabase
      .from("balances")
      .select("*")
      .eq("portfolio_id", portfolioId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching balances:", error);
      return [];
    }

    return data || [];
  },

  // Subscribe to balance changes
  subscribeToPortfolio: (
    portfolioId: string,
    callback: (balance: Balance) => void
  ) => {
    return supabase
      .channel(`balances:${portfolioId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "balances",
          filter: `portfolio_id=eq.${portfolioId}`,
        },
        (payload) => {
          callback(payload.new as Balance);
        }
      )
      .subscribe();
  },
};

// Agent execution operations
export const executionOperations = {
  // Get executions for a portfolio
  getByPortfolioId: async (
    portfolioId: string,
    limit: number = 10
  ): Promise<AgentExecution[]> => {
    const { data, error } = await supabase
      .from("agent_executions")
      .select("*")
      .eq("portfolio_id", portfolioId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Error fetching executions:", error);
      return [];
    }

    return data || [];
  },

  // Get a specific execution
  getById: async (executionId: string): Promise<AgentExecution | null> => {
    const { data, error } = await supabase
      .from("agent_executions")
      .select("*")
      .eq("execution_id", executionId)
      .single();

    if (error) {
      console.error("Error fetching execution:", error);
      return null;
    }

    return data;
  },

  // Subscribe to execution updates
  subscribeToPortfolio: (
    portfolioId: string,
    callback: (execution: AgentExecution) => void
  ) => {
    return supabase
      .channel(`executions:${portfolioId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "agent_executions",
          filter: `portfolio_id=eq.${portfolioId}`,
        },
        (payload) => {
          callback(payload.new as AgentExecution);
        }
      )
      .subscribe();
  },
};

// Agent decision operations
export const decisionOperations = {
  // Get decisions for an execution
  getByExecutionId: async (executionId: string): Promise<AgentDecision[]> => {
    const { data, error } = await supabase
      .from("agent_decisions")
      .select("*")
      .eq("execution_id", executionId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching decisions:", error);
      return [];
    }

    return data || [];
  },
};

// Agent reasoning operations
export const reasoningOperations = {
  // Get reasoning for an execution
  getByExecutionId: async (executionId: string): Promise<AgentReasoning[]> => {
    const { data, error } = await supabase
      .from("agent_reasoning")
      .select("*")
      .eq("execution_id", executionId)
      .order("step_number", { ascending: true });

    if (error) {
      console.error("Error fetching reasoning:", error);
      return [];
    }

    return data || [];
  },

  // Subscribe to reasoning updates
  subscribeToExecution: (
    executionId: string,
    callback: (reasoning: AgentReasoning) => void
  ) => {
    return supabase
      .channel(`reasoning:${executionId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "agent_reasoning",
          filter: `execution_id=eq.${executionId}`,
        },
        (payload) => {
          callback(payload.new as AgentReasoning);
        }
      )
      .subscribe();
  },
};

// Risk assessment operations
export const riskOperations = {
  // Get risk assessments for an execution
  getByExecutionId: async (executionId: string): Promise<RiskAssessment[]> => {
    const { data, error } = await supabase
      .from("risk_assessments")
      .select("*")
      .eq("execution_id", executionId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching risk assessments:", error);
      return [];
    }

    return data || [];
  },
};

// Transaction operations
export const transactionOperations = {
  // Get transactions for a portfolio
  getByPortfolioId: async (
    portfolioId: string,
    limit: number = 20
  ): Promise<ExecutedTransaction[]> => {
    const { data, error } = await supabase
      .from("executed_transactions")
      .select("*")
      .eq("portfolio_id", portfolioId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Error fetching transactions:", error);
      return [];
    }

    return data || [];
  },

  // Subscribe to transaction updates
  subscribeToPortfolio: (
    portfolioId: string,
    callback: (transaction: ExecutedTransaction) => void
  ) => {
    return supabase
      .channel(`transactions:${portfolioId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "executed_transactions",
          filter: `portfolio_id=eq.${portfolioId}`,
        },
        (payload) => {
          callback(payload.new as ExecutedTransaction);
        }
      )
      .subscribe();
  },
};

// Combined operations for dashboard
export const dashboardOperations = {
  // Get complete execution data with all related information
  getExecutionDetails: async (executionId: string) => {
    const [execution, decisions, reasoning, risks] = await Promise.all([
      executionOperations.getById(executionId),
      decisionOperations.getByExecutionId(executionId),
      reasoningOperations.getByExecutionId(executionId),
      riskOperations.getByExecutionId(executionId),
    ]);

    return {
      execution,
      decisions,
      reasoning,
      risks,
    };
  },

  // Get portfolio overview with recent activity
  getPortfolioOverview: async (portfolioId: string) => {
    const [portfolio, balances, executions, transactions] = await Promise.all([
      supabase.from("portfolios").select("*").eq("id", portfolioId).single(),
      balanceOperations.getByPortfolioId(portfolioId),
      executionOperations.getByPortfolioId(portfolioId, 5),
      transactionOperations.getByPortfolioId(portfolioId, 10),
    ]);

    return {
      portfolio: portfolio.data,
      balances,
      recentExecutions: executions,
      recentTransactions: transactions,
    };
  },
};

export default supabase;
