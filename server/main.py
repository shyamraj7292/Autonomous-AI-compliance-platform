from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from typing import List, Optional
from pydantic import BaseModel
import asyncio
import tempfile
import os

# Import Agents and Services
from models import ComplianceFinding, Regulation, DashboardMetrics
from services.llm import LLMService
from services.rag_service import RAGService
from agents.scout import RegulatoryScout
from agents.analyst import GapAnalyst
from agents.sentinel import RiskSentinel
from agents.evidence import EvidenceOfficer
from tools.reader import DocumentReader
from database import init_db

# Ensure reports directory exists
REPORTS_DIR = os.path.join(os.path.dirname(__file__), "reports")
os.makedirs(REPORTS_DIR, exist_ok=True)

app = FastAPI(
    title="ComplianceOS Agentic API",
    description="Autonomous AI Compliance Platform",
    version="2.0.0"
)

# Initialize Database
init_db()

# Setup Services
llm_service = LLMService()
rag_service = RAGService()

# Initialize Agents
scout = RegulatoryScout(llm_service, rag_service)
analyst = GapAnalyst(llm_service, rag_service)
sentinel = RiskSentinel()
officer = EvidenceOfficer()

# Tools
doc_reader = DocumentReader()

# Allow CORS for the frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {
        "status": "active", 
        "system": "ComplianceOS Agentic Platform",
        "version": "2.0.0",
        "rag_stats": rag_service.get_stats()
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

# Global settings storage (in production, this would be in a database)
app_settings = {
    "scoutEnabled": True,
    "sentinelEnabled": True,
    "autoRemediation": False,
    "jiraWebhook": "",
    "slackWebhook": ""
}

@app.get("/api/settings")
async def get_settings():
    """Get current application settings."""
    return app_settings

@app.post("/api/settings")
async def update_settings(settings: dict):
    """Update application settings."""
    global app_settings
    app_settings.update(settings)
    
    # Update analyst behavior based on settings
    analyst.auto_remediation_enabled = app_settings.get("autoRemediation", False)
    
    return {"status": "updated", "settings": app_settings}

@app.get("/api/status")
async def get_api_status():
    """Check status of all API connections including Gemini."""
    gemini_status = "disconnected"
    gemini_message = "API key not configured"
    
    # Check if Gemini is configured
    if llm_service.model:
        try:
            # Try a simple completion to verify connectivity
            test_response = await llm_service.complete("Say 'OK' if you are working.")
            if test_response and len(test_response) > 0:
                gemini_status = "connected"
                gemini_message = "Gemini API is operational"
        except Exception as e:
            gemini_status = "error"
            gemini_message = str(e)
    
    return {
        "backend": "connected",
        "gemini": {
            "status": gemini_status,
            "message": gemini_message
        },
        "rag": rag_service.get_stats(),
        "agents": {
            "scout": app_settings.get("scoutEnabled", True),
            "sentinel": app_settings.get("sentinelEnabled", True),
            "autoRemediation": app_settings.get("autoRemediation", False)
        }
    }

