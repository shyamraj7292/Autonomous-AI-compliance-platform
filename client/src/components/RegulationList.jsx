import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from 'lucide-react'; // Using lucide icon as mock badge or just use div

export function RegulationList({ regulations }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {regulations.map((reg, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow border-t-4 border-t-blue-500 bg-card">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            {reg.name}
                        </CardTitle>
                        <div className={`px-2 py-1 rounded text-xs font-semibold ${reg.status === 'Active' ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'
                            }`}>
                            {reg.status}
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{reg.code}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {reg.description}
                        </p>
                        <div className="mt-4 text-xs text-muted-foreground flex gap-2">
                            <span>Last Updated: {reg.lastUpdated}</span>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
