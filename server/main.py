from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List
import asyncio

# Import Agents and Services
from models import ComplianceFinding, Regulation, DashboardMetrics
from services.llm import LLMService
from services.rag_service import RAGService
from agents.scout import RegulatoryScout
from agents.analyst import GapAnalyst
from agents.sentinel import RiskSentinel
from agents.evidence import EvidenceOfficer

app = FastAPI(title="ComplianceOS Agentic API")

# Setup Services
llm_service = LLMService()
rag_service = RAGService()

# Initialize Agents
scout = RegulatoryScout(llm_service, rag_service)
analyst = GapAnalyst(llm_service, rag_service)
sentinel = RiskSentinel()
officer = EvidenceOfficer()

# Allow CORS for the frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"status": "active", "system": "ComplianceOS Agentic Platform"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.get("/api/dashboard", response_model=DashboardMetrics)
async def get_dashboard_metrics():
    """
    Get high-level dashboard metrics (Mock).
    """
    return DashboardMetrics(
        score=78,
        risks=12,
        policies_mapped=142,
        pending_reviews=5
    )

@app.post("/api/agents/scan")
async def trigger_regulatory_scan():
    """
    Trigger the Regulatory Scout to scan for new updates.
    """
    # 1. Scout scans
    await scout.scan_feed("https://europa.eu/ai-act/feed")
    
    # 2. Analyst checks for gaps (simulated interaction)
    policy_sample = "We retain user data for 5 years."
    gap_analysis = await analyst.analyze_policy(policy_sample)
    
    return {
        "scout_logs": scout.activity_log,
        "analyst_findings": gap_analysis
    }

@app.post("/api/agents/monitor")
async def trigger_monitoring_batch():
    """
    Trigger the Risk Sentinel to check a batch of transactions.
    """
    mock_stream = [
        {"id": 1, "amount": 500, "contains_pii": False},
        {"id": 2, "amount": 50000, "contains_pii": False}, # Anomaly
        {"id": 3, "amount": 200, "contains_pii": True},   # Anomaly
    ]
    alerts = await sentinel.monitor_stream(mock_stream)
    return {"alerts": alerts, "sentinel_logs": sentinel.activity_log}

@app.post("/api/agents/report")
async def generate_audit_report(findings: List[dict] = []):
    """
    Trigger the Evidence Officer to generate a PDF report.
    Accepts a list of findings. If empty, generates a 'Clean' certificate.
    """
    result = await officer.generate_package(findings)
    return result

@app.get("/api/agents/activity")
async def get_agent_activities():
    """
    Aggregate logs from all agents for the frontend Activity Log.
    """
    return {
        "Regulatory Scout": scout.activity_log,
        "Gap Analyst": analyst.activity_log,
        "Risk Sentinel": sentinel.activity_log,
        "Evidence Officer": officer.activity_log
    }
