from agent_layer.base import BaseAgent
from coordination_layer.state import AgentState
from models.risk_ebm import RiskModel
from tools.web3_tools import sign_intent
from config.settings import settings

class RiskAgent(BaseAgent):
    '''
    Risk Assessment Agent - uses EBM to score safety.
    '''

    def __init__(self, coord_layer):
        super().__init__("Risk_Agent", coord_layer)
        self.risk_model = RiskModel()

    async def execute(self, state: AgentState) -> AgentState:
        print(f"\n RISK AGENT - Assessing safety...")

        proposal = state.get("defi_proposal")

        if not proposal or proposal.get("action") == "hold":
            print("No action to assess.")
            state["risk_assessment"] = {"safe": True, "score": 0}
            state["next_agent"] = "orchestrator"
            return state

        # Extract protocol to assess
        protocol = proposal.get("destination", "Unknown")

        # Run EBM risk model
        risk_score, risk_factors = self.risk_model.assess_protocol(protocol)

        is_safe = risk_score < settings.RISK_THRESHOLD

        assessment = {
            "protocol": protocol,
            "risk_score": risk_score,
            "safe": is_safe,
            "factors": risk_factors,
            "threshold": settings.RISK_THRESHOLD
        }

        reasoning = f"Risk Score: {risk_score:.1f}/10. "
        reasoning += "SAFE " if is_safe else "TOO RISKY "

        print(f"Assessment: {reasoning}")
        print(f"Factors: {risk_factors}")

        # Sign the risk assessment
        intent_data = f"Risk Assessment: {protocol} scored {risk_score:.1f}/10. {'APPROVED' if is_safe else 'REJECTED'}. Factors: {', '.join(risk_factors)}"
        signature_result = sign_intent("risk_agent", intent_data)

        if "error" not in signature_result:
            assessment["signature"] = signature_result["signature"]
            assessment["intent"] = intent_data
            assessment["signed_by"] = signature_result["signer_address"]
            print(f"✅ Risk assessment signed by Risk Agent: {signature_result['signer_address'][:10]}...")
        else:
            print(f"❌ Failed to sign risk assessment: {signature_result['error']}")

        # Log to coordination layer
        self.log_reasoning(state, reasoning)
        self.coord.record_risk_assessment(
            portfolio_id=state["portfolio_id"],
            execution_id=state["execution_id"],
            protocol=protocol,
            risk_score=risk_score,
            risk_factors=risk_factors,
            safe=is_safe
        )

        # Update state
        state["risk_assessment"] = assessment
        state["next_agent"] = "orchestrator"

        # Write to coordination layer
        self.coord.write_state(state)

        return state