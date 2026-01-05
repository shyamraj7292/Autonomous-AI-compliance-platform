from typing import Dict

class RiskScorer:
    """
    Tier 1 Tool: Risk Scoring Engine
    Calculates severity of a finding based on Impact and Likelihood.
    """
    def calculate_score(self, finding_text: str) -> Dict[str, str]:
        print(f"[Tool:RiskScorer] Calculating risk matrix for finding...")
        
        impact = "Low"
        likelihood = "Low"
        score = "Low"
        
        text_lower = finding_text.lower()
        
        # Heuristic scoring
        if "data retention" in text_lower or "encryption" in text_lower:
            impact = "High"
        if "pii" in text_lower or "pan" in text_lower:
            impact = "Critical"
            
        if "missing" in text_lower:
            likelihood = "High"
            
        # Matrix Logic
        if impact == "Critical":
            score = "Critical"
        elif impact == "High" and likelihood == "High":
            score = "High"
        elif impact == "High":
            score = "Medium"
        else:
            score = "Low"
            
        return {
            "impact": impact,
            "likelihood": likelihood,
            "severity": score
        }
