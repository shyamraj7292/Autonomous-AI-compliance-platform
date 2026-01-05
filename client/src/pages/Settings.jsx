import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch'; // Will create simple switch stub if missing
import { Button } from '@/components/ui/button';
import { Lock, Cpu, Webhook, Save } from 'lucide-react';

export default function Settings() {
    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <h1 className="text-3xl font-bold tracking-tight">System Settings</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Cpu className="h-5 w-5" /> Agent Control Panel</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <div className="font-medium">Regulatory Scout</div>
                                <div className="text-xs text-muted-foreground">Auto-ingest new frameworks</div>
                            </div>
                            <div className="h-6 w-10 bg-green-600 rounded-full relative cursor-pointer"><div className="absolute right-1 top-1 h-4 w-4 bg-white rounded-full"></div></div>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <div className="font-medium">Risk Sentinel</div>
                                <div className="text-xs text-muted-foreground">Continuous stream monitoring</div>
                            </div>
                            <div className="h-6 w-10 bg-green-600 rounded-full relative cursor-pointer"><div className="absolute right-1 top-1 h-4 w-4 bg-white rounded-full"></div></div>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <div className="font-medium">Auto-Remediation</div>
                                <div className="text-xs text-muted-foreground">Allow Analyst to write policy fixes</div>
                            </div>
                            <div className="h-6 w-10 bg-gray-600 rounded-full relative cursor-pointer"><div className="absolute left-1 top-1 h-4 w-4 bg-white rounded-full"></div></div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Webhook className="h-5 w-5" /> Integrations</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Jira Webhook URL</label>
                            <input className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm" placeholder="https://jira.company.com/webhook..." />
                        </div>
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Slack Webhook URL</label>
                            <input className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm" placeholder="https://hooks.slack.com/services/..." />
                        </div>
                        <Button>Test Connections</Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
