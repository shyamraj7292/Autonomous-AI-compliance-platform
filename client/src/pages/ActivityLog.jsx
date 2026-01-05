import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Activity, Search, Filter } from 'lucide-react';
import { fetchAgentActivity } from '@/lib/api';

export default function ActivityLog() {
    const [activities, setActivities] = useState([]);

    useEffect(() => {
        const load = async () => {
            const acts = await fetchAgentActivity();
            // Convert dict of lists to flat sorted list
            const flat = [];
            Object.entries(acts).forEach(([agent, logs]) => {
                logs.forEach(log => {
                    // Check for "Using Tool" to add badge
                    const isTool = log.includes("Using Tool:");
                    flat.push({ agent, log, time: 'Just now', isTool });
                });
            });
            setActivities(flat.reverse());
        };
        load();
        const interval = setInterval(load, 3000); // Live polling
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Agent Activity Log</h1>
                <p className="text-muted-foreground">Real-time "Black Box" recording of all autonomous decisions and tool usage.</p>
            </div>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <Activity className="h-5 w-5 text-blue-500" /> Live Agent Feed
                    </CardTitle>
                    <div className="flex gap-2">
                        <div className="relative">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <input
                                placeholder="Search logs..."
                                className="pl-8 h-9 w-[200px] rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-0 relative border-l-2 border-muted ml-3">
                        {activities.length === 0 ? (
                            <div className="p-4 text-muted-foreground pl-8">No activity recorded yet. Run a scan to see agents in action.</div>
                        ) : activities.map((act, i) => (
                            <div key={i} className="mb-6 ml-6 relative group">
                                <span className={`absolute -left-[31px] flex h-6 w-6 items-center justify-center rounded-full ring-4 ring-background ${act.isTool ? 'bg-purple-500' : 'bg-blue-500'
                                    }`}>
                                    <div className="h-2 w-2 rounded-full bg-white animate-pulse" />
                                </span>
                                <div className="flex flex-col p-4 rounded-lg bg-accent/20 border border-transparent hover:border-accent transition-colors">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-sm font-semibold capitalize text-foreground">{act.agent}</span>
                                        <span className="text-xs text-muted-foreground font-mono">{act.time}</span>
                                    </div>
                                    <div className="text-sm text-foreground/90 font-mono">
                                        {act.log}
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
