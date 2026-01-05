import React, { useState } from 'react';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import { Badge } from 'lucide-react'; // Fallback if Badge UI not found, but we'll use div
import { Button } from '@/components/ui/button';
import { AlertTriangle, CheckCircle, Wand2, FileText } from 'lucide-react';

export function RiskTable({ risks, onRemediate, onGenerateEvidence }) {
    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Finding</TableHead>
                        <TableHead>Severity</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {risks.map((risk) => (
                        <RiskRow
                            key={risk.id}
                            risk={risk}
                            onRemediate={onRemediate}
                            onGenerateEvidence={onGenerateEvidence}
                        />
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}

function RiskRow({ risk, onRemediate, onGenerateEvidence }) {
    // In autonomous mode, everything comes in as 'Remediated' usually
    // But we still handle it gracefully
    const isRemediated = risk.status === 'Remediated';

    return (
        <TableRow>
            <TableCell className="font-medium">
                <div className="flex flex-col">
                    <span>{risk.title}</span>
                    <span className="text-xs text-muted-foreground">{risk.policy}</span>
                </div>
            </TableCell>
            <TableCell>
                <div className={`flex items-center gap-2 ${risk.severity === 'Critical' ? 'text-red-500 font-bold' :
                    risk.severity === 'High' ? 'text-orange-500' : 'text-yellow-500'
                    }`}>
                    <AlertTriangle className="h-4 w-4" />
                    {risk.severity}
                </div>
            </TableCell>
            <TableCell>
                {isRemediated ? (
                    <div className="flex items-center text-purple-400 gap-1 bg-purple-500/10 px-2 py-1 rounded w-fit text-xs font-semibold animate-pulse">
                        <Wand2 className="h-3 w-3" /> Auto-Remediated
                    </div>
                ) : (
                    <div className="flex items-center text-red-500 gap-1 bg-red-500/10 px-2 py-1 rounded w-fit text-xs font-semibold">
                        Open
                    </div>
                )}
            </TableCell>
            <TableCell className="text-right space-x-2">
                {isRemediated ? (
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onGenerateEvidence(risk.id)}
                    >
                        <FileText className="mr-2 h-3 w-3" /> Audit Evidence
                    </Button>
                ) : (
                    <span className="text-xs text-muted-foreground italic">Agent Analyzing...</span>
                )}
            </TableCell>
        </TableRow>
    );
}
