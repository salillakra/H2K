from abc import ABC, abstractmethod
from coordination_layer.state import AgentState
from coordination_layer.layer import CoordinationLayer

class BaseAgent(ABC):
    '''
    Base class for all agents.
    Every agent MUST read from and write to the coordination layer.
    '''

    def __init__(self, name: str, coord_layer: CoordinationLayer):
        self.name = name
        self.coord = coord_layer

    @abstractmethod
    async def execute(self, state: AgentState) -> AgentState:
        '''
        Core logic for this agent.
        Must:
        1. Read state from coordination layer
        2. Process/analyze
        3. Write results back to state
        4. Return updated state
        '''
        pass

    def log_reasoning(self, state: AgentState, reasoning: str):
        '''Helper to log reasoning to coordination layer'''
        self.coord.log_agent_reasoning(
            portfolio_id=state["portfolio_id"],
            execution_id=state["execution_id"],
            agent_name=self.name,
            step_number=state["iteration_count"],
            reasoning_text=reasoning
        )

        # Also add to state for in-memory tracking
        state["agent_reasoning"].append(f"{self.name}: {reasoning}")