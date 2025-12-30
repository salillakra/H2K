import json
import redis
import os
from datetime import datetime
from typing import Dict, Any, Optional, List
from supabase import create_client, Client
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Define TypedDict for AgentState to ensure type safety across the system
from typing import TypedDict

class AgentState(TypedDict):
    '''
    Shared state that all agents read/write to.
    Syncs with 'agent_executions' table in Supabase.
    '''
    # Execution Context
    portfolio_id: str
    execution_id: str
    user_input: str

    # Wallet & Portfolio (READ by all agents)
    wallet_address: str
    chain_id: int

    # Current Balances
    balances: Dict[str, float]  # {"USDC": 10000, "ETH": 5}

    # Active Positions
    positions: Dict[str, Dict[str, Any]]  # {"aave": {"USDC": 10000, "apy": 0.05}}

    # Agent Outputs
    orchestrator_decision: Optional[Dict]
    defi_proposal: Optional[Dict]
    risk_assessment: Optional[Dict]
    prediction_forecast: Optional[Dict]
    productivity_actions: Optional[List]
    qa_results: Optional[Dict]

    # Execution History
    executed_transactions: List[Dict]
    pending_transactions: List[Dict]

    # Reasoning Chain
    agent_reasoning: List[str]

    # Control Flow
    next_agent: str
    iteration_count: int
    error_messages: List[str]

    # Timestamps
    created_at: str
    updated_at: str

