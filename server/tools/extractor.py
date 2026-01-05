import re
from typing import List

class ObligationExtractor:
    """
    Tier 1 Tool: Obligation Extraction Tool
    Parses definitions and extracts 'MUST/SHALL' obligations.
    """
    def extract(self, text: str) -> List[str]:
        print(f"[Tool:ObligationExtractor] Analyzing text for obligations...")
        obligations = []
        
        # Simple heuristic: find sentences with "must", "shall", "require"
        sentences = text.replace('!', '.').replace('?', '.').split('.')
        for s in sentences:
            s_lower = s.strip().lower()
            if any(keyword in s_lower for keyword in ["must", "shall", "required", "mandatory"]):
                print(f"   -> Found obligation: {s.strip()[:50]}...")
                obligations.append(s.strip())
                
        if not obligations:
            obligations.append("No explicit obligations found, but manual review recommended.")
            
        return obligations
