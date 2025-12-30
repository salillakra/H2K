from coordination_layer.layer import CoordinationLayer
from config.settings import settings

coord = CoordinationLayer(settings.SUPABASE_URL, settings.SUPABASE_KEY)

print("Checking database contents...")

# Check executions
executions = coord.supabase.table('agent_executions').select('*').limit(5).execute()
print(f"\nAgent Executions ({len(executions.data)} found):")
for exec in executions.data:
    print(f"  ID: {exec['execution_id']}")
    print(f"  Portfolio: {exec['portfolio_id']}")
    print(f"  Status: {exec['status']}")
    print(f"  Created: {exec.get('created_at', 'N/A')}")
    print()

# Check portfolios
portfolios = coord.supabase.table('portfolios').select('*').limit(5).execute()
print(f"Portfolios ({len(portfolios.data)} found):")
for port in portfolios.data:
    print(f"  ID: {port['id']}")
    print(f"  Wallet: {port['wallet_address']}")
    print(f"  User: {port['user_id']}")
    print(f"  Chain: {port['chain_id']}")
    print()

# Check agent decisions
decisions = coord.supabase.table('agent_decisions').select('*').limit(5).execute()
print(f"Agent Decisions ({len(decisions.data)} found):")
for dec in decisions.data:
    print(f"  Execution: {dec['execution_id']}")
    print(f"  Agent: {dec['agent_name']}")
    print(f"  Decision: {dec['decision_type']}")
    print()

# Check agent reasoning
reasoning = coord.supabase.table('agent_reasoning').select('*').limit(5).execute()
print(f"Agent Reasoning ({len(reasoning.data)} found):")
for rea in reasoning.data:
    print(f"  Execution: {rea['execution_id']}")
    print(f"  Agent: {rea['agent_name']}")
    print(f"  Step: {rea['step_number']}")
    print(f"  Reasoning: {rea['reasoning_text'][:100]}...")
    print()