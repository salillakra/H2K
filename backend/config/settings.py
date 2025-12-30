import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    
    GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
    DEFAULT_WALLET = os.getenv("WALLET_ADDRESS", "0xYourDefaultWalletAddress")
    SUPABASE_URL = os.getenv("SUPABASE_URL")
    SUPABASE_KEY = os.getenv("SUPABASE_KEY")
   
    MAX_ITERATIONS = 10
    ORCHESTRATOR_MODEL = "gemini-2.5-flash"

   
    RISK_THRESHOLD = 3.0  
    MIN_APY_DIFF = 0.02   

settings = Settings()