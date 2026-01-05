import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';
import { ShieldCheck, CheckCircle, XCircle, Download, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import { fetchDashboardMetrics, fetchAgentActivity, triggerScan, generateReport, getReportDownloadUrl } from '@/lib/api';

// Regulatory guidelines being checked
const COMPLIANCE_GUIDELINES = [
    { id: 'PCI-DSS-3.1', name: 'Encrypt stored cardholder data', category: 'Data Protection' },
    { id: 'PCI-DSS-8.3', name: 'Secure all authentication', category: 'Access Control' },
    { id: 'GDPR-Art.5', name: 'Data minimization principle', category: 'Data Protection' },
    { id: 'GDPR-Art.32', name: 'Security of processing', category: 'Data Protection' },
    { id: 'SOC2-CC6.1', name: 'Logical access controls', category: 'Access Control' },
];

export default function Dashboard() {
    const [metrics, setMetrics] = useState(null);
    const [activities, setActivities] = useState([]);
    const [scanning, setScanning] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [lastReport, setLastReport] = useState(null);
    const [gapAnalysis, setGapAnalysis] = useState([]);
    const [loading, setLoading] = useState(true);

    // Load persisted data on mount
    useEffect(() => {
        // Load from localStorage first for instant display
        const savedMetrics = localStorage.getItem('dashboardMetrics');
        const savedGaps = localStorage.getItem('dashboardGaps');
        const savedActivities = localStorage.getItem('dashboardActivities');

        if (savedMetrics) setMetrics(JSON.parse(savedMetrics));
        if (savedGaps) setGapAnalysis(JSON.parse(savedGaps));
        if (savedActivities) setActivities(JSON.parse(savedActivities));

        // Then fetch fresh data
        loadData();
        const interval = setInterval(loadData, 30000); // Poll every 30 seconds
        return () => clearInterval(interval);
    }, []);

    async function loadData() {
        try {
            const data = await fetchDashboardMetrics();
            if (data) {
                setMetrics(data);
                localStorage.setItem('dashboardMetrics', JSON.stringify(data));
            }

            const acts = await fetchAgentActivity();
            const flatActs = [];

            Object.entries(acts).forEach(([agent, logs]) => {
                if (Array.isArray(logs)) {
                    logs.forEach(log => {
                        if (typeof log === 'object' && log !== null) {
                            flatActs.push({
                                agent,
                                log: log.action || 'Unknown action',
                                time: log.time_display || 'Just now',
                                client: log.client
                            });
                        } else {
                            flatActs.push({ agent, log: String(log), time: 'Just now' });
                        }
                    });
                }
            });
            const recentActs = flatActs.slice(-5).reverse();
            setActivities(recentActs);
            localStorage.setItem('dashboardActivities', JSON.stringify(recentActs));

            // Extract gap analysis from activity logs
            const gaps = [];
            Object.entries(acts).forEach(([agent, logs]) => {
                if (Array.isArray(logs)) {
                    logs.forEach(log => {
                        const action = typeof log === 'object' ? (log.action || '') : String(log);
                        const client = typeof log === 'object' ? log.client : null;
                        if (action.includes('Gap') || action.includes('Risk') || action.includes('Finding')) {
                            // Match to a guideline
                            const matchedGuideline = COMPLIANCE_GUIDELINES.find(g =>
                                action.toLowerCase().includes('encrypt') ? g.id.includes('3.1') :
                                    action.toLowerCase().includes('access') ? g.id.includes('8.3') || g.id.includes('CC6') :
                                        action.toLowerCase().includes('data') ? g.id.includes('Art.5') :
                                            true
                            );
                            gaps.push({
                                agent,
                                finding: action,
                                client,
                                guideline: matchedGuideline || COMPLIANCE_GUIDELINES[0]
                            });
                        }
                    });
                }
            });
            const recentGaps = gaps.slice(-3);
            setGapAnalysis(recentGaps);
            localStorage.setItem('dashboardGaps', JSON.stringify(recentGaps));
        } catch (error) {
            console.error('Failed to load dashboard data:', error);
        }
        setLoading(false);
    }

    const handleScan = async () => {
        try {
            setScanning(true);
            const result = await triggerScan();
            await loadData();

            // Update gap analysis from scan results
            if (result.analyst_findings) {
                const newGap = {
                    agent: 'Gap Analyst',
                    finding: result.analyst_findings.finding || JSON.stringify(result.analyst_findings),
                    client: 'Current Scan',
                    guideline: COMPLIANCE_GUIDELINES[0]
                };
                setGapAnalysis(prev => {
                    const updated = [...prev, newGap].slice(-5);
                    localStorage.setItem('dashboardGaps', JSON.stringify(updated));
                    return updated;
                });
            }
        } catch (error) {
            console.error("Scan failed:", error);
        } finally {
            setScanning(false);
        }
    };

    const handleGenerateReport = async () => {
        setGenerating(true);
        try {
            const findings = gapAnalysis.map(g => ({
                title: g.guideline?.name || "Compliance Gap Detected",
                description: g.finding || g.agent,
                severity: "High",
                guideline: g.guideline?.id
            }));

            // Get client name from findings or default
            const clientName = gapAnalysis[0]?.client || "Compliance Audit";
            const score = metrics?.score || 60;

            const result = await generateReport(findings, clientName, score);
            if (result.report_url) {
                const filename = result.report_url.split('/').pop();
                setLastReport(filename);
            }
        } catch (error) {
            console.error("Report generation failed:", error);
        }
        setGenerating(false);
    };

    if (!metrics) return (
        <div className="p-10 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mr-3"></div>
            Loading Dashboard...
        </div>
    );

    // Dynamic chart data based on metrics
    const scoreData = [
        { name: 'Compliant', value: metrics.score, color: '#10b981' },
        { name: 'Gap', value: 100 - metrics.score, color: '#ef4444' },
    ];

    const riskData = [
        { name: 'Mon', risk: Math.max(0, metrics.risks - 5) },
        { name: 'Tue', risk: Math.max(0, metrics.risks - 2) },
        { name: 'Wed', risk: metrics.risks + 3 },
        { name: 'Thu', risk: metrics.risks },
        { name: 'Fri', risk: metrics.risks + 5 },
        { name: 'Sat', risk: Math.max(0, metrics.risks - 3) },
        { name: 'Sun', risk: metrics.risks },
    ];

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Compliance Dashboard</h1>
                    <p className="text-muted-foreground mt-1">Real-time overview of your regulatory posture.</p>
                </div>
                <div className="flex gap-2">
                    <Button onClick={handleScan} disabled={scanning} className="bg-blue-600 hover:bg-blue-500">
                        {scanning ? (
                            <div className="flex items-center">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Scanning...
                            </div>
                        ) : (
                            <>
                                <ShieldCheck className="mr-2 h-4 w-4" /> Trigger Scan
                            </>
                        )}
                    </Button>
                    <Button onClick={handleGenerateReport} disabled={generating} variant="outline">
                        {generating ? (
                            <div className="flex items-center">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                                Generating...
                            </div>
                        ) : (
                            <>
                                <Download className="mr-2 h-4 w-4" /> Generate Report
                            </>
                        )}
                    </Button>
                </div>
            </div>

            {/* Download Last Report Banner */}
            {lastReport && (
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 flex items-center justify-between">
                    <p className="text-sm text-green-600 dark:text-green-400">
                        ✓ Report generated successfully: <strong>{lastReport}</strong>
                    </p>
                    <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-500"
                        onClick={() => window.open(getReportDownloadUrl(lastReport), '_blank')}
                    >
                        <Download className="mr-2 h-4 w-4" /> Download PDF
                    </Button>
                </div>
            )}

            {/* Guidelines Being Checked */}
            <Card className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border-none">
                <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-blue-400">
                        <BookOpen className="h-5 w-5" /> Compliance Guidelines Being Checked
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-2">
                        {COMPLIANCE_GUIDELINES.map(g => (
                            <span key={g.id} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-300 border border-blue-500/30">
                                {g.id}: {g.name}
                            </span>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard
                    title="Overall Score"
                    value={`${metrics.score}%`}
                    trend={metrics.score > 0 ? "Analyzed" : "Not analyzed"}
                    trendUp={metrics.score >= 70}
                    icon={<ShieldCheck className="h-4 w-4 text-primary" />}
                />
                <MetricCard
                    title="Active Risks"
                    value={metrics.risks}
                    trend={metrics.risks === 0 ? "No risks" : `${metrics.risks} found`}
                    trendUp={metrics.risks === 0}
                    icon={<XCircle className="h-4 w-4 text-destructive" />}
                />
                <MetricCard
                    title="Policies Mapped"
                    value={metrics.policies_mapped}
                    trend={metrics.policies_mapped === 0 ? "Upload docs" : "From uploaded docs"}
                    trendUp={metrics.policies_mapped > 0}
                    icon={<CheckCircle className="h-4 w-4 text-green-500" />}
                />
                <MetricCard
                    title="Pending Reviews"
                    value={metrics.pending_reviews}
                    trend={metrics.pending_reviews === 0 ? "All clear" : "Need attention"}
                    trendUp={metrics.pending_reviews === 0}
                    sub=""
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="col-span-1 lg:col-span-2 shadow-lg">
                    <CardHeader>
                        <CardTitle>Risk Trend (7 Days)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={riskData}>
                                    <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}%`} />
                                    <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }} itemStyle={{ color: '#fff' }} />
                                    <Line type="monotone" dataKey="risk" stroke="#6366f1" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 8 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                <Card className="col-span-1 shadow-lg">
                    <CardHeader>
                        <CardTitle>Compliance Score</CardTitle>
                    </CardHeader>
                    <CardContent className="flex justify-center items-center relative">
                        <div className="h-[250px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={scoreData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={80}
                                        outerRadius={110}
                                        paddingAngle={5}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {scoreData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <span className="text-4xl font-bold">{metrics.score}%</span>
                                <span className="text-sm text-muted-foreground">Compliant</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader><CardTitle>Recent Agent Actions</CardTitle></CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {activities.length === 0 ? <p className="text-sm text-muted-foreground">No recent activity. Click "Trigger Scan" to start.</p> : activities.map((act, i) => (
                                <div key={i} className="flex items-center p-3 rounded-lg bg-accent/50 hover:bg-accent transition-colors">
                                    <div className="h-2 w-2 rounded-full bg-blue-500 mr-3"></div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium">{act.log}</p>
                                        <p className="text-xs text-muted-foreground">{act.time} • {act.agent}{act.client && ` • ${act.client}`}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader><CardTitle>Gap Analysis</CardTitle></CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {gapAnalysis.length === 0 ? (
                                <p className="text-sm text-muted-foreground">No gaps detected. Run a scan to analyze compliance.</p>
                            ) : gapAnalysis.map((gap, i) => (
                                <div key={i} className="space-y-2 p-3 bg-red-500/5 rounded-lg border border-red-500/20">
                                    <div className="flex justify-between items-center text-sm">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium">{gap.agent}</span>
                                            {gap.client && (
                                                <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded">
                                                    {gap.client}
                                                </span>
                                            )}
                                        </div>
                                        <span className="text-red-500 font-medium">Gap Detected</span>
                                    </div>
                                    {gap.guideline && (
                                        <div className="text-xs bg-purple-500/10 text-purple-400 px-2 py-1 rounded inline-block">
                                            📋 {gap.guideline.id}: {gap.guideline.name}
                                        </div>
                                    )}
                                    <p className="text-xs text-muted-foreground">{gap.finding}</p>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

function MetricCard({ title, value, trend, trendUp, icon, sub }) {
    return (
        <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">{title}</p>
                        <h2 className="text-3xl font-bold mt-2">{value}</h2>
                    </div>
                    {icon && <div className="p-2 bg-primary/10 rounded-md">{icon}</div>}
                </div>
                <div className="mt-4 flex items-center text-xs">
                    <span className={cn("font-medium", trendUp ? "text-green-500" : "text-red-500")}>
                        {trend}
                    </span>
                    <span className="text-muted-foreground ml-2">{sub || "from last month"}</span>
                </div>
            </CardContent>
        </Card>
    )
}
