"use client";

import { useState, useEffect } from "react";
import {
  BarChart3,
  Activity,
  TrendingUp,
  Shield,
  Wallet,
  Brain,
  Clock,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { usePortfolio } from "@/lib/supabase/hooks";
import {
  useExecutions,
  useBalances,
  useReasoningSubscription,
  useTransactions,
} from "@/lib/supabase/hooks";

export default function Dashboard({
  onBackToChat,
}: {
  onBackToChat?: () => void;
}) {
  const [selectedExecution, setSelectedExecution] = useState<string | null>(
    null
  );

  // Use demo wallet for now
  const walletAddress = "0xDemoWallet123";
  const { portfolio, loading: portfolioLoading } = usePortfolio(walletAddress);
  const { executions, loading: executionsLoading } = useExecutions();
  const { balances, loading: balancesLoading } = useBalances(portfolio?.id);
  const { reasoning, loading: reasoningLoading } =
    useReasoningSubscription(selectedExecution);
  const { transactions, loading: transactionsLoading } = useTransactions(
    portfolio?.id
  );

  const refreshData = () => {
    window.location.reload(); // Simple refresh for now
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-linear-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Spark Dashboard</h1>
              <p className="text-sm text-gray-400">
                Real-time agent activity & portfolio insights
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={refreshData}
              className="border-slate-600 text-gray-300 hover:bg-slate-700"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            {onBackToChat && (
              <Button
                variant="outline"
                size="sm"
                onClick={onBackToChat}
                className="border-slate-600 text-gray-300 hover:bg-slate-700"
              >
                Back to Chat
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Portfolio Overview */}
          <div className="lg:col-span-1">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Wallet className="w-5 h-5 mr-2 text-green-400" />
                  Portfolio
                </CardTitle>
              </CardHeader>
              <CardContent>
                {portfolioLoading ? (
                  <div className="animate-pulse space-y-2">
                    <div className="h-4 bg-slate-700 rounded"></div>
                    <div className="h-4 bg-slate-700 rounded w-3/4"></div>
                  </div>
                ) : portfolio ? (
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Wallet:</span>
                      <span className="font-mono text-sm">
                        {portfolio.wallet_address.slice(0, 6)}...
                        {portfolio.wallet_address.slice(-4)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Chain:</span>
                      <span>
                        {portfolio.chain_id === 1
                          ? "Ethereum"
                          : `Chain ${portfolio.chain_id}`}
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-400 text-sm">
                    No portfolio data available
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Balances */}
            <Card className="bg-slate-800/50 border-slate-700 mt-6">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-blue-400" />
                  Balances
                </CardTitle>
              </CardHeader>
              <CardContent>
                {balancesLoading ? (
                  <div className="animate-pulse space-y-2">
                    <div className="h-4 bg-slate-700 rounded"></div>
                    <div className="h-4 bg-slate-700 rounded"></div>
                  </div>
                ) : balances && balances.length > 0 ? (
                  <div className="space-y-2">
                    {balances.map((balance) => (
                      <div key={balance.id} className="flex justify-between">
                        <span className="text-gray-400">{balance.asset}:</span>
                        <span className="font-semibold">
                          {balance.amount.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400 text-sm">
                    No balance data available
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Executions List */}
          <div className="lg:col-span-2">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Activity className="w-5 h-5 mr-2 text-purple-400" />
                  Agent Executions
                </CardTitle>
              </CardHeader>
              <CardContent>
                {executionsLoading ? (
                  <div className="animate-pulse space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-16 bg-slate-700 rounded"></div>
                    ))}
                  </div>
                ) : executions && executions.length > 0 ? (
                  <ScrollArea className="h-96">
                    <div className="space-y-3">
                      {executions.map((execution) => (
                        <div
                          key={execution.execution_id}
                          className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                            selectedExecution === execution.execution_id
                              ? "bg-blue-500/20 border-blue-500/50"
                              : "bg-slate-700/30 border-slate-600 hover:bg-slate-700/50"
                          }`}
                          onClick={() =>
                            setSelectedExecution(execution.execution_id)
                          }
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-mono text-sm text-gray-300">
                              {execution.execution_id.slice(0, 8)}...
                            </span>
                            <Badge
                              variant={
                                execution.status === "completed"
                                  ? "default"
                                  : execution.status === "failed"
                                  ? "destructive"
                                  : "secondary"
                              }
                            >
                              {execution.status === "completed" && (
                                <CheckCircle className="w-3 h-3 mr-1" />
                              )}
                              {execution.status === "failed" && (
                                <AlertTriangle className="w-3 h-3 mr-1" />
                              )}
                              {execution.status === "running" && (
                                <Activity className="w-3 h-3 mr-1" />
                              )}
                              {execution.status}
                            </Badge>
                          </div>
                          <div className="text-xs text-gray-400">
                            Started:{" "}
                            {new Date(
                              execution.created_at || ""
                            ).toLocaleString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No executions found</p>
                    <p className="text-sm">
                      Start a chat to see agent activity here
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Execution Details */}
        {selectedExecution && (
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Reasoning Chain */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Brain className="w-5 h-5 mr-2 text-indigo-400" />
                  Agent Reasoning
                </CardTitle>
              </CardHeader>
              <CardContent>
                {reasoningLoading ? (
                  <div className="animate-pulse space-y-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-12 bg-slate-700 rounded"></div>
                    ))}
                  </div>
                ) : reasoning && reasoning.length > 0 ? (
                  <ScrollArea className="h-64">
                    <div className="space-y-3">
                      {reasoning.map((item) => (
                        <div
                          key={item.id}
                          className="p-3 bg-slate-700/30 rounded-lg"
                        >
                          <div className="flex items-center space-x-2 mb-2">
                            <Badge variant="outline" className="text-xs">
                              {item.agent_name}
                            </Badge>
                            <span className="text-xs text-gray-400">
                              Step {item.step_number}
                            </span>
                          </div>
                          <p className="text-sm text-gray-300">
                            {item.reasoning_text}
                          </p>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                ) : (
                  <p className="text-gray-400 text-sm">
                    No reasoning data available
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Risk Assessments */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Shield className="w-5 h-5 mr-2 text-red-400" />
                  Recent Transactions
                </CardTitle>
              </CardHeader>
              <CardContent>
                {transactionsLoading ? (
                  <div className="animate-pulse space-y-2">
                    <div className="h-12 bg-slate-700 rounded"></div>
                  </div>
                ) : transactions && transactions.length > 0 ? (
                  <ScrollArea className="h-64">
                    <div className="space-y-3">
                      {transactions.slice(0, 5).map((transaction) => (
                        <div
                          key={transaction.id}
                          className="p-3 bg-slate-700/30 rounded-lg"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <Badge
                              variant={
                                transaction.status === "completed"
                                  ? "default"
                                  : "secondary"
                              }
                              className="text-xs"
                            >
                              {transaction.status}
                            </Badge>
                            <span className="text-xs text-gray-400">
                              {new Date(
                                transaction.created_at || ""
                              ).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-300">
                            {transaction.description || "Transaction executed"}
                          </p>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                ) : (
                  <p className="text-gray-400 text-sm">
                    No recent transactions
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
