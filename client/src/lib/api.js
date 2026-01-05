const API_BASE = 'http://localhost:8000';

export async function fetchDashboardMetrics() {
    try {
        const response = await fetch(`${API_BASE}/api/dashboard`);
        return await response.json();
    } catch (error) {
        console.error("Failed to fetch metrics", error);
        return null;
    }
}

export async function fetchAgentActivity() {
    try {
        const response = await fetch(`${API_BASE}/api/agents/activity`);
        return await response.json();
    } catch (error) {
        console.error("Failed to fetch activity", error);
        return {};
    }
}

export async function triggerScan() {
    const response = await fetch(`${API_BASE}/api/agents/scan`, { method: 'POST' });
    return await response.json();
}

export async function generateReport(findings = [], clientName = "Unknown Client", complianceScore = null) {
    // Get score from localStorage if not provided
    if (complianceScore === null) {
        const savedMetrics = localStorage.getItem('dashboardMetrics');
        if (savedMetrics) {
            const metrics = JSON.parse(savedMetrics);
            complianceScore = metrics.score || 60;
        } else {
            complianceScore = 60;
        }
    }

    const response = await fetch(`${API_BASE}/api/agents/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            findings,
            client_name: clientName,
            compliance_score: complianceScore
        })
    });
    return await response.json();
}

export async function fetchReports() {
    try {
        const response = await fetch(`${API_BASE}/api/reports`);
        return await response.json();
    } catch (error) {
        console.error("Failed to fetch reports", error);
        return { reports: [], count: 0 };
    }
}

export function getReportDownloadUrl(filename) {
    return `${API_BASE}/api/reports/download/${filename}`;
}

export async function uploadDocument(file) {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE}/api/agents/ingest`, {
        method: 'POST',
        body: formData
    });
    return await response.json();
}
