import numpy as np

class RiskModel:
    '''
    Mock EBM Risk Model
    In production, this would be interpret.glassbox.ExplainableBoostingClassifier
    '''

    def __init__(self):
        # Mock protocol risk database
        self.protocol_risk_db = {
            "Aave": {"age": 4.0, "tvl": 8000000000, "audits": 5, "hacks": 0},
            "Curve": {"age": 3.5, "tvl": 3000000000, "audits": 4, "hacks": 0},
            "Uniswap": {"age": 5.0, "tvl": 5000000000, "audits": 5, "hacks": 0},
            "Yearn": {"age": 3.0, "tvl": 500000000, "audits": 3, "hacks": 1}
        }

    def assess_protocol(self, protocol: str):
        '''
        Mock EBM assessment
        Returns: (risk_score, feature_contributions)
        '''
        data = self.protocol_risk_db.get(protocol)

        if not data:
            return 9.0, {"reason": "Unknown protocol"}

        # Simple risk calculation (mock EBM logic)
        age_factor = max(0, 1.0 - (data['age'] / 5.0))  # Newer = riskier
        tvl_factor = max(0, 1.0 - (data['tvl'] / 10000000000))  # Lower TVL = riskier
        audit_factor = max(0, 1.0 - (data['audits'] / 5.0))
        hack_factor = data['hacks'] * 2.0

        risk_score = (
            age_factor * 2.0 +
            tvl_factor * 3.0 +
            audit_factor * 2.0 +
            hack_factor * 3.0
        )

        # Feature contributions (what EBM would show)
        factors = {
            "protocol_age_impact": -age_factor,  # Negative = reduces risk
            "tvl_impact": -tvl_factor * 0.5,
            "audit_impact": -audit_factor * 0.8,
            "hack_history_impact": hack_factor
        }

        return min(risk_score, 10.0), factors