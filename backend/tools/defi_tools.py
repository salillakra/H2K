def get_protocol_apy(protocol: str) -> float:
    '''Mock APY fetcher'''
    apys = {
        "Aave": 0.05,
        "Curve": 0.08,
        "Uniswap": 0.03,
        "Yearn": 0.12
    }
    return apys.get(protocol, 0.0)

def get_all_opportunities():
    '''Get all available yield opportunities'''
    return [
        {"protocol": "Aave", "apy": 0.05, "tvl": 8e9},
        {"protocol": "Curve", "apy": 0.08, "tvl": 3e9},
        {"protocol": "Yearn", "apy": 0.12, "tvl": 5e8}
    ]

def get_gas_price():
    '''Mock gas price'''
    return 50