from agents.base import Agent
from tools.monitor import LogMonitor
from tools.workflow import WorkflowAutomation
from typing import Dict, Any, List
import random

class RiskSentinel(Agent):
    """
    Real-time monitoring agent for data streams (Logs, Transactions).
    """
    def __init__(self):
        tools = [LogMonitor(), WorkflowAutomation()]
        super().__init__(name="Sentinel", role="Risk Monitoring", tools=tools)

    async def monitor_stream(self, data_stream: List[Dict]):
        self.log_activity(f"Monitoring {len(data_stream)} events...")
        
        # USE TOOL: Log Monitor
        monitor = self.use_tool("LogMonitor")
        anomalies = monitor.scan_for_anomalies(data_stream)
        
        risks = []
        for anomaly in anomalies:
            self.log_activity(f"Anomaly Detected: {anomaly.get('detected_pattern')}")
            # Workflow: If anomaly, trigger alert
            risk = await self.act(str(anomaly))
            risks.append(risk)
            
        return risks

    async def think(self, context: Dict[str, Any]) -> str:
        # Think logic integrated into monitor tool for now
        return "ANOMALY"

    async def act(self, plan: str) -> Dict[str, Any]:
        self.log_activity(f"ALERT TRIGGERED: {plan}")
        
        # USE TOOL: Workflow Automation
        workflow = self.use_tool("WorkflowAutomation")
        ticket = workflow.create_ticket("Security Incident", f"Anomaly detected in logs: {plan}")
        workflow.send_alert(f"Critical Risk! Jira Ticket: {ticket}")
        
        return {"alert": "Risk Detected", "ticket": ticket}
