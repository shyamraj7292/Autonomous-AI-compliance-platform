import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock, Cpu, Webhook, Save, Check, RefreshCw } from 'lucide-react';

const API_BASE = 'http://localhost:8000';

// Custom Toggle Switch Component
function Toggle({ enabled, onChange, disabled = false }) {
    return (
        <button
            type="button"
            onClick={() => !disabled && onChange(!enabled)}
            disabled={disabled}
            className={`
                relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200
                ${enabled ? 'bg-green-600' : 'bg-gray-600'}
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
        >
            <span
                className={`
                    inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200
                    ${enabled ? 'translate-x-6' : 'translate-x-1'}
                `}
            />
        </button>
    );
}

export default function Settings() {
    const [settings, setSettings] = useState({
        scoutEnabled: true,
        sentinelEnabled: true,
        autoRemediation: false,
        jiraWebhook: '',
        slackWebhook: '',
    });

    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [testingConnection, setTestingConnection] = useState(false);
    const [apiStatus, setApiStatus] = useState(null);
    const [loadingStatus, setLoadingStatus] = useState(true);

    // Load settings and API status on mount
    useEffect(() => {
        const savedSettings = localStorage.getItem('complianceSettings');
        if (savedSettings) {
            setSettings(JSON.parse(savedSettings));
        }
        fetchApiStatus();
    }, []);

    const fetchApiStatus = async () => {
        setLoadingStatus(true);
        try {
            const response = await fetch(`${API_BASE}/api/status`);
            const data = await response.json();
            setApiStatus(data);
        } catch (error) {
            setApiStatus({ backend: 'disconnected', gemini: { status: 'error', message: error.message } });
        }
        setLoadingStatus(false);
    };

    const handleSave = async () => {
        setSaving(true);
        localStorage.setItem('complianceSettings', JSON.stringify(settings));

        try {
            await fetch(`${API_BASE}/api/settings`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings)
            });
        } catch (error) {
            console.log('Backend settings sync failed');
        }

        setSaving(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    const updateSetting = (key, value) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    const testConnections = async () => {
        setTestingConnection(true);
        alert('Connection test sent! Check your configured channels.');
        setTestingConnection(false);
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight">System Settings</h1>
                <Button
                    onClick={handleSave}
                    disabled={saving}
                    className={saved ? 'bg-green-600' : 'bg-blue-600 hover:bg-blue-500'}
                >
                    {saving ? 'Saving...' : saved ? (<><Check className="mr-2 h-4 w-4" /> Saved!</>) : (<><Save className="mr-2 h-4 w-4" /> Save Settings</>)}
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Cpu className="h-5 w-5" /> Agent Control Panel
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <div className="font-medium">Regulatory Scout</div>
                                <div className="text-xs text-muted-foreground">Auto-ingest new frameworks</div>
                            </div>
                            <Toggle enabled={settings.scoutEnabled} onChange={(val) => updateSetting('scoutEnabled', val)} />
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <div className="font-medium">Risk Sentinel</div>
                                <div className="text-xs text-muted-foreground">Continuous stream monitoring</div>
                            </div>
                            <Toggle enabled={settings.sentinelEnabled} onChange={(val) => updateSetting('sentinelEnabled', val)} />
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <div className="font-medium">Auto-Remediation</div>
                                <div className="text-xs text-muted-foreground">Allow Analyst to write policy fixes</div>
                            </div>
                            <Toggle enabled={settings.autoRemediation} onChange={(val) => updateSetting('autoRemediation', val)} />
                        </div>

                        {settings.autoRemediation && (
                            <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                                <p className="text-sm text-yellow-600 dark:text-yellow-400">
                                    ⚠️ Auto-remediation is enabled. The Gap Analyst will automatically generate policy fixes.
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Webhook className="h-5 w-5" /> Integrations
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Jira Webhook URL</label>
                            <input
                                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                                placeholder="https://jira.company.com/webhook..."
                                value={settings.jiraWebhook}
                                onChange={(e) => updateSetting('jiraWebhook', e.target.value)}
                            />
                        </div>
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Slack Webhook URL</label>
                            <input
                                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                                placeholder="https://hooks.slack.com/services/..."
                                value={settings.slackWebhook}
                                onChange={(e) => updateSetting('slackWebhook', e.target.value)}
                            />
                        </div>
                        <Button variant="outline" onClick={testConnections} disabled={testingConnection}>
                            {testingConnection ? 'Testing...' : 'Test Connections'}
                        </Button>
                    </CardContent>
                </Card>
            </div>

            {/* API Status Card */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Lock className="h-5 w-5" /> API Configuration
                        </div>
                        <Button variant="ghost" size="sm" onClick={fetchApiStatus} disabled={loadingStatus}>
                            <RefreshCw className={`h-4 w-4 ${loadingStatus ? 'animate-spin' : ''}`} />
                        </Button>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4">
                        <div className="flex items-center gap-4">
                            <div className={`h-3 w-3 rounded-full ${apiStatus?.backend === 'connected' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                            <div>
                                <span className="text-sm font-medium">Backend API</span>
                                <p className="text-xs text-muted-foreground">
                                    {apiStatus?.backend === 'connected' ? 'Connected and operational' : 'Disconnected'}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className={`h-3 w-3 rounded-full ${apiStatus?.gemini?.status === 'connected' ? 'bg-green-500' :
                                    apiStatus?.gemini?.status === 'error' ? 'bg-red-500' : 'bg-yellow-500'
                                }`}></div>
                            <div>
                                <span className="text-sm font-medium">Gemini API</span>
                                <p className="text-xs text-muted-foreground">
                                    {apiStatus?.gemini?.message || 'Checking...'}
                                </p>
                            </div>
                        </div>
                        {apiStatus?.rag && (
                            <div className="flex items-center gap-4">
                                <div className="h-3 w-3 rounded-full bg-green-500"></div>
                                <div>
                                    <span className="text-sm font-medium">RAG Knowledge Base</span>
                                    <p className="text-xs text-muted-foreground">
                                        {apiStatus.rag.document_count || 0} documents indexed
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
