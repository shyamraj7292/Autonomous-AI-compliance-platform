from agents.base import Agent
from tools.pdf_gen import PDFGenerator
from typing import Dict, Any

class EvidenceOfficer(Agent):
    """
    Agent capable of generating audit packages and reports.
    """
    def __init__(self):
        tools = [PDFGenerator()]
        super().__init__(name="Officer", role="Audit & Reporting", tools=tools)

    async def generate_package(self, findings: list, client_name: str = "Unknown Client", compliance_score: int = None):
        self.set_current_client(client_name)
        self.log_activity(f"Compiling evidence package for {client_name}...")
        report_data = await self.think({"findings": findings, "client": client_name, "score": compliance_score})
        return await self.act(report_data, findings, client_name, compliance_score)

    async def think(self, context: Dict[str, Any]) -> str:
        count = len(context.get("findings", []))
        client = context.get("client", "Unknown")
        score = context.get("score", 0)
        status = "COMPLIANT" if count == 0 and score >= 90 else "GAPS DETECTED"
        return f"Audit Report for {client}. Score: {score}%. Findings: {count}. Status: {status}."

    async def act(self, plan: str, findings: list = None, client_name: str = "Unknown", compliance_score: int = None) -> Dict[str, Any]:
        self.log_activity(f"Finalizing PDF Report for {client_name} (Score: {compliance_score}%)...")
        
        # USE TOOL: PDF Generator
        gen = self.use_tool("PDFGenerator")
        filename = gen.generate_report(findings or [], client_name, compliance_score=compliance_score)
        
        self.log_activity(f"Report saved: {filename}")
        
        return {
            "report_url": f"/api/reports/download/{filename}",
            "filename": filename,
            "client": client_name,
            "compliance_score": compliance_score,
            "summary": plan
        }
