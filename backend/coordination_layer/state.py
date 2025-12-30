from typing import TypedDict, Optional, Dict, List, Any

class AgentState(TypedDict):
    '''
    Shared state that all agents read/write to.
    This is the "Whiteboard" in the coordination layer.
    '''
    # Execution Context
    portfolio_id: str
    execution_id: str
    user_input: str

    # Wallet & Portfolio (READ by all agents)
    wallet_address: str
    chain_id: int

    # Current Balances (UPDATED after transactions)
    balances: Dict[str, float]  # {"USDC": 10000, "ETH": 5}

    # Active Positions (UPDATED by DeFi Agent)
    positions: Dict[str, Dict[str, Any]]  # {"aave": {"USDC": 10000, "apy": 0.05}}

    # Agent Outputs (WRITTEN by each agent)
    orchestrator_decision: Optional[Dict]
    defi_proposal: Optional[Dict]
    risk_assessment: Optional[Dict]
    prediction_forecast: Optional[Dict]
    productivity_actions: Optional[List]
    qa_results: Optional[Dict]

    # Execution History
    executed_transactions: List[Dict]
    pending_transactions: List[Dict]

    # Reasoning Chain (For explainability dashboard)
    agent_reasoning: List[str]

    # Control Flow
    next_agent: str
    iteration_count: int
    error_messages: List[str]

    # Timestamps
    created_at: str
    updated_at: str