import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { RegulationList } from '@/components/RegulationList';
import { FileUpload } from '@/components/FileUpload';
import { Rss, BookOpen, UploadCloud } from 'lucide-react';
import { triggerScan } from '@/lib/api'; // Re-use triggerScan as a proxy for "ingest"

// Mock Data for Regulations
const MOCK_REGULATIONS = [
    { name: 'GDPR', code: 'EU-2016/679', description: 'General Data Protection Regulation', status: 'Active', lastUpdated: '2025-11-15' },
    { name: 'PCI DSS', code: 'v4.0.1', description: 'Payment Card Industry Data Security Standard', status: 'Active', lastUpdated: '2026-01-02' },
    { name: 'HIPAA', code: 'US-PL-104-191', description: 'Health Insurance Portability and Accountability Act', status: 'Analysis Pending', lastUpdated: '2024-08-20' },
];

const MOCK_NEWS = [
    "New AI Act Clause detected: Article 52 (Transparency)",
    "PCI DSS v4.0.1: New requirements for WAF logging",
    "NIST 800-53: Update to Control Family AC-2"
];

export default function Regulations() {
    const [regulations, setRegulations] = useState(MOCK_REGULATIONS);
    const [news, setNews] = useState(MOCK_NEWS);
    const [ingesting, setIngesting] = useState(false);

    const handleUpload = async (file) => {
        console.log("Uploading file:", file.name);
        setIngesting(true);

        // Simulate Agent Ingestion
        // In a real app, we'd send the file to /api/agents/ingest
        // For now, we trigger a "Scan" to wake up the agents
        try {
            await triggerScan();
            // Add a mock "Pending" regulation to the list
            setRegulations(prev => [
                ...prev,
                {
                    name: 'Internal Framework',
                    code: file.name,
                    description: 'Uploaded Company Policy Document',
                    status: 'Processing...',
                    lastUpdated: 'Just now'
                }
            ]);
        } catch (e) {
            console.error(e);
        } finally {
            setIngesting(false);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Regulatory Library</h1>
                <p className="text-muted-foreground">Manage active frameworks and ingest new policies for the Scout to analyze.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* File Upload Zone */}
                <Card className="col-span-1 lg:col-span-2 border-dashed border-2 bg-accent/20">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <UploadCloud className="h-5 w-5" /> Ingest New Framework
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <FileUpload onUpload={handleUpload} />
                    </CardContent>
                </Card>

                {/* News Ticker */}
                <Card className="col-span-1 bg-gradient-to-br from-blue-900/20 to-purple-900/20 border-none">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-blue-400">
                            <Rss className="h-5 w-5" /> Scout Discovery Feed
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
                    <BookOpen className="h-6 w-6 text-primary" /> Active Frameworks
                </div>
                <RegulationList regulations={regulations} />
            </div>
        </div>
    );
}
