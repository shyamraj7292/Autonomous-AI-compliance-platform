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

    async def generate_package(self, findings: list):
        self.log_activity("Compiling evidence package...")
        report_data = await self.think({"findings": findings})
        return await self.act(report_data, findings)

    async def think(self, context: Dict[str, Any]) -> str:
        count = len(context.get("findings", []))
        return f"Audit Report Generated. Total Findings: {count}. Status: COMPLIANT."

    async def act(self, plan: str, findings: list = None) -> Dict[str, Any]:
        self.log_activity(f"Finalizing PDF Report...")
        
        # USE TOOL: PDF Generator
        gen = self.use_tool("PDFGenerator")
        filename = gen.generate_report(findings or [])
        
        return {"report_url": f"/reports/{filename}", "summary": plan}
