"use client";

import { useState } from "react";
import DeFiAILanding from "@/components/city-alerts-landing";
import ChatInterface from "@/components/chat-interface";
import Dashboard from "@/components/dashboard";
import { WalletProvider } from "@/components/wallet-context";

export default function Page() {
  const [currentView, setCurrentView] = useState<
    "landing" | "chat" | "dashboard"
  >("landing");

  return (
    <WalletProvider>
      {currentView === "chat" && <ChatInterface />}
      {currentView === "dashboard" && (
        <Dashboard onBackToChat={() => setCurrentView("chat")} />
      )}
      {currentView === "landing" && (
        <DeFiAILanding
          onLaunchChat={() => setCurrentView("chat")}
          onViewDashboard={() => setCurrentView("dashboard")}
        />
      )}
    </WalletProvider>
  );
}
