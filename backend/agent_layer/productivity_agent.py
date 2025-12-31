from agent_layer.base import BaseAgent
from coordination_layer.state import AgentState

class ProductivityAgent(BaseAgent):
    '''
    Productivity Agent - sends notifications and updates.
    '''

    def __init__(self, coord_layer):
        super().__init__("Productivity_Agent", coord_layer)

    async def execute(self, state: AgentState) -> AgentState:
        print(f"\nPRODUCTIVITY AGENT - Notifying user...")

        actions = []

        # Generate notification based on state
        if state.get("defi_proposal", {}).get("action") == "migrate":
            proposal = state["defi_proposal"]
            actions.append({
                "type": "email",
                "subject": f"Portfolio Update: Moving to {proposal['destination']}",
                "message": f"Your USDC will earn {proposal['new_apy']:.2%} APY"
            })

        actions.append({
            "type": "dashboard_update",
            "data": {
                "balances": state["balances"],
                "positions": state["positions"]
            }
        })

        print(f"Actions: {len(actions)} notifications sent")

        self.log_reasoning(state, f"Sent {len(actions)} notifications")

        state["productivity_actions"] = actions
        state["next_agent"] = "orchestrator"

        self.coord.write_state(state)

        return state