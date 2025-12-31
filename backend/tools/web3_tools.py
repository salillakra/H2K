# tools/web3_tools.py
import os
from web3 import Web3
from eth_account import Account
from eth_account.messages import encode_defunct
from dotenv import load_dotenv

load_dotenv()

# Connect to Blockchain
RPC_URL = os.getenv("RPC_URL", "https://sepolia.base.org")
w3 = Web3(Web3.HTTPProvider(RPC_URL))

# Setup Wallets
PRIVATE_KEY = os.getenv("PRIVATE_KEY")  # Main execution wallet
ORCHESTRATOR_KEY = os.getenv("ORCHESTRATOR_KEY")
DEFI_AGENT_KEY = os.getenv("DEFI_AGENT_KEY")
RISK_AGENT_KEY = os.getenv("RISK_AGENT_KEY")
PREDICTION_AGENT_KEY = os.getenv("PREDICTION_AGENT_KEY")
QA_AGENT_KEY = os.getenv("QA_AGENT_KEY")

MY_ADDRESS = None
if PRIVATE_KEY and PRIVATE_KEY.strip():
    try:
        MY_ADDRESS = w3.eth.account.from_key(PRIVATE_KEY).address
        print(f"✅ Execution wallet connected: {MY_ADDRESS}")
    except Exception as e:
        print(f"❌ Invalid execution private key: {e}")
        PRIVATE_KEY = None
else:
    print("⚠️  PRIVATE_KEY not set - execution disabled")

# Agent addresses for verification
AGENT_KEYS = {
    "orchestrator": ORCHESTRATOR_KEY,
    "defi_agent": DEFI_AGENT_KEY,
    "risk_agent": RISK_AGENT_KEY,
    "prediction_agent": PREDICTION_AGENT_KEY,
    "qa_agent": QA_AGENT_KEY
}

# Get agent addresses
def get_agent_address(agent_name: str):
    key = AGENT_KEYS.get(agent_name.lower())
    if key:
        try:
            return Account.from_key(key).address
        except:
            return None
    return None

def sign_intent(agent_name: str, intent_data: str):
    """
    Agents sign their intents instead of executing directly.
    This creates cryptographic proof of their decisions.
    """
    agent_key = AGENT_KEYS.get(agent_name.lower())
    if not agent_key:
        return {"error": f"No key found for agent {agent_name}"}

    try:
        # Create the message
        msg = encode_defunct(text=intent_data)

        # Sign it
        signed_msg = Account.sign_message(msg, private_key=agent_key)

        return {
            "agent": agent_name,
            "signature": signed_msg.signature.hex(),
            "intent": intent_data,
            "signer_address": Account.from_key(agent_key).address
        }
    except Exception as e:
        return {"error": f"Signing failed: {str(e)}"}

def verify_signature(signature: str, intent_data: str, expected_address: str):
    """
    Verify that a signature matches the intent and comes from the expected agent.
    """
    try:
        msg = encode_defunct(text=intent_data)
        recovered_address = Account.recover_message(msg, signature=signature)

        return recovered_address.lower() == expected_address.lower()
    except Exception as e:
        print(f"Signature verification failed: {e}")
        return False

def collect_signatures(state):
    """
    Collect all required signatures for execution.
    Requires signatures from DeFi Agent and Risk Agent.
    """
    signatures = []

    # Check for DeFi Agent signature
    defi_proposal = state.get("defi_proposal", {})
    if defi_proposal.get("signature"):
        defi_address = get_agent_address("defi_agent")
        if defi_address and verify_signature(
            defi_proposal["signature"],
            defi_proposal.get("intent", ""),
            defi_address
        ):
            signatures.append("defi_agent")

    # Check for Risk Agent signature
    risk_assessment = state.get("risk_assessment", {})
    if risk_assessment.get("signature"):
        risk_address = get_agent_address("risk_agent")
        if risk_address and verify_signature(
            risk_assessment["signature"],
            risk_assessment.get("intent", ""),
            risk_address
        ):
            signatures.append("risk_agent")

    return signatures

def can_execute_trade(state):
    """
    Check if we have enough signatures to execute a trade.
    Requires at least DeFi Agent and Risk Agent signatures.
    """
    required_signatures = ["defi_agent", "risk_agent"]
    collected_signatures = collect_signatures(state)

    return all(sig in collected_signatures for sig in required_signatures)

# Base Sepolia Testnet Contract Addresses
CONTRACTS = {
    "aave_pool": "0x6Ae43d3271ff6888e7Fc43Fd7321EF205df9809d",  # Aave Pool V3 Sepolia
    "usdc": "0x036CbD53842c5426634e7929541eC2318f3dCF7",  # USDC on Base Sepolia
    "weth": "0x4200000000000000000000000000000000000006",  # WETH on Base
}

