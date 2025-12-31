from agent_layer.base import BaseAgent
from coordination_layer.state import AgentState
from tools.defi_tools import get_protocol_apy, get_all_opportunities
from tools.web3_tools import sign_intent
from config.settings import settings



class DeFiAgent(BaseAgent):
    '''
    DeFi Strategy Agent - finds yield opportunities.
    Reads current positions, proposes migrations.
    '''

    def __init__(self, coord_layer):
        super().__init__("DeFi_Agent", coord_layer)

    async def execute(self, state: AgentState) -> AgentState:
        print(f"\n DEFI AGENT - Analyzing opportunities...")

        # Read current positions from state
        current_positions = state["positions"]
        current_balances = state["balances"]

        # Get available opportunities
        opportunities = get_all_opportunities()

        # Analyze and propose
        proposal = self._analyze_opportunities(
            current_positions,
            current_balances,
            opportunities
        )

        reasoning = proposal.get('reasoning', '')
        print(f"Proposal: {proposal.get('action')}")
        print(f"Reasoning: {reasoning}")

        # Sign the proposal with cryptographic proof
        intent_data = f"DeFi Proposal: {proposal.get('action')} {proposal.get('amount')} {proposal.get('asset')} from {proposal.get('source')} to {proposal.get('destination')}. APY gain: {proposal.get('apy_gain', 0):.2%}"
        signature_result = sign_intent("defi_agent", intent_data)

        if "error" not in signature_result:
            proposal["signature"] = signature_result["signature"]
            proposal["intent"] = intent_data
            proposal["signed_by"] = signature_result["signer_address"]
            print(f"✅ Proposal signed by DeFi Agent: {signature_result['signer_address'][:10]}...")
        else:
            print(f"❌ Failed to sign proposal: {signature_result['error']}")

        # Log to coordination layer
        self.log_reasoning(state, reasoning)
        self.coord.log_agent_decision(
            portfolio_id=state["portfolio_id"],
            execution_id=state["execution_id"],
            agent_name=self.name,
            decision_type="strategy",
            decision_data=proposal,
            reasoning=reasoning
        )

        # Update state
        state["defi_proposal"] = proposal
        state["next_agent"] = "orchestrator"

        # Write to coordination layer
        self.coord.write_state(state)

        return state

    def _analyze_opportunities(self, positions, balances, opportunities):
        '''Core logic to find best opportunity'''

        # Get current APY (if in a protocol)
        current_apy = 0
        current_protocol = None

        for protocol, position_data in positions.items():
            if "apy" in position_data:
                current_apy = position_data["apy"]
                current_protocol = protocol
                break

        # Find best opportunity
        best = max(opportunities, key=lambda x: x['apy'])

        # Check if move is worth it
        apy_diff = best['apy'] - current_apy

        if apy_diff > settings.MIN_APY_DIFF:
            
            test_amount = min(balances.get("USDC", 0), 100)  
            
            return {
                "action": "migrate",
                "source": current_protocol or "wallet",
                "destination": best['protocol'],
                "asset": "USDC",
                "amount": test_amount,
                "current_apy": current_apy,
                "new_apy": best['apy'],
                "apy_gain": apy_diff,
                "reasoning": f"Found {apy_diff:.2%} APY gain by moving to {best['protocol']} (test amount: {test_amount} USDC)"
            }
        else:
            return {
                "action": "hold",
                "reasoning": f"Best APY is {best['apy']:.2%}, only {apy_diff:.2%} gain. Not worth gas costs."
            }