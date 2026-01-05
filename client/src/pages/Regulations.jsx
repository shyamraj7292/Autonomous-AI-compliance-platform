import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { RegulationList } from '@/components/RegulationList';
import { FileUpload } from '@/components/FileUpload';
import { Rss, BookOpen, UploadCloud, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

const API_BASE = 'http://localhost:8000';

export default function Regulations() {
    const [regulations, setRegulations] = useState([]);
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);

    // Load data on mount and from localStorage for persistence
    useEffect(() => {
        // Load from localStorage first for instant display
        const savedRegs = localStorage.getItem('uploadedRegulations');
        if (savedRegs) {
            setRegulations(JSON.parse(savedRegs));
        }

        // Then fetch from API
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            // Get RAG stats to see what's indexed
            const response = await fetch(`${API_BASE}/api/knowledge/stats`);
            const stats = await response.json();

            // Get activity logs to show in news feed
            const actResponse = await fetch(`${API_BASE}/api/agents/activity`);
            const activities = await actResponse.json();

            // Extract recent scout activities for news
            const scoutLogs = activities['Regulatory Scout'] || [];
            const newsItems = scoutLogs.slice(-5).map(log => {
                if (typeof log === 'object') {
                    return log.action || JSON.stringify(log);
                }
                return log;
            });
            setNews(newsItems.length > 0 ? newsItems : ['No recent regulatory updates. Upload a document to start.']);

        } catch (error) {
            console.error('Failed to load regulations data:', error);
        }
        setLoading(false);
    };

    const handleUploadComplete = (result) => {
        console.log('Upload complete:', result);

        if (result.results) {
            // Add newly uploaded files to the list
            const newRegs = result.results.map(r => ({
                name: r.client || 'Document',
                code: r.filename,
                description: `Uploaded policy document (${r.chars_extracted || 0} chars)`,
                status: r.status === 'processed' ? 'Active' : 'Error',
                lastUpdated: new Date().toLocaleString()
            }));

            setRegulations(prev => {
                const updated = [...prev, ...newRegs];
                // Persist to localStorage
                localStorage.setItem('uploadedRegulations', JSON.stringify(updated));
                return updated;
            });
        }

        // Refresh news feed
        loadData();
    };

    // Default regulations if none uploaded
    const displayRegulations = regulations.length > 0 ? regulations : [
        { name: 'PCI-DSS', code: 'v4.0', description: 'Payment Card Industry Data Security Standard', status: 'Reference', lastUpdated: 'Built-in' },
        { name: 'GDPR', code: 'EU-2016/679', description: 'General Data Protection Regulation', status: 'Reference', lastUpdated: 'Built-in' },
    ];

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-bold tracking-tight">Regulatory Library</h1>
                    <p className="text-muted-foreground">Upload policies for the Scout agent to analyze.</p>
                </div>
                <Button variant="outline" onClick={loadData} disabled={loading}>
                    <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* File Upload Zone */}
                <Card className="col-span-1 lg:col-span-2 border-dashed border-2 bg-accent/20">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <UploadCloud className="h-5 w-5" /> Upload Documents
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <FileUpload onUpload={handleUploadComplete} />
                    </CardContent>
                </Card>

                {/* News Ticker */}
                <Card className="col-span-1 bg-gradient-to-br from-blue-900/20 to-purple-900/20 border-none">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-blue-400">
                            <Rss className="h-5 w-5" /> Scout Activity Feed
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {news.map((item, i) => (
                                <div key={i} className="flex gap-3 items-start border-l-2 border-blue-500 pl-3">
                                    <div className="text-sm text-foreground/90">{item}</div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Regulation List */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 text-xl font-semibold">
                    <BookOpen className="h-6 w-6 text-primary" />
                    Uploaded Documents ({regulations.length})
                </div>
                <RegulationList regulations={displayRegulations} />
            </div>
        </div>
    );
}