# ERC20 ABI for token interactions
ERC20_ABI = [
    {"constant": True, "inputs": [{"name": "_owner", "type": "address"}], "name": "balanceOf", "outputs": [{"name": "balance", "type": "uint256"}], "type": "function"},
    {"constant": False, "inputs": [{"name": "_spender", "type": "address"}, {"name": "_value", "type": "uint256"}], "name": "approve", "outputs": [{"name": "", "type": "bool"}], "type": "function"},
    {"constant": True, "inputs": [], "name": "decimals", "outputs": [{"name": "", "type": "uint8"}], "type": "function"}
]

# Simple Transfer Function (Agent calls this)
def execute_transaction(protocol: str, action: str, amount: float, token: str = "ETH", recipient: str = None):
    """
    Real on-chain execution wrapper.
    For hackathon, we can swap USDC/ETH on a testnet DEX or just send self-transfers to simulate.
    """
    print(f"🔗 EXECUTING ON-CHAIN: {protocol} {action} {amount} {token}...")

    if not PRIVATE_KEY:
        print("⚠️  No private key - simulating transaction")
        return {
            "status": "simulated",
            "hash": f"simulated_{protocol}_{action}_{amount}_{token}",
            "block": 999999,
            "protocol": protocol,
            "action": action,
            "amount": amount,
            "token": token,
            "note": "Transaction simulated - no private key configured"
        }
    
    try:
        if protocol.lower() == "aave":
            return _execute_aave_transaction(action, amount, token)
        elif protocol.lower() == "uniswap":
            return _execute_uniswap_transaction(action, amount, token)
        elif protocol.lower() == "curve":
            return _execute_curve_transaction(action, amount, token)
        elif protocol.lower() == "yearn":
            return _execute_yearn_transaction(action, amount, token)
        else:
            # Default to wallet transfer
            return _execute_transfer(amount, token, recipient or MY_ADDRESS)

    except Exception as e:
        print(f"❌ Transaction Failed: {e}")
        return {"status": "failed", "error": str(e)}

def _execute_transfer(amount: float, token: str, recipient: str):
    """Execute a simple token transfer"""
    try:
        if token.upper() == "ETH":
            # ETH transfer - ensure amount is reasonable for testnet
            eth_amount = min(amount, 0.01)  # Max 0.01 ETH for testing
            tx = {
                'nonce': w3.eth.get_transaction_count(MY_ADDRESS),
                'to': recipient,
                'value': w3.to_wei(eth_amount, 'ether'),
                'gas': 21000,
                'gasPrice': w3.eth.gas_price,
                'chainId': 84532
            }
        else:
            # For ERC20 tokens like USDC, we'd need approval and transfer
            # For demo, convert USDC amount to equivalent ETH value (rough approximation)
            eth_equivalent = min(amount / 2000, 0.01)  # Assume 1 USDC = ~0.0005 ETH, max 0.01 ETH
            tx = {
                'nonce': w3.eth.get_transaction_count(MY_ADDRESS),
                'to': recipient,
                'value': w3.to_wei(eth_equivalent, 'ether'),
                'gas': 21000,
                'gasPrice': w3.eth.gas_price,
                'chainId': 84532
            }

        signed_tx = w3.eth.account.sign_transaction(tx, PRIVATE_KEY)
        tx_hash = w3.eth.send_raw_transaction(signed_tx.raw_transaction)
        receipt = w3.eth.wait_for_transaction_receipt(tx_hash)

        print(f"✅ Transfer successful! Hash: {receipt.transactionHash.hex()}")
        return {
            "status": "success",
            "hash": receipt.transactionHash.hex(),
            "block": receipt.blockNumber,
            "protocol": "wallet",
            "action": "transfer",
            "amount": amount,
            "token": token
        }

    except Exception as e:
        print(f"❌ Transfer failed: {e}")
        return {"status": "failed", "error": str(e)}

def _execute_aave_transaction(action: str, amount: float, token: str):
    """Execute Aave protocol transaction (deposit/withdraw)"""
    try:
        # For Aave, we'll interact with the actual pool contract
        # This is a simplified version - in production would need full Aave ABI
        pool_address = CONTRACTS["aave_pool"]
        
        if action.lower() == "deposit":
            # Deposit to Aave (supply assets) - use reasonable amount
            eth_amount = min(amount if token == "ETH" else amount / 2000, 0.005)  # Max 0.005 ETH
            tx = {
                'nonce': w3.eth.get_transaction_count(MY_ADDRESS),
                'to': pool_address,
                'value': w3.to_wei(eth_amount, 'ether'),
                'gas': 300000,
                'gasPrice': w3.eth.gas_price,
                'chainId': 84532
            }
        elif action.lower() == "withdraw":
            # Withdraw from Aave
            tx = {
                'nonce': w3.eth.get_transaction_count(MY_ADDRESS),
                'to': pool_address,
                'value': 0,
                'gas': 300000,
                'gasPrice': w3.eth.gas_price,
                'chainId': 84532
            }
        else:
            # Default action
            eth_amount = min(amount if token == "ETH" else amount / 2000, 0.005)
            tx = {
                'nonce': w3.eth.get_transaction_count(MY_ADDRESS),
                'to': pool_address,
                'value': w3.to_wei(eth_amount, 'ether'),
                'gas': 300000,
                'gasPrice': w3.eth.gas_price,
                'chainId': 84532
            }

        signed_tx = w3.eth.account.sign_transaction(tx, PRIVATE_KEY)
        tx_hash = w3.eth.send_raw_transaction(signed_tx.raw_transaction)
        receipt = w3.eth.wait_for_transaction_receipt(tx_hash)

        print(f"✅ Aave {action} successful! Hash: {receipt.transactionHash.hex()}")
        return {
            "status": "success",
            "hash": receipt.transactionHash.hex(),
            "block": receipt.blockNumber,
            "protocol": "aave",
            "action": action,
            "amount": amount,
            "token": token
        }

    except Exception as e:
        print(f"❌ Aave transaction failed: {e}")
        return {"status": "failed", "error": str(e)}