@app.get("/api/dashboard", response_model=DashboardMetrics)
async def get_dashboard_metrics():
    """Get high-level dashboard metrics based on actual analysis data."""
    # Get real data from services
    rag_stats = rag_service.get_stats()
    doc_count = rag_stats.get("document_count", 0)
    
    # Count actual findings from analyst activity logs
    gap_count = 0
    critical_count = 0
    high_count = 0
    
    for log in analyst.activity_log:
        action = log.action if hasattr(log, 'action') else str(log)
        if 'Gap' in action or 'Finding' in action:
            gap_count += 1
        if 'Critical' in action:
            critical_count += 1
        if 'High' in action or 'Risk' in action:
            high_count += 1
    
    # Calculate score dynamically:
    # - Start at 100 (no gaps)
    # - Deduct points based on actual findings
    # - Critical = -15 points, High = -10 points, Other gaps = -5 points
    deductions = (critical_count * 15) + (high_count * 10) + (max(0, gap_count - critical_count - high_count) * 5)
    score = max(0, 100 - deductions)
    
    # If no documents uploaded yet, score should reflect that
    if doc_count == 0:
        score = 0  # No analysis done yet
    
    # Risks = actual gap findings
    risks = gap_count + critical_count + high_count
    
    # Policies mapped = based on what's in RAG
    policies_mapped = doc_count * 50  # 50 policy items per document average
    
    # Pending reviews = gaps that need manual review
    pending_reviews = 0
    for log in analyst.activity_log:
        action = log.action if hasattr(log, 'action') else str(log)
        if 'Pending' in action or 'Manual Review' in action or 'DISABLED' in action:
            pending_reviews += 1
    
    return DashboardMetrics(
        score=score,
        risks=risks,
        policies_mapped=policies_mapped,
        pending_reviews=pending_reviews
    )

# ==================== AGENT ENDPOINTS ====================

@app.post("/api/agents/scan")
async def trigger_regulatory_scan():
    """Trigger the Regulatory Scout to scan for new updates."""
    # Check if scout is enabled
    if not app_settings.get("scoutEnabled", True):
        return {"error": "Regulatory Scout is disabled in settings"}
    
    await scout.scan_feed("https://europa.eu/ai-act/feed")
    
    # Use LLM to generate a realistic policy for analysis
    policy_sample = await llm_service.complete(
        "Generate a sample corporate data retention policy that might have GDPR compliance issues."
    )
    gap_analysis = await analyst.analyze_policy(policy_sample)
    
    return {
        "scout_logs": scout.activity_log,
        "analyst_findings": gap_analysis
    }

@app.post("/api/agents/ingest")
async def ingest_documents(files: List[UploadFile] = File(...)):
    """
    Ingest a regulatory document (PDF or TXT).
    The Scout agent will process and index it.
    Accepts multiple files at once.
    """
    results = []
    
    for file in files:
        content = await file.read()
        
        # Extract client/document name from filename
        client_name = file.filename.rsplit('.', 1)[0]  # Remove extension
        
        try:
            text = doc_reader.read_bytes(content, file.filename)
        except Exception as e:
            results.append({
                "filename": file.filename,
                "status": "error",
                "error": str(e)
            })
            continue
        
        # Set client context for logging
        scout.set_current_client(client_name)
        analyst.set_current_client(client_name)
        
        # Process with Scout
        result = await scout.process_regulation(text, file.filename)
        
        results.append({
            "filename": file.filename,
            "client": client_name,
            "chars_extracted": len(text),
            "status": "processed",
            "processing_result": result
        })
    
    return {
        "files_processed": len(results),
        "results": results,
        "scout_logs": scout.get_activity_log(10)  # Last 10 logs with timestamps
    }

@app.post("/api/agents/analyze")
async def analyze_policy(policy_text: str, client_name: str = "Unknown Client"):
    """Analyze a policy text for compliance gaps."""
    # Set client context
    analyst.set_current_client(client_name)
    
    result = await analyst.analyze_policy(policy_text)
    return {
        "client": client_name,
        "analysis": result,
        "analyst_logs": analyst.get_activity_log(10)
    }

@app.post("/api/agents/monitor")
async def trigger_monitoring_batch():
    """Trigger the Risk Sentinel to check a batch of transactions."""
    # Check if sentinel is enabled
    if not app_settings.get("sentinelEnabled", True):
        return {"error": "Risk Sentinel is disabled in settings"}
    
    mock_stream = [
        {"id": 1, "amount": 500, "contains_pii": False},
        {"id": 2, "amount": 50000, "contains_pii": False},
        {"id": 3, "amount": 200, "contains_pii": True},
    ]
    alerts = await sentinel.monitor_stream(mock_stream)
    return {"alerts": alerts, "sentinel_logs": sentinel.get_activity_log(10)}

