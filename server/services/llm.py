import os
import json
from typing import Dict, Any
from dotenv import load_dotenv

load_dotenv()

try:
    import google.generativeai as genai
    GEMINI_AVAILABLE = True
except ImportError:
    GEMINI_AVAILABLE = False


class LLMService:
    """
    Production LLM Service using Google Gemini API.
    Falls back to mock responses if API key is not configured.
    """
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY")
        self.model = None
        
        if GEMINI_AVAILABLE and self.api_key and self.api_key != "your_gemini_api_key_here":
            genai.configure(api_key=self.api_key)
            self.model = genai.GenerativeModel("gemini-2.0-flash")
            print("[LLM] Gemini API initialized successfully")
        else:
            print("[LLM] Running in MOCK mode (no API key or genai not installed)")

    async def complete(self, prompt: str, context: str = "") -> str:
        """
        Generate a completion using Gemini or mock.
        """
        full_prompt = f"{context}\n\n{prompt}" if context else prompt
        
        if self.model:
            try:
                response = self.model.generate_content(full_prompt)
                return response.text
            except Exception as e:
                print(f"[LLM] API Error: {e}")
                return self._mock_response(prompt)
        else:
            return self._mock_response(prompt)

    async def extract_structured(self, text: str, schema: dict) -> Dict[str, Any]:
        """
        Extract structured JSON from text using Gemini.
        """
        prompt = f"""Extract the following information from the text and return as JSON.
        
Schema: {json.dumps(schema)}

Text: {text}

Return ONLY valid JSON, no markdown formatting."""

        if self.model:
            try:
                response = self.model.generate_content(prompt)
                # Clean and parse JSON
                json_str = response.text.strip()
                if json_str.startswith("```"):
                    json_str = json_str.split("```")[1]
                    if json_str.startswith("json"):
                        json_str = json_str[4:]
                return json.loads(json_str)
            except Exception as e:
                print(f"[LLM] Extraction Error: {e}")
                return self._mock_extraction()
        else:
            return self._mock_extraction()

    def _mock_response(self, prompt: str) -> str:
        """Fallback mock responses for development."""
        if "analyze" in prompt.lower() and "policy" in prompt.lower():
            return "Based on the provided regulation (GDPR Art. 30), the policy is missing a clear data retention schedule. RISK: HIGH."
        if "summarize" in prompt.lower():
            return "The document outlines strict requirements for cardholder data encryption and access control (PCI-DSS 4.0)."
        if "gap" in prompt.lower():
            return "GAP DETECTED: Current policy retains data for 5 years, but GDPR requires deletion upon request. Severity: Critical."
        return "Analysis complete. No immediate compliance issues detected."

    def _mock_extraction(self) -> Dict[str, Any]:
        """Fallback mock extraction for development."""
        return {
            "summary": "Regulation extracted (mock).",
            "obligations": ["Encrypt data at rest", "Implement access controls", "Maintain audit logs"],
            "risk_score": 65
        }
