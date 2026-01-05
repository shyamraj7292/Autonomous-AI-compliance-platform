import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';
import { ShieldCheck, CheckCircle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';


import { fetchDashboardMetrics, fetchAgentActivity, triggerScan } from '@/lib/api';

const scoreData = [
    { name: 'Compliant', value: 78, color: '#10b981' },
    { name: 'Gap', value: 22, color: '#ef4444' },
];

const riskData = [
    { name: 'Mon', risk: 40 },
    { name: 'Tue', risk: 30 },
    { name: 'Wed', risk: 65 },
    { name: 'Thu', risk: 45 },
    { name: 'Fri', risk: 80 },
    { name: 'Sat', risk: 20 },
    { name: 'Sun', risk: 35 },
];

export default function Dashboard() {
    const [metrics, setMetrics] = useState(null);
    const [activities, setActivities] = useState([]);
    const [scanning, setScanning] = useState(false);

    useEffect(() => {
        // Initial Fetch
        loadData();

        // Simulate real-time polling
        const interval = setInterval(loadData, 5000);
        return () => clearInterval(interval);
    }, []);

    async function loadData() {
        const data = await fetchDashboardMetrics();
        if (data) setMetrics(data);

        const acts = await fetchAgentActivity();
        // Flatten activities for display
        const flatActs = [];
        Object.entries(acts).forEach(([agent, logs]) => {
            logs.forEach(log => flatActs.push({ agent, log, time: 'Just now' }));
        });
        setActivities(flatActs.slice(-5).reverse()); // Show last 5
    }

    const handleScan = async () => {
        try {
            setScanning(true);
            console.log("Triggering scan...");
            await triggerScan();
            console.log("Scan triggered successfully, updating data...");
            // Initial wait for backend to process
            await new Promise(r => setTimeout(r, 2000));
            await loadData();
        } catch (error) {
            console.error("Scan failed:", error);
        } finally {
            setScanning(false);
        }
    };

    if (!metrics) return <div className="p-10">Loading Dashboard...</div>;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Compliance Dashboard</h1>
                    <p className="text-muted-foreground mt-1">Real-time overview of your regulatory posture.</p>
                </div>
                <Button onClick={handleScan} disabled={scanning} className="bg-blue-600 hover:bg-blue-500">
                    {scanning ? (
                        <div className="flex items-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Scanning...
                        </div>
                    ) : (
                        <>
                            <ShieldCheck className="mr-2 h-4 w-4" /> Trigger Regulatory Scan
                        </>
                    )}
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard title="Overall Score" value={`${metrics.score}/100`} trend="+2.4%" trendUp={true} icon={<ShieldCheck className="h-4 w-4 text-primary" />} />
                <MetricCard title="Active Risks" value={metrics.risks} trend="-4" trendUp={true} icon={<XCircle className="h-4 w-4 text-destructive" />} />
                <MetricCard title="Policies Mapped" value={`${metrics.policies_mapped}/150`} trend="94%" trendUp={true} icon={<CheckCircle className="h-4 w-4 text-green-500" />} />
                <MetricCard title="Pending Reviews" value={metrics.pending_reviews} trend="+1" trendUp={false} sub="Since yesterday" />
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
                                <span className="text-4xl font-bold">78%</span>
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
                            {activities.length === 0 ? <p className="text-sm text-muted-foreground">No recent activity.</p> : activities.map((act, i) => (
                                <div key={i} className="flex items-center p-3 rounded-lg bg-accent/50 hover:bg-accent transition-colors">
                                    <div className="h-2 w-2 rounded-full bg-blue-500 mr-3"></div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium">{act.log}</p>
                                        <p className="text-xs text-muted-foreground">{act.time} • {act.agent}</p>
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
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span>Data Encryption</span>
                                    <span className="text-red-500">Critical Gap</span>
                                </div>
                                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                                    <div className="h-full bg-red-500 w-[45%]"></div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span>Access Control</span>
                                    <span className="text-yellow-500">Review Needed</span>
                                </div>
                                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                                    <div className="h-full bg-yellow-500 w-[78%]"></div>
                                </div>
                            </div>
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
