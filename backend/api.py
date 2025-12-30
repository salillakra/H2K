import asyncio
import uuid
from datetime import datetime
from typing import Dict, Any, Optional
from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from config.settings import settings
from coordination_layer.layer import CoordinationLayer
from coordination_layer.state import AgentState
from graph.workflow import build_workflow

# Pydantic models for API
class ChatRequest(BaseModel):
    message: str
    wallet_address: Optional[str] = None
    user_id: Optional[str] = "demo_user"

class ChatResponse(BaseModel):
    execution_id: str
    portfolio_id: str
    status: str
    message: str

class ExecutionStatus(BaseModel):
    execution_id: str
    status: str
    current_agent: Optional[str]
    reasoning_chain: list[str]
    final_proposal: Optional[Dict]
    risk_assessment: Optional[Dict]
    qa_results: Optional[Dict]
    error_messages: list[str]

# Global variables for workflow management
app = FastAPI(title="H2K DeFi AI API", version="1.0.0")
coord_layer = None
workflow_app = None
active_executions = {}  # Track running executions

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],  # Frontend URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def initialize_system():
    """Initialize the coordination layer and workflow on startup"""
    global coord_layer, workflow_app

    print("🚀 Initializing H2K DeFi AI System...")

    # Initialize coordination layer
    coord_layer = CoordinationLayer(
        supabase_url=settings.SUPABASE_URL,
        supabase_key=settings.SUPABASE_KEY,
    )

    # Build workflow
    workflow_app = build_workflow(coord_layer)
    print("✅ System initialized successfully")

@app.on_event("startup")
async def startup_event():
    initialize_system()

async def process_chat_request(chat_request: ChatRequest) -> Dict[str, Any]:
    """Process a chat request and return execution details"""
    try:
        # Create or get portfolio
        wallet_address = chat_request.wallet_address or settings.DEFAULT_WALLET or "0xDemoWallet123"
        portfolio_id = coord_layer.create_portfolio(
            user_id=chat_request.user_id,
            wallet_address=wallet_address,
            chain_id=1
        )

        if not portfolio_id:
            raise HTTPException(status_code=500, detail="Failed to create/get portfolio")

        # Create initial state with user input
        execution_id = str(uuid.uuid4())

        initial_state: AgentState = {
            "portfolio_id": portfolio_id,
            "execution_id": execution_id,
            "user_input": chat_request.message,
            "wallet_address": wallet_address,
            "chain_id": 1,
            "balances": {"USDC": 10000, "ETH": 2},  # Default demo balances
            "positions": {"Aave": {"USDC": 10000, "apy": 0.05}},  # Default demo positions
            "orchestrator_decision": None,
            "defi_proposal": None,
            "risk_assessment": None,
            "prediction_forecast": None,
            "productivity_actions": None,
            "qa_results": None,
            "executed_transactions": [],
            "pending_transactions": [],
            "agent_reasoning": [],
            "next_agent": "orchestrator",
            "iteration_count": 0,
            "error_messages": [],
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat()
        }

        # Initialize execution in database
        actual_execution_id = coord_layer.init_execution(portfolio_id, initial_state)
        if actual_execution_id:
            execution_id = actual_execution_id
            initial_state["execution_id"] = execution_id

        # Store execution in active executions
        active_executions[execution_id] = {
            "status": "running",
            "portfolio_id": portfolio_id,
            "start_time": datetime.utcnow(),
            "state": initial_state
        }

        # Write initial state
        coord_layer.write_state(initial_state)

        return {
            "execution_id": execution_id,
            "portfolio_id": portfolio_id,
            "status": "running",
            "message": f"Started processing your request: '{chat_request.message}'"
        }

    except Exception as e:
        print(f"Error processing chat request: {e}")
        raise HTTPException(status_code=500, detail=str(e))

async def run_workflow_execution(execution_id: str):
    """Run the workflow execution in the background"""
    try:
        initial_state = active_executions[execution_id]["state"]

        # Run workflow
        final_state = await workflow_app.ainvoke(initial_state)

        # Update execution status
        active_executions[execution_id].update({
            "status": "completed",
            "completed_at": datetime.utcnow(),
            "final_state": final_state
        })

        # Write final state
        coord_layer.write_state(final_state)

        print(f"✅ Execution {execution_id} completed successfully")

    except Exception as e:
        print(f"❌ Execution {execution_id} failed: {e}")
        active_executions[execution_id].update({
            "status": "failed",
            "error": str(e),
            "completed_at": datetime.utcnow()
        })

@app.post("/api/chat", response_model=ChatResponse)
async def chat_endpoint(chat_request: ChatRequest, background_tasks: BackgroundTasks):
    """Main chat endpoint that accepts user messages and starts agent execution"""
    result = await process_chat_request(chat_request)

    # Start workflow execution in background
    background_tasks.add_task(run_workflow_execution, result["execution_id"])

    return ChatResponse(**result)

@app.get("/api/executions/{execution_id}", response_model=ExecutionStatus)
async def get_execution_status(execution_id: str):
    """Get the status and results of a specific execution"""
    if execution_id not in active_executions:
        raise HTTPException(status_code=404, detail="Execution not found")

    execution = active_executions[execution_id]
    state = execution.get("final_state") or execution["state"]

    return ExecutionStatus(
        execution_id=execution_id,
        status=execution["status"],
        current_agent=state.get("next_agent"),
        reasoning_chain=state.get("agent_reasoning", []),
        final_proposal=state.get("defi_proposal"),
        risk_assessment=state.get("risk_assessment"),
        qa_results=state.get("qa_results"),
        error_messages=state.get("error_messages", [])
    )

@app.get("/api/executions")
async def list_executions():
    """List all executions with their status"""
    return [
        {
            "execution_id": exec_id,
            "status": data["status"],
            "portfolio_id": data["portfolio_id"],
            "start_time": data["start_time"].isoformat(),
            "completed_at": data.get("completed_at", "").isoformat() if data.get("completed_at") else None
        }
        for exec_id, data in active_executions.items()
    ]

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "timestamp": datetime.utcnow().isoformat()}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)