"use client";

import { useState } from "react";
import {
  usePortfolio,
  useBalances,
  useExecutions,
  useExecutionDetails,
} from "@/lib/supabase";

export default function DashboardExample() {
  const [walletAddress, setWalletAddress] = useState("");
  const [selectedExecutionId, setSelectedExecutionId] = useState<string | null>(
    null
  );

  const { portfolio, loading: portfolioLoading } = usePortfolio(
    walletAddress || undefined
  );
  const { balances, loading: balancesLoading } = useBalances(portfolio?.id);
  const { executions, loading: executionsLoading } = useExecutions(
    portfolio?.id
  );
  const {
    execution,
    decisions,
    reasoning,
    risks,
    loading: detailsLoading,
  } = useExecutionDetails(selectedExecutionId || undefined);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">DeFi Agent Dashboard</h1>

      {/* Wallet Input */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Wallet Address</label>
        <input
          type="text"
          value={walletAddress}
          onChange={(e) => setWalletAddress(e.target.value)}
          placeholder="Enter wallet address (e.g., 0xYourDefaultWalletAddress)"
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Portfolio Info */}
      {portfolioLoading && <div>Loading portfolio...</div>}
      {portfolio && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">Portfolio</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <span className="text-gray-600">ID:</span>
              <p className="font-mono text-sm">{portfolio.id}</p>
            </div>
            <div>
              <span className="text-gray-600">Wallet:</span>
              <p className="font-mono text-sm">{portfolio.wallet_address}</p>
            </div>
            <div>
              <span className="text-gray-600">Chain ID:</span>
              <p>{portfolio.chain_id}</p>
            </div>
          </div>
        </div>
      )}

      {/* Balances */}
      {balancesLoading && <div>Loading balances...</div>}
      {balances.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">Balances</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {balances.map((balance, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="font-semibold">{balance.asset}</div>
                <div className="text-2xl font-bold text-green-600">
                  {balance.amount}
                </div>
                <div className="text-sm text-gray-600">{balance.location}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Executions */}
      {executionsLoading && <div>Loading executions...</div>}
      {executions.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">
            Recent Agent Executions
          </h2>
          <div className="space-y-3">
            {executions.map((exec) => (
              <div
                key={exec.execution_id}
                className="p-4 border rounded-lg cursor-pointer hover:bg-gray-50"
                onClick={() => setSelectedExecutionId(exec.execution_id)}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-mono text-sm">
                      {exec.execution_id.slice(0, 8)}...
                    </div>
                    <div className="text-sm text-gray-600">
                      {new Date(exec.created_at || "").toLocaleString()}
                    </div>
                  </div>
                  <div
                    className={`px-2 py-1 rounded text-sm ${
                      exec.status === "completed"
                        ? "bg-green-100 text-green-800"
                        : exec.status === "running"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {exec.status}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Execution Details */}
      {selectedExecutionId && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Execution Details</h2>

          {detailsLoading && <div>Loading details...</div>}

          {execution && (
            <div className="mb-6">
              <h3 className="font-semibold mb-2">State Data</h3>
              <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto">
                {JSON.stringify(execution.state_data, null, 2)}
              </pre>
            </div>
          )}

          {decisions.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold mb-2">
                Agent Decisions ({decisions.length})
              </h3>
              <div className="space-y-2">
                {decisions.map((decision, index) => (
                  <div key={index} className="p-3 bg-blue-50 rounded">
                    <div className="font-medium">
                      {decision.agent_name}: {decision.decision_type}
                    </div>
                    <div className="text-sm text-gray-600">
                      {decision.reasoning}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {reasoning.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold mb-2">
                Agent Reasoning ({reasoning.length})
              </h3>
              <div className="space-y-2">
                {reasoning.map((reason, index) => (
                  <div key={index} className="p-3 bg-green-50 rounded">
                    <div className="font-medium">
                      Step {reason.step_number}: {reason.agent_name}
                    </div>
                    <div className="text-sm">{reason.reasoning_text}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {risks.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">
                Risk Assessments ({risks.length})
              </h3>
              <div className="space-y-2">
                {risks.map((risk, index) => (
                  <div key={index} className="p-3 bg-red-50 rounded">
                    <div className="font-medium">{risk.protocol}</div>
                    <div className="text-lg font-bold">
                      Risk Score: {risk.risk_score}/10
                      <span
                        className={`ml-2 px-2 py-1 rounded text-sm ${
                          risk.safe
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {risk.safe ? "SAFE" : "RISKY"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
