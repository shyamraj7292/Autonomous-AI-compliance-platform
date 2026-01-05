from agents.base import Agent
from services.llm import LLMService
from services.rag_service import RAGService
from tools.search import RegulatorySearch
from tools.extractor import ObligationExtractor
from typing import Dict, Any

class RegulatoryScout(Agent):
    """
    Expert at discovering and parsing new regulations.
    """
    def __init__(self, llm: LLMService, rag: RAGService):
        # Inject Tools
        tools = [RegulatorySearch(), ObligationExtractor()]
        super().__init__(name="Scout", role="Regulatory Discovery", tools=tools)
        self.llm = llm
        self.rag = rag

    async def scan_feed(self, source_url: str):
        self.log_activity(f"Scanning regulatory feed: {source_url}")
        
        # USE TOOL: Regulatory Search
        search_tool = self.use_tool("RegulatorySearch")
        updates = search_tool.search("latest compliance updates")
        
        for update in updates:
            await self.process_regulation(update['summary'], update['title'])

    async def process_regulation(self, text: str, title: str):
        self.log_activity(f"Reading regulation: {title}")
        
        # USE TOOL: Obligation Extractor
        extractor_tool = self.use_tool("ObligationExtractor")
        obligations = extractor_tool.extract(text)
        self.log_activity(f"Extracted {len(obligations)} obligations.")
        
        # 1. Think: Interpret the text
        analysis = await self.think({"text": text, "obligations": obligations})
        
        # 2. Act: Index into RAG
        result = await self.act(analysis + f" | RAW: {text}")
        return result

    async def think(self, context: Dict[str, Any]) -> str:
        text = context.get("text", "")
        obligations = context.get("obligations", [])
        self.log_activity(f"Interpreting {len(obligations)} derived obligations...")
        return await self.llm.complete(f"Summarize obligations: {obligations}")

    async def act(self, plan: str) -> Dict[str, Any]:
        self.log_activity("Indexing knowledge into Vector DB...")
        await self.rag.add_document(plan, {"type": "regulation"})
        return {"status": "indexed", "summary": plan}
