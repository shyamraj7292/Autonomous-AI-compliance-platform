export async function fetchDashboardMetrics() {
    try {
        const response = await fetch('http://localhost:8000/api/dashboard');
        return await response.json();
    } catch (error) {
        console.error("Failed to fetch metrics", error);
        return null;
    }
}

export async function fetchAgentActivity() {
    try {
        const response = await fetch('http://localhost:8000/api/agents/activity');
        return await response.json();
    } catch (error) {
        console.error("Failed to fetch activity", error);
        return {};
    }
}

export async function triggerScan() {
    await fetch('http://localhost:8000/api/agents/scan', { method: 'POST' });
}
