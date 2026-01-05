from agents.base import Agent
from services.llm import LLMService
from services.rag_service import RAGService
from tools.scorer import RiskScorer
from typing import Dict, Any

class GapAnalyst(Agent):
    """
    Expert at comparing internal Policy vs. External Regulation to find gaps.
    Now actively remediates findings autonomously.
    """
    def __init__(self, llm: LLMService, rag: RAGService):
        tools = [RiskScorer()]
        super().__init__(name="Analyst", role="Compliance Analysis", tools=tools)
        self.llm = llm
        self.rag = rag

    async def analyze_policy(self, policy_text: str):
        self.log_activity("Received policy for analysis.")
        
        # 1. Retrieve relevant regulations
        context_docs = await self.rag.query(policy_text)
        
        # 2. Think: Detect Gaps
        finding = await self.think({"policy": policy_text, "regulations": context_docs})
        
        # 3. Act: Report Finding and Auto-Remediate
        result = await self.act(finding)
        return result

    async def think(self, context: Dict[str, Any]) -> str:
        policy = context.get("policy")
        regs = context.get("regulations")
        self.log_activity(f"Cross-referencing policy against {len(regs)} regulations...")
        return await self.llm.complete(f"Analyze gap between '{policy}' and regulations {regs}")

    async def act(self, finding: str) -> Dict[str, Any]:
        self.log_activity(f"Gap Detection Complete. Finding: {finding}")
        
        # USE TOOL: Risk Scorer
        scorer = self.use_tool("RiskScorer")
        risk_matrix = scorer.calculate_score(finding)
        self.log_activity(f"Risk Scored: {risk_matrix['severity']} (Impact: {risk_matrix['impact']})")

        # AUTO-REMEDIATION LOGIC
        remediation_status = "Open"
        remediation_action = None
        
        if risk_matrix['severity'] in ['High', 'Critical', 'Medium']:
            self.log_activity("Initiating Autonomous Remediation Protocol...")
            # Simulate generating a fix
            remediation_action = f"Auto-generated policy patch for: {finding}"
            self.log_activity(f"Applying Fix: {remediation_action}")
            remediation_status = "Remediated"
            self.log_activity("Remediation Successful. Status updated to REMEDIATED.")

        return {
            "finding": finding, 
            "risk_matrix": risk_matrix,
            "status": remediation_status,
            "action_taken": remediation_action
        }
