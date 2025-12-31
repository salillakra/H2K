from agent_layer.base import BaseAgent
from coordination_layer.state import AgentState

class PredictionAgent(BaseAgent):
    '''
    Market Prediction Agent - forecasts APY stability.
    (Mock for now, would use LSTM/time-series later)
    '''

    def __init__(self, coord_layer):
        super().__init__("Prediction_Agent", coord_layer)

    async def execute(self, state: AgentState) -> AgentState:
        print(f"\nPREDICTION AGENT - Forecasting...")

        # Mock forecast (replace with real model later)
        forecast = {
            "trend": "stable",
            "volatility": "low",
            "confidence": 0.85,
            "outlook_7d": "APY expected to remain within 0.5% of current"
        }

        reasoning = f"Market outlook: {forecast['trend']}, volatility {forecast['volatility']}"
        print(f"Forecast: {reasoning}")

        self.log_reasoning(state, reasoning)

        state["prediction_forecast"] = forecast
        state["next_agent"] = "orchestrator"

        self.coord.write_state(state)

        return state