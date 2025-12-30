import asyncio
import uuid
from datetime import datetime
from config.settings import settings
from coordination_layer.layer import CoordinationLayer
from coordination_layer.state import AgentState
from graph.workflow import build_workflow

async def main():
    print("\n" + "="*60)
    print("🚀 DEFI MULTI-AGENT SYSTEM STARTING...")
    print("="*60)

    # Initialize coordination layer
    coord_layer = CoordinationLayer(
        supabase_url=settings.SUPABASE_URL,
        supabase_key=settings.SUPABASE_KEY,
        
    )

    # Build workflow
    app = build_workflow(coord_layer)

    # Create or get portfolio
    wallet_address = settings.DEFAULT_WALLET or "0xDemoWallet123"
    portfolio_id = coord_layer.create_portfolio(
        user_id="demo_user_1",  # You might want to make this configurable
        wallet_address=wallet_address,
        chain_id=1
    )
    
    if not portfolio_id:
        print("❌ Failed to create/get portfolio. Using mock ID for demo.")
        portfolio_id = str(uuid.uuid4())  # Generate a UUID for demo purposes

    # Create initial state
    temp_execution_id = str(uuid.uuid4())

    initial_state: AgentState = {
        "portfolio_id": portfolio_id,
        "execution_id": temp_execution_id,  # Will be updated with actual execution_id
        "user_input": "Find me the best yield opportunity for my USDC",
        "wallet_address": settings.DEFAULT_WALLET or "0xDemo...",
        "chain_id": 1,
        "balances": {"USDC": 10000, "ETH": 2},
        "positions": {"Aave": {"USDC": 10000, "apy": 0.05}},
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
    else:
        execution_id = temp_execution_id

    # Write initial state to coordination layer
    coord_layer.write_state(initial_state)

    print(f"\n📋 Execution ID: {execution_id}")
    print(f"💼 Portfolio: {portfolio_id}")
    print(f"💬 User Request: {initial_state['user_input']}")
    print(f"💰 Starting Balance: {initial_state['balances']}")
    print()

    # Run workflow
    try:
        final_state = await app.ainvoke(initial_state)

        print("\n" + "="*60)
        print("✅ EXECUTION COMPLETE")
        print("="*60)
        print(f"\n🧠 REASONING CHAIN:")
        for reasoning in final_state['agent_reasoning']:
            print(f"  → {reasoning}")

        print(f"\n📊 FINAL PROPOSAL:")
        print(f"  {final_state.get('defi_proposal')}")

        print(f"\n🛡️ RISK ASSESSMENT:")
        print(f"  {final_state.get('risk_assessment')}")

        print(f"\n✅ QA RESULTS:")
        print(f"  {final_state.get('qa_results')}")

    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(main())