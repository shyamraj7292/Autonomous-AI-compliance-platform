import React, { useState } from 'react';
import { RiskTable } from '@/components/RiskTable';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileCheck, ShieldAlert } from 'lucide-react';
import { triggerScan } from '@/lib/api';

const MOCK_RISKS = [
    { id: 1, title: 'Missing Data Retention Schedule', policy: 'Data Governance Policy v1.2', severity: 'Critical', status: 'Remediated' },
    { id: 2, title: 'Unencrypted PII in Logs', policy: 'Logging Standard v2.0', severity: 'High', status: 'Remediated' },
    { id: 3, title: 'Weak Password Policy (Len < 12)', policy: 'Access Control Policy', severity: 'Medium', status: 'Remediated' },
];

export default function RiskAnalysis() {
    const [risks, setRisks] = useState(MOCK_RISKS);
    const [reportGenerated, setReportGenerated] = useState(false);

    const handleRemediate = async (id) => {
        console.log(`Auto-Remediating Risk ${id}...`);
        await new Promise(r => setTimeout(r, 2000)); // Mock API delay
        // In real app: call /api/agents/fix
    };

    const handleGenerateEvidence = async (id) => {
        console.log(`Generating Evidence for Risk ${id}...`);
        // In real app: call /api/agents/evidence
    };

    const handleFullReport = async () => {
        setReportGenerated(true);
        try {
            const response = await fetch('http://localhost:8000/api/agents/report', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(risks.filter(r => r.status === 'Open')) // Only report open risks
            });
            const data = await response.json();
            alert(`Compliance Report Generated: ${data.report_url}`);
        } catch (error) {
            console.error("Report generation failed:", error);
            alert("Failed to generate report. Check backend connection.");
        } finally {
            setReportGenerated(false);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Risk Analysis</h1>
                    <p className="text-muted-foreground">Review gaps detected by the Analyst and trigger auto-remediation.</p>
                </div>
                <Button onClick={handleFullReport} disabled={reportGenerated} className="bg-green-600 hover:bg-green-500">
                    <FileCheck className="mr-2 h-4 w-4" />
                    {reportGenerated ? "Generating PDF..." : "Generate Full Audit Report"}
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="md:col-span-3">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <ShieldAlert className="h-5 w-5 text-destructive" /> Active Findings
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <RiskTable
                            risks={risks}
                            onRemediate={handleRemediate}
                            onGenerateEvidence={handleGenerateEvidence}
                        />
                    </CardContent>
                </Card>

                <Card className="md:col-span-1 h-fit">
                    <CardHeader>
                        <CardTitle className="text-sm">Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Critical</span>
                            <span className="font-bold text-red-500">1</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">High</span>
                            <span className="font-bold text-orange-500">1</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Medium</span>
                            <span className="font-bold text-yellow-500">1</span>
                        </div>
                        <div className="pt-4 border-t">
                            <div className="text-xs text-muted-foreground">
                                All findings are grounded in GDPR & PCI-DSS regulations via RAG.
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