class CoordinationLayer:
    '''
    The 'Whiteboard' where all agents read/write state.
    Uses Supabase (persistent) + Redis (cache).

    Connects strictly to the user's Supabase Schema:
    - portfolios
    - balances
    - agent_executions
    - agent_decisions
    - agent_reasoning
    - risk_assessments
    - executed_transactions
    '''

    def __init__(self, supabase_url: str = None, supabase_key: str = None, redis_url: str = None):
        # Load from env if not provided
        self.url = supabase_url or os.getenv("SUPABASE_URL")
        self.key = supabase_key or os.getenv("SUPABASE_KEY")

        if not self.url or not self.key:
            # We allow initialization without keys for testing, but warn
            print("Warning: SUPABASE_URL and SUPABASE_KEY not found. Operations will fail.")
            self.supabase = None
        else:
            self.supabase: Client = create_client(self.url, self.key)

        # Redis Client (Optional)
        self.redis_url = redis_url or os.getenv("REDIS_URL")
        self.redis_enabled = False
        if self.redis_url:
            try:
                self.redis = redis.from_url(self.redis_url)
                self.redis_enabled = True
                print("✅ Redis Cache Enabled")
            except Exception as e:
                print(f"⚠️ Redis connection failed: {e}. Using Supabase only.")

        self.cache_ttl = 300  # 5 minutes

    # ==================== 1. PORTFOLIO & WALLET ====================

    def get_portfolio_by_address(self, wallet_address: str) -> Optional[Dict]:
        '''Fetch portfolio ID from wallet address'''
        if not self.supabase: return None
        try:
            result = self.supabase.table("portfolios").select("*").eq("wallet_address", wallet_address).single().execute()
            if result.data:
                return result.data
            return None
        except Exception as e:
            print(f"Error fetching portfolio: {e}")
            return None

    def create_portfolio(self, user_id: str, wallet_address: str, chain_id: int = 1) -> str:
        '''Create new portfolio if doesn't exist'''
        if not self.supabase: return None
        try:
            data = {
                "user_id": user_id,
                "wallet_address": wallet_address,
                "chain_id": chain_id
            }
            # Uses upsert to avoid duplicates
            result = self.supabase.table("portfolios").upsert(data, on_conflict="wallet_address").execute()
            # result.data is a list of inserted rows
            if result.data:
                return result.data[0]['id']
            return None
        except Exception as e:
            print(f"Error creating portfolio: {e}")
            return None

    # ==================== 2. STATE MANAGEMENT (EXECUTION) ====================

    def read_state(self, execution_id: str) -> Optional[AgentState]:
        '''
        Read current state for this execution.
        Tries Redis first, then Supabase 'agent_executions' table.
        '''
        # 1. Try Cache
        if self.redis_enabled:
            try:
                cache_key = f"state:{execution_id}"
                cached = self.redis.get(cache_key)
                if cached:
                    return json.loads(cached)
            except Exception:
                pass

        # 2. Try Supabase
        if not self.supabase: return None
        try:
            result = self.supabase.table("agent_executions").select("state_data").eq("execution_id", execution_id).single().execute()
            if result.data:
                return result.data["state_data"]
        except Exception as e:
            print(f"Error reading state: {e}")

        return None

    def write_state(self, state: AgentState):
        '''
        Write updated state to 'agent_executions' table.
        Also updates Redis cache.
        '''
        state["updated_at"] = datetime.utcnow().isoformat()

        # 1. Update Supabase
        if self.supabase:
            try:
                self.supabase.table("agent_executions").update({
                    "state_data": state,
                    "status": "running",
                    "updated_at": state["updated_at"]
                }).eq("execution_id", state["execution_id"]).execute()
            except Exception as e:
                print(f"Error writing state to Supabase: {e}")

        # 2. Update Cache
        if self.redis_enabled:
            try:
                cache_key = f"state:{state['execution_id']}"
                self.redis.setex(
                    cache_key,
                    self.cache_ttl,
                    json.dumps(state, default=str)
                )
            except Exception:
                pass

    def init_execution(self, portfolio_id: str, initial_state: AgentState) -> str:
        '''Create a new row in agent_executions'''
        if not self.supabase: return "mock_execution_id"
        try:
            data = {
                "portfolio_id": portfolio_id,
                "state_data": initial_state,
                "status": "running"
            }
            result = self.supabase.table("agent_executions").insert(data).execute()
            if result.data:
                return result.data[0]['execution_id']
            return None
        except Exception as e:
            print(f"Error init execution: {e}")
            return None

    # ==================== 3. AGENT LOGGING (DECISIONS & REASONING) ====================

    def log_agent_decision(
        self,
        portfolio_id: str,
        execution_id: str,
        agent_name: str,
        decision_type: str,
        decision_data: Dict,
        reasoning: str
    ):
        '''Log high-level choice to 'agent_decisions' table'''
        if not self.supabase: return
        try:
            self.supabase.table("agent_decisions").insert({
                "execution_id": execution_id,
                "portfolio_id": portfolio_id,
                "agent_name": agent_name,
                "decision_type": decision_type,
                "decision_data": decision_data,
                "reasoning": reasoning
            }).execute()
        except Exception as e:
            print(f"Error logging decision: {e}")

    def log_agent_reasoning(
        self,
        portfolio_id: str,
        execution_id: str,
        agent_name: str,
        step_number: int,
        reasoning_text: str
    ):
        '''Log granular thought process to 'agent_reasoning' table'''
        if not self.supabase: return
        try:
            self.supabase.table("agent_reasoning").insert({
                "execution_id": execution_id,
                "agent_name": agent_name,
                "step_number": step_number,
                "reasoning_text": reasoning_text
            }).execute()
        except Exception as e:
            print(f"Error logging reasoning: {e}")

    # ==================== 4. RISK ASSESSMENTS ====================

    def record_risk_assessment(
        self,
        portfolio_id: str,
        execution_id: str,
        protocol: str,
        risk_score: float,
        risk_factors: Dict,
        safe: bool
    ):
        '''Record EBM output to 'risk_assessments' table'''
        if not self.supabase: return
        try:
            self.supabase.table("risk_assessments").insert({
                "execution_id": execution_id,
                "portfolio_id": portfolio_id,
                "protocol": protocol,
                "risk_score": risk_score,
                "risk_factors": risk_factors,
                "safe": safe
            }).execute()
        except Exception as e:
            print(f"Error recording risk: {e}")

    # ==================== 5. TRANSACTIONS & BALANCES ====================

    def update_balance(self, portfolio_id: str, asset: str, location: str, amount: float):
        '''Update 'balances' table'''
        if not self.supabase: return
        try:
            data = {
                "portfolio_id": portfolio_id,
                "asset": asset,
                "amount": amount,
                "location": location
            }
            # Insert new record. If you want updates, you need a constraint and upsert.
            # Assuming simple insert for now.
            self.supabase.table("balances").insert(data).execute() 

        except Exception as e:
            print(f"Error updating balance: {e}")

    def record_transaction(
        self,
        portfolio_id: str,
        execution_id: str,
        tx_hash: str,
        protocol: str,
        action: str,
        amount: float,
        status: str = "success"
    ):
        '''Record tx to 'executed_transactions' table'''
        if not self.supabase: return
        try:
            self.supabase.table("executed_transactions").insert({
                "execution_id": execution_id,
                "portfolio_id": portfolio_id,
                "tx_hash": tx_hash,
                "protocol": protocol,
                "action": action,
                "amount": amount,
                "status": status
            }).execute()
        except Exception as e:
            print(f"Error recording transaction: {e}")
