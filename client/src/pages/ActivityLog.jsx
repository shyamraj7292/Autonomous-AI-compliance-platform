import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Activity, Search, RefreshCw, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { fetchAgentActivity } from '@/lib/api';

export default function ActivityLog() {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadActivities();
        const interval = setInterval(loadActivities, 5000); // Poll every 5 seconds
        return () => clearInterval(interval);
    }, []);

    const loadActivities = async () => {
        try {
            const acts = await fetchAgentActivity();
            const flat = [];

            Object.entries(acts).forEach(([agent, logs]) => {
                if (Array.isArray(logs)) {
                    logs.forEach(log => {
                        // Handle new structured log format
                        if (typeof log === 'object' && log !== null) {
                            flat.push({
                                agent,
                                action: log.action || 'Unknown action',
                                time: log.time_display || log.timestamp || 'Unknown',
                                date: log.date_display || '',
                                client: log.client || null,
                                isTool: (log.action || '').includes('Tool'),
                                raw: log
                            });
                        } else {
                            // Handle legacy string format
                            flat.push({
                                agent,
                                action: String(log),
                                time: 'Legacy',
                                client: null,
                                isTool: String(log).includes('Tool'),
                                raw: log
                            });
                        }
                    });
                }
            });

            // Sort by timestamp if available, otherwise reverse for newest first
            flat.sort((a, b) => {
                if (a.raw?.timestamp && b.raw?.timestamp) {
                    return new Date(b.raw.timestamp) - new Date(a.raw.timestamp);
                }
                return -1;
            });

            setActivities(flat);
        } catch (error) {
            console.error('Failed to fetch activities:', error);
        }
        setLoading(false);
    };

    const filteredActivities = activities.filter(act =>
        act.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        act.agent.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (act.client && act.client.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-bold tracking-tight">Agent Activity Log</h1>
                    <p className="text-muted-foreground">Real-time audit trail of all agent decisions and tool usage.</p>
                </div>
                <Button variant="outline" onClick={loadActivities} disabled={loading}>
                    <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </Button>
            </div>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <Activity className="h-5 w-5 text-blue-500" />
                        Live Agent Feed ({filteredActivities.length} entries)
                    </CardTitle>
                    <div className="relative">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <input
                            placeholder="Search logs..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-8 h-9 w-[200px] rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                        />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-0 relative border-l-2 border-muted ml-3">
                        {filteredActivities.length === 0 ? (
                            <div className="p-4 text-muted-foreground pl-8">
                                {loading ? 'Loading...' : 'No activity recorded yet. Upload a document or run a scan.'}
                            </div>
                        ) : filteredActivities.map((act, i) => (
                            <div key={i} className="mb-4 ml-6 relative group">
                                <span className={`absolute -left-[31px] flex h-6 w-6 items-center justify-center rounded-full ring-4 ring-background ${act.isTool ? 'bg-purple-500' : 'bg-blue-500'
                                    }`}>
                                    <div className="h-2 w-2 rounded-full bg-white" />
                                </span>
                                <div className="flex flex-col p-4 rounded-lg bg-accent/20 border border-transparent hover:border-accent transition-colors">
                                    <div className="flex items-center justify-between mb-1">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-semibold text-foreground">{act.agent}</span>
                                            {act.client && (
                                                <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded">
                                                    {act.client}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-1 text-xs text-muted-foreground font-mono">
                                            <Clock className="h-3 w-3" />
                                            {act.time}
                                        </div>
                                    </div>
                                    <div className="text-sm text-foreground/90">
                                        {act.action}
                                        {act.isTool && (
                                            <span className="ml-2 inline-flex items-center rounded-md bg-purple-500/10 px-2 py-1 text-xs font-medium text-purple-400 ring-1 ring-inset ring-purple-500/20">
                                                TOOL CALL
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
