import re
from typing import List, Dict

class LogMonitor:
    """
    Tier 1 Tool: Log / Data Monitoring Tool
    Streams real-time data for PII/PCI violations (Regex based).
    """
    def scan_for_anomalies(self, logs: List[Dict]) -> List[Dict]:
        print(f"[Tool:LogMonitor] Scanning {len(logs)} events for PII/PCI patterns...")
        anomalies = []
        
        # Regex for generic Credit Card (approximate 13-19 digits)
        cc_pattern = re.compile(r'\b(?:\d[ -]*?){13,16}\b')
        # Regex for Email
        email_pattern = re.compile(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b')
        
        for log in logs:
            payload = str(log.get("payload", "")) or str(log)
            if cc_pattern.search(payload):
                log['detected_pattern'] = "Potential Credit Card Number (PCI Violation)"
                anomalies.append(log)
            elif email_pattern.search(payload) and log.get("sensitive", False) is True:
                 log['detected_pattern'] = "Email leak in restricted stream (PII Violation)"
                 anomalies.append(log)
                 
        return anomalies
