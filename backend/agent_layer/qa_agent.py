from agent_layer.base import BaseAgent
from coordination_layer.state import AgentState

class QAAgent(BaseAgent):
    '''
    Quality Assurance Agent - validates final state.
    '''

    def __init__(self, coord_layer):
        super().__init__("QA_Agent", coord_layer)

    async def execute(self, state: AgentState) -> AgentState:
        print(f"\n✅ QA AGENT - Final validation...")

        checks = {
            "has_proposal": state.get("defi_proposal") is not None,
            "risk_assessed": state.get("risk_assessment") is not None,
            "no_errors": len(state["error_messages"]) == 0,
            "reasoning_complete": len(state["agent_reasoning"]) > 0
        }

        all_passed = all(checks.values())

        print(f"Validation: {'PASSED ✅' if all_passed else 'FAILED ❌'}")
        print(f"Checks: {checks}")

        self.log_reasoning(
            state,
            f"QA validation {'passed' if all_passed else 'failed'}"
        )

        state["qa_results"] = checks
        state["next_agent"] = "END"

        self.coord.write_state(state)

        return state