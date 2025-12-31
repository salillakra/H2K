from langgraph.graph import StateGraph, START, END
from coordination_layer.state import AgentState
from coordination_layer.layer import CoordinationLayer
from agent_layer.orchestrator import OrchestratorAgent
from agent_layer.defi_agent import DeFiAgent
from agent_layer.risk_agent import RiskAgent
from agent_layer.prediction_agent import PredictionAgent
from agent_layer.productivity_agent import ProductivityAgent
from agent_layer.qa_agent import QAAgent

def build_workflow(coord_layer: CoordinationLayer):
    '''Build the LangGraph workflow with all agents'''

    # Initialize agents
    orchestrator = OrchestratorAgent(coord_layer)
    defi_agent = DeFiAgent(coord_layer)
    risk_agent = RiskAgent(coord_layer)
    prediction_agent = PredictionAgent(coord_layer)
    productivity_agent = ProductivityAgent(coord_layer)
    qa_agent = QAAgent(coord_layer)

    # Create graph
    workflow = StateGraph(AgentState)

    # Add nodes
    workflow.add_node("orchestrator", orchestrator.execute)
    workflow.add_node("defi_agent", defi_agent.execute)
    workflow.add_node("risk_agent", risk_agent.execute)
    workflow.add_node("prediction_agent", prediction_agent.execute)
    workflow.add_node("productivity_agent", productivity_agent.execute)
    workflow.add_node("qa_agent", qa_agent.execute)

    # Add edges
    workflow.add_edge(START, "orchestrator")

    # Conditional routing from orchestrator
    workflow.add_conditional_edges(
        "orchestrator",
        lambda state: state["next_agent"],
        {
            "defi_agent": "defi_agent",
            "risk_agent": "risk_agent",
            "prediction_agent": "prediction_agent",
            "productivity_agent": "productivity_agent",
            "qa_agent": "qa_agent",
            "EXECUTE_TRADE": "orchestrator",  # Route back to orchestrator after execution
            "END": END
        }
    )

    # All workers return to orchestrator
    workflow.add_edge("defi_agent", "orchestrator")
    workflow.add_edge("risk_agent", "orchestrator")
    workflow.add_edge("prediction_agent", "orchestrator")
    workflow.add_edge("productivity_agent", "orchestrator")
    workflow.add_edge("qa_agent", "orchestrator")

    return workflow.compile()