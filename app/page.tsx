"use client";

import { useState } from "react";
import DeFiAILanding from "@/components/city-alerts-landing";
import ChatInterface from "@/components/chat-interface";
import Dashboard from "@/components/dashboard";

export default function Page() {
  const [currentView, setCurrentView] = useState<
    "landing" | "chat" | "dashboard"
  >("landing");

  if (currentView === "chat") {
    return <ChatInterface />;
  }

  if (currentView === "dashboard") {
    return <Dashboard onBackToChat={() => setCurrentView("chat")} />;
  }

  return (
    <DeFiAILanding
      onLaunchChat={() => setCurrentView("chat")}
      onViewDashboard={() => setCurrentView("dashboard")}
    />
  );
}