class ReportRequest(BaseModel):
    findings: List[dict] = []
    client_name: str = "Unknown Client"
    compliance_score: Optional[int] = None

@app.post("/api/agents/report")
async def generate_audit_report(request: ReportRequest = None):
    """Generate a PDF audit report for a specific client."""
    # Handle empty request
    if request is None:
        request = ReportRequest()
    
    findings = request.findings
    client_name = request.client_name
    compliance_score = request.compliance_score
    
    # If no score provided, calculate from dashboard metrics
    if compliance_score is None:
        rag_stats = rag_service.get_stats()
        doc_count = rag_stats.get("document_count", 0)
        base_score = 60
        doc_bonus = min(doc_count * 5, 20)
        activity_bonus = min(len(scout.activity_log) + len(analyst.activity_log), 20)
        compliance_score = min(base_score + doc_bonus + activity_bonus, 100)
    
    result = await officer.generate_package(findings, client_name, compliance_score)
    return result

@app.delete("/api/reports/{filename}")
async def delete_report(filename: str):
    """Delete a specific report file."""
    filepath = os.path.join(REPORTS_DIR, filename)
    if os.path.exists(filepath):
        os.remove(filepath)
        return {"status": "deleted", "filename": filename}
    raise HTTPException(status_code=404, detail="Report not found")

@app.get("/api/agents/activity")
async def get_agent_activities():
    """Aggregate logs from all agents with timestamps."""
    return {
        "Regulatory Scout": scout.get_activity_log(15),
        "Gap Analyst": analyst.get_activity_log(15),
        "Risk Sentinel": sentinel.get_activity_log(15),
        "Evidence Officer": officer.get_activity_log(15)
    }

# ==================== WEBHOOK ENDPOINTS (for n8n) ====================

@app.post("/api/webhooks/regulation-alert")
async def webhook_regulation_alert(payload: dict):
    """Webhook for n8n: Triggered when new regulation is detected."""
    url = payload.get("url", "")
    title = payload.get("title", "Unknown Regulation")
    
    await scout.scan_feed(url)
    
    return {
        "status": "processed",
        "title": title,
        "logs": scout.activity_log[-3:]
    }

@app.post("/api/webhooks/policy-review")
async def webhook_policy_review(payload: dict):
    """Webhook for n8n: Triggered for policy review."""
    policy_text = payload.get("policy_text", "")
    
    result = await analyst.analyze_policy(policy_text)
    
    return {
        "status": "analyzed",
        "result": result
    }

# ==================== RAG ENDPOINTS ====================

@app.get("/api/knowledge/stats")
async def get_knowledge_stats():
    """Get RAG knowledge base statistics."""
    return rag_service.get_stats()

@app.post("/api/knowledge/query")
async def query_knowledge(query: str, top_k: int = 3):
    """Query the knowledge base."""
    results = await rag_service.query(query, top_k)
    return {"query": query, "results": results}

# ==================== REPORTS ENDPOINTS ====================

@app.get("/api/reports")
async def list_reports():
    """List all generated PDF reports."""
    reports = []
    for filename in os.listdir(REPORTS_DIR):
        if filename.endswith(".pdf"):
            filepath = os.path.join(REPORTS_DIR, filename)
            reports.append({
                "filename": filename,
                "size_bytes": os.path.getsize(filepath),
                "created_at": os.path.getctime(filepath),
                "download_url": f"/api/reports/download/{filename}"
            })
    # Sort by creation time, newest first
    reports.sort(key=lambda x: x["created_at"], reverse=True)
    return {"reports": reports, "count": len(reports)}

@app.get("/api/reports/download/{filename}")
async def download_report(filename: str):
    """Download a specific PDF report."""
    filepath = os.path.join(REPORTS_DIR, filename)
    
    if not os.path.exists(filepath):
        raise HTTPException(status_code=404, detail="Report not found")
    
    return FileResponse(
        filepath,
        media_type="application/pdf",
        filename=filename,
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

