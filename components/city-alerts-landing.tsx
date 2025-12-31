"use client";

import { useState, useEffect } from "react";
import {
  Brain,
  Zap,
  Shield,
  TrendingUp,
  Users,
  BarChart3,
  Activity,
  ArrowRight,
  Menu,
  X,
  Clock,
  CheckCircle,
  AlertTriangle,
  Bot,
  Network,
  Cpu,
  Globe,
  Target,
  Sparkles,
  MessageSquare,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useWallet } from "./wallet-context";

function WalletConnectButton() {
  const {
    account,
    balance,
    isConnecting,
    error,
    isCorrectNetwork,
    isMetaMaskInstalled,
    connectWallet,
    switchToBaseSepolia,
  } = useWallet();

  if (!isMetaMaskInstalled) {
    return (
      <Button
        size="lg"
        className="bg-red-600 hover:bg-red-700 text-lg px-8 py-6"
        onClick={() => window.open("https://metamask.io/download/", "_blank")}
      >
        Install MetaMask
        <Wallet className="w-5 h-5 ml-2" />
      </Button>
    );
  }

  if (account) {
    return (
      <div className="flex items-center gap-2">
        {!isCorrectNetwork && (
          <Button
            size="sm"
            variant="outline"
            className="border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-black"
            onClick={switchToBaseSepolia}
          >
            Switch to Base Sepolia
            <AlertTriangle className="w-4 h-4 ml-1" />
          </Button>
        )}

        <div className="flex items-center gap-2 bg-slate-800 rounded-lg px-3 py-2">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-sm text-white">
                {account.slice(0, 6)}...{account.slice(-4)}
              </span>
            </div>
            {isCorrectNetwork && balance && (
              <div className="text-xs text-gray-400">{balance} ETH</div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <Button
        size="lg"
        className="bg-linear-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-lg px-8 py-6"
        onClick={connectWallet}
        disabled={isConnecting}
      >
        {isConnecting ? "Connecting..." : "Connect Wallet"}
        <Wallet className="w-5 h-5 ml-2" />
      </Button>

      {error && (
        <div className="text-red-400 text-sm flex items-center gap-1">
          <AlertTriangle className="w-4 h-4" />
          {error}
        </div>
      )}
    </div>
  );
}

export default function DeFiAILanding({
  onLaunchChat,
  onViewDashboard,
}: {
  onLaunchChat?: () => void;
  onViewDashboard?: () => void;
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeAgent, setActiveAgent] = useState(0);

  // Mock agent activity data for live preview
  const mockAgents = [
    {
      name: "DeFi Agent",
      status: "analyzing",
      action: "Scanning protocols for 12.5% APY opportunity",
      icon: TrendingUp,
      color: "text-green-600",
    },
    {
      name: "Risk Agent",
      status: "assessing",
      action: "Evaluating Yearn protocol safety - Score: 10.0/10",
      icon: Shield,
      color: "text-red-600",
    },
    {
      name: "Orchestrator",
      status: "deciding",
      action: "Coordinating next agent action",
      icon: Brain,
      color: "text-blue-600",
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveAgent((prev) => (prev + 1) % mockAgents.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Navigation */}
      <nav className="relative z-10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-linear-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">Spark AI</span>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <a
              href="#features"
              className="text-gray-300 hover:text-white transition-colors"
            >
              Features
            </a>
            <a
              href="#agents"
              className="text-gray-300 hover:text-white transition-colors"
            >
              Agents
            </a>
            <a
              href="#demo"
              className="text-gray-300 hover:text-white transition-colors"
            >
              Live Demo
            </a>
            <Button className="bg-linear-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
              Launch Dashboard
            </Button>
          </div>

          <button
            className="md:hidden text-white"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-slate-800 border-t border-slate-700">
            <div className="px-6 py-4 space-y-4">
              <a
                href="#features"
                className="block text-gray-300 hover:text-white"
              >
                Features
              </a>
              <a
                href="#agents"
                className="block text-gray-300 hover:text-white"
              >
                Agents
              </a>
              <a href="#demo" className="block text-gray-300 hover:text-white">
                Live Demo
              </a>
              <Button className="w-full bg-linear-to-r from-blue-500 to-purple-600">
                Launch Dashboard
              </Button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative px-6 py-20">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex justify-center mb-6">
            <Badge className="bg-linear-to-r from-blue-500/20 to-purple-600/20 text-blue-300 border-blue-500/30">
              <Sparkles className="w-4 h-4 mr-2" />
              Autonomous Multi-Agent AI System
            </Badge>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
            DeFi Automation
            <span className="block bg-linear-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
              Reimagined
            </span>
          </h1>

          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Experience the future of decentralized finance with our autonomous
            multi-agent AI system. Intelligent agents work together to optimize
            yields, assess risks, and orchestrate complex DeFi strategies in
            real-time.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-linear-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-lg px-8 py-6"
              onClick={onLaunchChat}
            >
              <MessageSquare className="w-5 h-5 mr-2" />
              Launch AI Chat
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-gray-600 text-white hover:bg-gray-800 text-lg px-8 py-6"
              onClick={onViewDashboard}
            >
              <BarChart3 className="w-5 h-5 mr-2" />
              View Dashboard
            </Button>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-blue-500/20 rounded-full blur-xl"></div>
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-purple-500/20 rounded-full blur-xl"></div>
      </section>

      {/* Live Agent Activity */}
      <section className="px-6 py-16">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              Live Agent Activity
            </h2>
            <p className="text-gray-400">
              Watch our AI agents work autonomously in real-time
            </p>
          </div>

          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Activity className="w-5 h-5 mr-2 text-green-400" />
                Agent Control Center
              </CardTitle>
              <CardDescription className="text-gray-400">
                Real-time execution of multi-agent DeFi strategies
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockAgents.map((agent, index) => {
                  const Icon = agent.icon;
                  return (
                    <div
                      key={index}
                      className={`flex items-center space-x-4 p-4 rounded-lg transition-all duration-500 ${
                        index === activeAgent
                          ? "bg-blue-500/20 border border-blue-500/30"
                          : "bg-slate-700/30"
                      }`}
                    >
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center ${agent.color} bg-current/10`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold text-white">
                            {agent.name}
                          </span>
                          <Badge
                            variant={
                              agent.status === "analyzing"
                                ? "default"
                                : agent.status === "assessing"
                                ? "destructive"
                                : "secondary"
                            }
                          >
                            {agent.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-400">{agent.action}</p>
                      </div>
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <span className="text-xs text-green-400">LIVE</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Intelligent DeFi Automation
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Our multi-agent system orchestrates complex DeFi strategies with
              human-like intelligence, real-time market analysis, and automated
              risk management.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm hover:bg-slate-800/70 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 bg-linear-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center mb-4">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-white">Yield Optimization</CardTitle>
                <CardDescription className="text-gray-400">
                  AI-powered yield farming strategies that continuously scan and
                  optimize across 200+ protocols
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm hover:bg-slate-800/70 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 bg-linear-to-r from-red-500 to-pink-600 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-white">Risk Assessment</CardTitle>
                <CardDescription className="text-gray-400">
                  Advanced ML models evaluate protocol safety, audit status, and
                  market conditions in real-time
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm hover:bg-slate-800/70 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 bg-linear-to-r from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center mb-4">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-white">
                  Multi-Agent Orchestration
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Specialized AI agents collaborate autonomously to execute
                  complex DeFi strategies
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm hover:bg-slate-800/70 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 bg-linear-to-r from-purple-500 to-violet-600 rounded-lg flex items-center justify-center mb-4">
                  <Network className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-white">
                  Cross-Protocol Strategies
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Seamlessly execute strategies across multiple protocols and
                  blockchains
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm hover:bg-slate-800/70 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 bg-linear-to-r from-orange-500 to-yellow-600 rounded-lg flex items-center justify-center mb-4">
                  <Activity className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-white">
                  Real-Time Execution
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Monitor and control agent activities with live dashboards and
                  instant notifications
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm hover:bg-slate-800/70 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 bg-linear-to-r from-indigo-500 to-blue-600 rounded-lg flex items-center justify-center mb-4">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-white">
                  Autonomous Operation
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Set goals and let AI agents work 24/7 to optimize your DeFi
                  portfolio
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Agent Showcase */}
      <section id="agents" className="px-6 py-20 bg-slate-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Meet the Agents
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Specialized AI agents, each with unique capabilities, working
              together to maximize your DeFi performance.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-linear-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Brain className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Orchestrator
              </h3>
              <p className="text-gray-400 text-sm">
                Central coordinator that decides which agent to activate next
                based on goals and market conditions.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-linear-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                DeFi Agent
              </h3>
              <p className="text-gray-400 text-sm">
                Yield optimization specialist that scans protocols and
                identifies profitable opportunities.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-linear-to-r from-red-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Risk Agent
              </h3>
              <p className="text-gray-400 text-sm">
                Security expert using ML models to assess protocol risks and
                prevent potential losses.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-linear-to-r from-orange-500 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Prediction Agent
              </h3>
              <p className="text-gray-400 text-sm">
                Market forecasting specialist that analyzes trends and predicts
                yield stability.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Automate Your DeFi Strategy?
          </h2>
          <p className="text-xl text-gray-400 mb-8">
            Join the future of decentralized finance with autonomous AI agents
            that work around the clock to optimize your yields and manage risks.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <WalletConnectButton />
            <Button
              size="lg"
              variant="outline"
              className="border-gray-600 text-white hover:bg-gray-800 text-lg px-8 py-6"
            >
              View Documentation
            </Button>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-400 mb-2">200+</div>
              <div className="text-gray-400">Protocols Supported</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-400 mb-2">
                $2.1M+
              </div>
              <div className="text-gray-400">Assets Optimized</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-400 mb-2">
                99.7%
              </div>
              <div className="text-gray-400">Uptime</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-linear-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">Spark AI</span>
            </div>

            <div className="flex space-x-6 text-sm text-gray-400">
              <a href="#" className="hover:text-white transition-colors">
                Privacy
              </a>
              <a href="#" className="hover:text-white transition-colors">
                Terms
              </a>
              <a href="#" className="hover:text-white transition-colors">
                Docs
              </a>
              <a href="#" className="hover:text-white transition-colors">
                Support
              </a>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-slate-800 text-center text-gray-400 text-sm">
            © 2025 Spark AI. Built for the future of DeFi automation.
          </div>
        </div>
      </footer>
    </div>
  );
}
