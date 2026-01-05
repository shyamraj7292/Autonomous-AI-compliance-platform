import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Download, Trash2, RefreshCw, Plus } from 'lucide-react';
import { fetchReports, getReportDownloadUrl, generateReport } from '@/lib/api';

const API_BASE = 'http://localhost:8000';

export default function Reports() {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [deleting, setDeleting] = useState(null);

    useEffect(() => {
        loadReports();
    }, []);

    const loadReports = async () => {
        setLoading(true);
        const data = await fetchReports();
        setReports(data.reports || []);
        setLoading(false);
    };

    const handleGenerateReport = async () => {
        setGenerating(true);
        try {
            // Get actual findings from localStorage
            const savedGaps = localStorage.getItem('dashboardGaps');
            const gaps = savedGaps ? JSON.parse(savedGaps) : [];

            const findings = gaps.map(g => ({
                title: g.guideline?.name || "Compliance Gap Detected",
                description: g.finding || g.agent,
                severity: "High",
                requirement_id: g.guideline?.id || "Unknown",
                remediation: `Address the ${g.agent} finding for ${g.client || 'this client'}.`
            }));

            // If no findings, add sample ones
            if (findings.length === 0) {
                findings.push({
                    title: "Policy Analysis Required",
                    description: "Upload a policy document to run compliance analysis.",
                    severity: "Info",
                    requirement_id: "N/A",
                    remediation: "Go to Regulations tab and upload a policy document."
                });
            }

            await generateReport(findings);
            await loadReports();
        } catch (error) {
            console.error('Failed to generate report:', error);
        }
        setGenerating(false);
    };

    const handleDownload = (filename) => {
        const url = getReportDownloadUrl(filename);
        window.open(url, '_blank');
    };

    const handleDelete = async (filename) => {
        if (!confirm(`Are you sure you want to delete ${filename}?`)) return;

        setDeleting(filename);
        try {
            const response = await fetch(`${API_BASE}/api/reports/${filename}`, {
                method: 'DELETE'
            });
            if (response.ok) {
                setReports(prev => prev.filter(r => r.filename !== filename));
            } else {
                console.error('Failed to delete report');
            }
        } catch (error) {
            console.error('Delete error:', error);
        }
        setDeleting(null);
    };

    const formatDate = (timestamp) => {
        return new Date(timestamp * 1000).toLocaleString();
    };

    const formatSize = (bytes) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Compliance Reports</h1>
                    <p className="text-muted-foreground mt-1">Download and manage generated PDF reports.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={loadReports} disabled={loading}>
                        <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                    <Button onClick={handleGenerateReport} disabled={generating} className="bg-blue-600 hover:bg-blue-500">
                        {generating ? (
                            <div className="flex items-center">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Generating...
                            </div>
                        ) : (
                            <>
                                <Plus className="mr-2 h-4 w-4" /> Generate New Report
                            </>
                        )}
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" /> Available Reports ({reports.length})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                        </div>
                    ) : reports.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>No reports generated yet.</p>
                            <p className="text-sm">Click "Generate New Report" to create your first compliance report.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {reports.map((report, index) => (
                                <div
                                    key={index}
                                    className="flex items-center justify-between p-4 rounded-lg bg-accent/50 hover:bg-accent transition-colors"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 bg-red-500/10 rounded-lg">
                                            <FileText className="h-6 w-6 text-red-500" />
                                        </div>
                                        <div>
                                            <p className="font-medium">{report.filename}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {formatSize(report.size_bytes)} • Generated {formatDate(report.created_at)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            onClick={() => handleDownload(report.filename)}
                                            className="bg-green-600 hover:bg-green-500"
                                        >
                                            <Download className="mr-2 h-4 w-4" /> Download
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            onClick={() => handleDelete(report.filename)}
                                            disabled={deleting === report.filename}
                                        >
                                            {deleting === report.filename ? (
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                            ) : (
                                                <Trash2 className="h-4 w-4" />
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
