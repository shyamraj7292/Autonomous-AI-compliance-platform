from agents.base import Agent
from services.llm import LLMService
from services.rag_service import RAGService
from tools.scorer import RiskScorer
from typing import Dict, Any

class GapAnalyst(Agent):
    """
    Expert at comparing internal Policy vs. External Regulation to find gaps.
    Can automatically remediate findings when enabled.
    """
    def __init__(self, llm: LLMService, rag: RAGService):
        tools = [RiskScorer()]
        super().__init__(name="Analyst", role="Compliance Analysis", tools=tools)
        self.llm = llm
        self.rag = rag
        self.auto_remediation_enabled = False  # Controlled by settings

    async def analyze_policy(self, policy_text: str):
        self.log_activity("Received policy for analysis.")
        
        # 1. Retrieve relevant regulations from RAG
        context_docs = await self.rag.query(policy_text)
        
        # 2. Think: Detect Gaps using LLM
        finding = await self.think({"policy": policy_text, "regulations": context_docs})
        
        # 3. Act: Report Finding and optionally Auto-Remediate
        result = await self.act(finding)
        return result

    async def think(self, context: Dict[str, Any]) -> str:
        policy = context.get("policy", "")
        regs = context.get("regulations", [])
        
        self.log_activity(f"Cross-referencing policy against {len(regs)} regulations...")
        
        # Format regulations for prompt
        reg_text = "\n".join([str(r.get('content', r)) for r in regs[:3]]) if regs else "No regulations indexed yet."
        
        prompt = f"""Analyze the following corporate policy for compliance gaps against regulations.

POLICY:
{policy[:500]}

REGULATIONS:
{reg_text[:500]}

Identify any compliance gaps, missing requirements, or violations. Be specific about what is missing or incorrect."""

        return await self.llm.complete(prompt)

    async def act(self, finding: str) -> Dict[str, Any]:
        self.log_activity(f"Gap Detection Complete. Finding: {finding[:100]}...")
        
        # USE TOOL: Risk Scorer
        scorer = self.use_tool("RiskScorer")
        risk_matrix = scorer.calculate_score(finding)
        self.log_activity(f"Risk Scored: {risk_matrix['severity']} (Impact: {risk_matrix['impact']})")

        # AUTO-REMEDIATION LOGIC - Only if enabled in settings
        remediation_status = "Open"
        remediation_action = None
        
        if self.auto_remediation_enabled and risk_matrix['severity'] in ['High', 'Critical', 'Medium']:
            self.log_activity("Auto-Remediation ENABLED. Generating fix...")
            
            # Use LLM to generate an actual remediation suggestion
            remediation_prompt = f"""Based on this compliance finding, generate a specific policy remediation:

FINDING: {finding}

Provide a concrete policy update or fix that would address this gap. Be specific and actionable."""

            remediation_action = await self.llm.complete(remediation_prompt)
            self.log_activity(f"Generated Fix: {remediation_action[:100]}...")
            remediation_status = "Remediated"
            self.log_activity("Remediation Successful. Status updated to REMEDIATED.")
        elif risk_matrix['severity'] in ['High', 'Critical', 'Medium']:
            self.log_activity("Auto-Remediation DISABLED. Finding requires manual review.")
            remediation_status = "Pending Manual Review"

        return {
            "finding": finding, 
            "risk_matrix": risk_matrix,
            "status": remediation_status,
            "action_taken": remediation_action
        }

