import random
from typing import List, Dict, Any

class LLMService:
    """
    A pervasive service layer to handle all interactions with the LLM (e.g., GPT-4, Gemini).
    For this implementation, it mocks the reasoning to allow the platform to function without Keys.
    """
    def __init__(self):
        pass

    async def complete(self, prompt: str, context: str = "") -> str:
        """
        Simulates an LLM completion based on the prompt type.
        """
        # Simulated "Reasoning" delays could be added here if needed
        
        if "analyze" in prompt.lower() and "policy" in prompt.lower():
            return "Based on the provided regulation (GDPR Art. 30), the policy is missing a clear data retention schedule. RISK: HIGH."
        
        if "summarize" in prompt.lower():
            return "The document outlines strict requirements for cardholder data encryption and access control (PCI-DSS 4.0)."
            
        return "I have processed the request and found no immediate anomalies."

    async def extract_structured(self, text: str, schema: dict) -> Dict[str, Any]:
        """
        Simulates extracting structured data (JSON) from text.
        """
        return {
            "summary": "Regulation extracted.",
            "obligations": ["Encrypt data", "Restrict access"],
            "risk_score": random.randint(1, 100)
        }
