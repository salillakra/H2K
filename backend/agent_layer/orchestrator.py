import json
import google.generativeai as genai
from agent_layer.base import BaseAgent
from coordination_layer.state import AgentState
from tools.web3_tools import execute_transaction, can_execute_trade, collect_signatures
from config.settings import settings

genai.configure(api_key=settings.GOOGLE_API_KEY)
model = genai.GenerativeModel(settings.ORCHESTRATOR_MODEL)

class OrchestratorAgent(BaseAgent):
    '''
    The "Portfolio Manager" - decides which agent to call next.
    '''

    def __init__(self, coord_layer):
        super().__init__("Orchestrator", coord_layer)

    async def execute(self, state: AgentState) -> AgentState:
        print(f"\n{'='*60}")
        print(f"ORCHESTRATOR - Iteration {state['iteration_count']}")
        print(f"{'='*60}")

        # Build context for Gemini
        prompt = self._build_prompt(state)

        try:
            response = model.generate_content(prompt)
            text = response.text.replace('```json', '').replace('```', '').strip()
            decision = json.loads(text)

            reasoning = decision.get('reasoning', 'No reasoning provided')
            next_agent = decision.get('next_agent', 'END')

            # Handle trade execution
            if next_agent == "EXECUTE_TRADE":
                print("🔄 Executing trade...")
                execution_result = self._execute_trade(state)
                state["executed_transactions"].append(execution_result)
                next_agent = "END"  # End after execution

            print(f"Decision: Route to {next_agent}")
            print(f"Reasoning: {reasoning}")

            # Log to coordination layer
            self.log_reasoning(state, reasoning)
            self.coord.log_agent_decision(
                portfolio_id=state["portfolio_id"],
                execution_id=state["execution_id"],
                agent_name=self.name,
                decision_type="routing",
                decision_data=decision,
                reasoning=reasoning
            )

            # Update state
            state["orchestrator_decision"] = decision
            state["next_agent"] = next_agent
            state["iteration_count"] += 1

            # Write back to coordination layer
            self.coord.write_state(state)

            return state

        except Exception as e:
            print(f"Orchestrator Error: {e}")
            state["error_messages"].append(str(e))
            state["next_agent"] = "END"
            return state

    def _execute_trade(self, state: AgentState):
        """Execute the approved DeFi trade with signature verification"""
        proposal = state.get("defi_proposal", {})

        if not proposal:
            return {"status": "failed", "error": "No proposal to execute"}

        # Verify we have required signatures
        if not can_execute_trade(state):
            collected_sigs = collect_signatures(state)
            return {
                "status": "failed",
                "error": f"Insufficient signatures for execution. Required: defi_agent, risk_agent. Collected: {collected_sigs}"
            }

        print("✅ All required signatures verified - proceeding with execution")

        # Extract trade details from proposal
        protocol = proposal.get("destination", "wallet")
        action = proposal.get("action", "transfer")
        amount = proposal.get("amount", 0.0001)  # Default small amount for testing
        token = proposal.get("asset", "ETH")

        # Execute the transaction
        result = execute_transaction(
            protocol=protocol,
            action=action,
            amount=amount,
            token=token
        )

        # Log the execution
        self.coord.log_agent_decision(
            portfolio_id=state["portfolio_id"],
            execution_id=state["execution_id"],
            agent_name=self.name,
            decision_type="execution",
            decision_data=result,
            reasoning=f"Executed {action} on {protocol} for {amount} {token} with multi-sig approval"
        )

        return result

    def _build_prompt(self, state: AgentState) -> str:
        return f"""
You are the Portfolio Manager of a DeFi hedge fund.

USER REQUEST: {state['user_input']}

CURRENT STATE:
- Wallet: {state['wallet_address']}
- Balances: {json.dumps(state['balances'], indent=2)}
- Positions: {json.dumps(state['positions'], indent=2)}

AGENT OUTPUTS SO FAR:
- DeFi Proposal: {state.get('defi_proposal')}
- Risk Assessment: {state.get('risk_assessment')}
- Prediction: {state.get('prediction_forecast')}

REASONING CHAIN:
{chr(10).join(state['agent_reasoning'][-5:])}

DECIDE THE NEXT STEP:
1. 'defi_agent' - If we need to find/optimize yield opportunities
2. 'risk_agent' - If we have a proposal and need safety check
3. 'prediction_agent' - If we need market forecast
4. 'productivity_agent' - If we need to notify user
5. 'qa_agent' - If we need final validation
6. 'EXECUTE_TRADE' - If all checks pass and we should execute the DeFi proposal
7. 'END' - If task is complete or impossible

RULES:
- Always check risk BEFORE executing any trade
- Don't call the same agent twice in a row
- If risk score > {settings.RISK_THRESHOLD}, reject proposal
- Only execute if we have VALID SIGNATURES from both DeFi Agent and Risk Agent
- EXECUTE_TRADE requires cryptographic approval from multiple autonomous agents

Return ONLY valid JSON:
{{
    "next_agent": "AGENT_NAME_OR_EXECUTE_TRADE",
    "reasoning": "Brief explanation of the decision and signature requirements"
}}
"""