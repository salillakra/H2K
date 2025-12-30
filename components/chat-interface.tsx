"use client";

import { useState, useRef, useEffect } from "react";
import {
  Send,
  Bot,
  User,
  Activity,
  Brain,
  Shield,
  TrendingUp,
  BarChart3,
  MessageSquare,
  Loader2,
  CheckCircle,
  AlertTriangle,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

interface Message {
  id: string;
  type: "user" | "agent" | "system";
  content: string;
  timestamp: Date;
  execution_id?: string;
  agent_name?: string;
  status?: "running" | "completed" | "failed";
}

interface ExecutionStatus {
  execution_id: string;
  status: string;
  current_agent?: string;
  reasoning_chain: string[];
  final_proposal?: any;
  risk_assessment?: any;
  qa_results?: any;
  error_messages: string[];
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeExecution, setActiveExecution] =
    useState<ExecutionStatus | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const statusIntervalRef = useRef<NodeJS.Timeout>();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Poll for execution status updates
  useEffect(() => {
    if (activeExecution?.execution_id && activeExecution.status === "running") {
      statusIntervalRef.current = setInterval(async () => {
        try {
          const response = await fetch(
            `http://localhost:8000/api/executions/${activeExecution.execution_id}`
          );
          if (response.ok) {
            const status: ExecutionStatus = await response.json();
            setActiveExecution(status);

            // Add new reasoning steps to messages
            if (
              status.reasoning_chain.length >
              activeExecution.reasoning_chain.length
            ) {
              const newReasoning = status.reasoning_chain.slice(
                activeExecution.reasoning_chain.length
              );
              newReasoning.forEach((reasoning, index) => {
                const agentName = status.current_agent || "Agent";
                setMessages((prev) => [
                  ...prev,
                  {
                    id: `${activeExecution.execution_id}-reasoning-${
                      activeExecution.reasoning_chain.length + index
                    }`,
                    type: "agent",
                    content: reasoning,
                    timestamp: new Date(),
                    execution_id: activeExecution.execution_id,
                    agent_name: agentName,
                  },
                ]);
              });
            }

            // Check if execution is complete
            if (status.status === "completed") {
              setMessages((prev) => [
                ...prev,
                {
                  id: `${activeExecution.execution_id}-complete`,
                  type: "system",
                  content: "✅ Execution completed successfully!",
                  timestamp: new Date(),
                  execution_id: activeExecution.execution_id,
                  status: "completed",
                },
              ]);

              // Add final results
              if (status.final_proposal) {
                setMessages((prev) => [
                  ...prev,
                  {
                    id: `${activeExecution.execution_id}-proposal`,
                    type: "agent",
                    content: `📊 Final Proposal: ${JSON.stringify(
                      status.final_proposal,
                      null,
                      2
                    )}`,
                    timestamp: new Date(),
                    execution_id: activeExecution.execution_id,
                    agent_name: "DeFi Agent",
                  },
                ]);
              }

              if (status.risk_assessment) {
                setMessages((prev) => [
                  ...prev,
                  {
                    id: `${activeExecution.execution_id}-risk`,
                    type: "agent",
                    content: `🛡️ Risk Assessment: ${JSON.stringify(
                      status.risk_assessment,
                      null,
                      2
                    )}`,
                    timestamp: new Date(),
                    execution_id: activeExecution.execution_id,
                    agent_name: "Risk Agent",
                  },
                ]);
              }

              setActiveExecution(null);
              setIsLoading(false);
            } else if (status.status === "failed") {
              setMessages((prev) => [
                ...prev,
                {
                  id: `${activeExecution.execution_id}-failed`,
                  type: "system",
                  content: `❌ Execution failed: ${status.error_messages.join(
                    ", "
                  )}`,
                  timestamp: new Date(),
                  execution_id: activeExecution.execution_id,
                  status: "failed",
                },
              ]);
              setActiveExecution(null);
              setIsLoading(false);
            }
          }
        } catch (error) {
          console.error("Error fetching execution status:", error);
        }
      }, 2000); // Poll every 2 seconds

      return () => {
        if (statusIntervalRef.current) {
          clearInterval(statusIntervalRef.current);
        }
      };
    }
  }, [activeExecution]);

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      type: "user",
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:8000/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: inputMessage,
          wallet_address: "0xDemoWallet123", // Default demo wallet
          user_id: "demo_user",
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      // Add system message about starting execution
      setMessages((prev) => [
        ...prev,
        {
          id: `system-${Date.now()}`,
          type: "system",
          content: `🤖 Starting AI agent execution... (ID: ${result.execution_id})`,
          timestamp: new Date(),
          execution_id: result.execution_id,
        },
      ]);

      // Start polling for status
      setActiveExecution({
        execution_id: result.execution_id,
        status: "running",
        reasoning_chain: [],
        error_messages: [],
      });
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          type: "system",
          content:
            "❌ Failed to connect to AI backend. Please make sure the backend server is running.",
          timestamp: new Date(),
        },
      ]);
      setIsLoading(false);
    }
  };

  const getAgentIcon = (agentName?: string) => {
    switch (agentName?.toLowerCase()) {
      case "orchestrator":
        return <Brain className="w-4 h-4" />;
      case "defi agent":
        return <TrendingUp className="w-4 h-4" />;
      case "risk agent":
        return <Shield className="w-4 h-4" />;
      case "prediction agent":
        return <BarChart3 className="w-4 h-4" />;
      default:
        return <Bot className="w-4 h-4" />;
    }
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case "running":
        return <Loader2 className="w-4 h-4 animate-spin text-blue-500" />;
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "failed":
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-900">
      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-slate-800 border-b border-slate-700 p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-linear-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Spark AI Chat</h1>
              <p className="text-sm text-gray-400">
                Interact with autonomous AI agents
              </p>
            </div>
            {activeExecution && (
              <Badge variant="secondary" className="ml-auto">
                <Activity className="w-3 h-3 mr-1" />
                {activeExecution.current_agent || "Processing"}...
              </Badge>
            )}
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-gray-400 py-8">
                <Bot className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg mb-2">Welcome to H2K DeFi AI</p>
                <p className="text-sm">
                  Ask me anything about DeFi optimization, yield farming, or
                  risk assessment!
                </p>
                <div className="mt-4 space-y-2">
                  <p className="text-xs text-gray-500">Try asking:</p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    <Badge
                      variant="outline"
                      className="cursor-pointer hover:bg-slate-700"
                      onClick={() =>
                        setInputMessage(
                          "Find me the best yield opportunity for my USDC"
                        )
                      }
                    >
                      "Find best USDC yield"
                    </Badge>
                    <Badge
                      variant="outline"
                      className="cursor-pointer hover:bg-slate-700"
                      onClick={() =>
                        setInputMessage(
                          "What's the risk of putting money in Aave?"
                        )
                      }
                    >
                      "Check Aave risks"
                    </Badge>
                    <Badge
                      variant="outline"
                      className="cursor-pointer hover:bg-slate-700"
                      onClick={() =>
                        setInputMessage(
                          "Should I stake ETH or provide liquidity?"
                        )
                      }
                    >
                      "ETH staking vs liquidity"
                    </Badge>
                  </div>
                </div>
              </div>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.type === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.type === "user"
                      ? "bg-blue-600 text-white"
                      : message.type === "system"
                      ? "bg-slate-700 text-gray-300"
                      : "bg-slate-800 text-gray-100"
                  }`}
                >
                  <div className="flex items-center space-x-2 mb-2">
                    {message.type === "user" ? (
                      <User className="w-4 h-4" />
                    ) : message.type === "system" ? (
                      getStatusIcon(message.status)
                    ) : (
                      getAgentIcon(message.agent_name)
                    )}
                    <span className="text-xs opacity-70">
                      {message.type === "user"
                        ? "You"
                        : message.type === "system"
                        ? "System"
                        : message.agent_name || "AI Agent"}
                    </span>
                    <span className="text-xs opacity-50">
                      {message.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="whitespace-pre-wrap text-sm">
                    {message.content}
                  </div>
                  {message.execution_id && (
                    <div className="text-xs opacity-50 mt-2">
                      Execution: {message.execution_id.slice(0, 8)}...
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="border-t border-slate-700 p-4">
          <div className="flex space-x-2">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Ask about DeFi strategies, yields, risks..."
              className="flex-1 bg-slate-800 border-slate-600 text-white placeholder-gray-400"
              disabled={isLoading}
            />
            <Button
              onClick={sendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className="bg-linear-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Sidebar with Live Data */}
      <div className="w-80 bg-slate-800 border-l border-slate-700 flex flex-col">
        <div className="p-4 border-b border-slate-700">
          <h2 className="text-lg font-semibold text-white flex items-center">
            <Activity className="w-5 h-5 mr-2 text-green-400" />
            Live Activity
          </h2>
        </div>

        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {activeExecution ? (
              <Card className="bg-slate-700/50 border-slate-600">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-white flex items-center">
                    <Loader2 className="w-4 h-4 mr-2 animate-spin text-blue-400" />
                    Active Execution
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-400">ID:</span>
                      <span className="text-gray-300 font-mono">
                        {activeExecution.execution_id.slice(0, 8)}...
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Agent:</span>
                      <span className="text-gray-300">
                        {activeExecution.current_agent || "Processing"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Steps:</span>
                      <span className="text-gray-300">
                        {activeExecution.reasoning_chain.length}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="text-center text-gray-400 py-8">
                <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No active executions</p>
              </div>
            )}

            <Separator className="bg-slate-600" />

            <div>
              <h3 className="text-sm font-semibold text-white mb-3">
                Agent Status
              </h3>
              <div className="space-y-2">
                {[
                  { name: "Orchestrator", status: "ready", icon: Brain },
                  {
                    name: "DeFi Agent",
                    status:
                      activeExecution?.current_agent === "defi_agent"
                        ? "active"
                        : "ready",
                    icon: TrendingUp,
                  },
                  {
                    name: "Risk Agent",
                    status:
                      activeExecution?.current_agent === "risk_agent"
                        ? "active"
                        : "ready",
                    icon: Shield,
                  },
                  {
                    name: "Prediction Agent",
                    status:
                      activeExecution?.current_agent === "prediction_agent"
                        ? "active"
                        : "ready",
                    icon: BarChart3,
                  },
                ].map((agent) => (
                  <div
                    key={agent.name}
                    className="flex items-center space-x-2 text-sm"
                  >
                    <agent.icon
                      className={`w-4 h-4 ${
                        agent.status === "active"
                          ? "text-green-400"
                          : "text-gray-500"
                      }`}
                    />
                    <span
                      className={`${
                        agent.status === "active"
                          ? "text-green-400"
                          : "text-gray-400"
                      }`}
                    >
                      {agent.name}
                    </span>
                    <Badge
                      variant={
                        agent.status === "active" ? "default" : "secondary"
                      }
                      className="ml-auto text-xs"
                    >
                      {agent.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
