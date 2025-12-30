import json
import google.generativeai as genai
from agent_layer.base import BaseAgent
from coordination_layer.state import AgentState
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
        print(f"🧠 ORCHESTRATOR - Iteration {state['iteration_count']}")
        print(f"{'='*60}")

        # Build context for Gemini
        prompt = self._build_prompt(state)

        try:
            response = model.generate_content(prompt)
            text = response.text.replace('```json', '').replace('```', '').strip()
            decision = json.loads(text)

            reasoning = decision.get('reasoning', 'No reasoning provided')
            next_agent = decision.get('next_agent', 'END')

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
            print(f"❌ Orchestrator Error: {e}")
            state["error_messages"].append(str(e))
            state["next_agent"] = "END"
            return state

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
6. 'END' - If task is complete or impossible

RULES:
- Always check risk BEFORE executing any trade
- Don't call the same agent twice in a row
- If risk score > {settings.RISK_THRESHOLD}, reject proposal

Return ONLY valid JSON:
{{
    "next_agent": "AGENT_NAME",
    "reasoning": "Brief explanation"
}}
"""