def _execute_uniswap_transaction(action: str, amount: float, token: str):
    """Execute Uniswap protocol transaction (swap)"""
    try:
        # For Uniswap, we'd interact with the router contract
        # For demo, we'll simulate with a transfer
        router_address = "0x2626664c2603336E57B271c5C0b26F421741e481"  # Uniswap V3 Router on Base Sepolia
        eth_amount = min(amount if token == "ETH" else amount / 2000, 0.005)
        
        tx = {
            'nonce': w3.eth.get_transaction_count(MY_ADDRESS),
            'to': router_address,
            'value': w3.to_wei(eth_amount, 'ether'),
            'gas': 400000,  # Higher gas for DEX swap
            'gasPrice': w3.eth.gas_price,
            'chainId': 84532
        }

        signed_tx = w3.eth.account.sign_transaction(tx, PRIVATE_KEY)
        tx_hash = w3.eth.send_raw_transaction(signed_tx.raw_transaction)
        receipt = w3.eth.wait_for_transaction_receipt(tx_hash)

        print(f"✅ Uniswap {action} successful! Hash: {receipt.transactionHash.hex()}")
        return {
            "status": "success",
            "hash": receipt.transactionHash.hex(),
            "block": receipt.blockNumber,
            "protocol": "uniswap",
            "action": action,
            "amount": amount,
            "token": token
        }

    except Exception as e:
        print(f"❌ Uniswap transaction failed: {e}")
        return {"status": "failed", "error": str(e)}

def _execute_curve_transaction(action: str, amount: float, token: str):
    """Execute Curve protocol transaction"""
    try:
        # Curve pool address on Base Sepolia (placeholder)
        curve_pool = "0x6Ae43d3271ff6888e7Fc43Fd7321EF205df9809d"  # Using Aave address as placeholder
        
        tx = {
            'nonce': w3.eth.get_transaction_count(MY_ADDRESS),
            'to': curve_pool,
            'value': w3.to_wei(amount, 'ether'),
            'gas': 350000,
            'gasPrice': w3.eth.gas_price,
            'chainId': 84532
        }

        signed_tx = w3.eth.account.sign_transaction(tx, PRIVATE_KEY)
        tx_hash = w3.eth.send_raw_transaction(signed_tx.raw_transaction)
        receipt = w3.eth.wait_for_transaction_receipt(tx_hash)

        print(f"✅ Curve {action} successful! Hash: {receipt.transactionHash.hex()}")
        return {
            "status": "success",
            "hash": receipt.transactionHash.hex(),
            "block": receipt.blockNumber,
            "protocol": "curve",
            "action": action,
            "amount": amount,
            "token": token
        }

    except Exception as e:
        print(f"❌ Curve transaction failed: {e}")
        return {"status": "failed", "error": str(e)}

def _execute_yearn_transaction(action: str, amount: float, token: str):
    """Execute Yearn protocol transaction"""
    try:
        # Yearn vault address on Base Sepolia (placeholder)
        yearn_vault = "0x6Ae43d3271ff6888e7Fc43Fd7321EF205df9809d"  # Using Aave address as placeholder
        
        tx = {
            'nonce': w3.eth.get_transaction_count(MY_ADDRESS),
            'to': yearn_vault,
            'value': w3.to_wei(amount, 'ether'),
            'gas': 300000,
            'gasPrice': w3.eth.gas_price,
            'chainId': 84532
        }

        signed_tx = w3.eth.account.sign_transaction(tx, PRIVATE_KEY)
        tx_hash = w3.eth.send_raw_transaction(signed_tx.raw_transaction)
        receipt = w3.eth.wait_for_transaction_receipt(tx_hash)

        print(f"✅ Yearn {action} successful! Hash: {receipt.transactionHash.hex()}")
        return {
            "status": "success",
            "hash": receipt.transactionHash.hex(),
            "block": receipt.blockNumber,
            "protocol": "yearn",
            "action": action,
            "amount": amount,
            "token": token
        }

    except Exception as e:
        print(f"❌ Yearn transaction failed: {e}")
        return {"status": "failed", "error": str(e)}

