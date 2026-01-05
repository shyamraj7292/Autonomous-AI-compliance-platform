import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Lock, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function Login() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [credentials, setCredentials] = useState({ username: '', password: '' });

    const handleLogin = (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // Simulate network delay
        setTimeout(() => {
            if (credentials.username === 'admin' && credentials.password === 'admin') {
                localStorage.setItem('isAuthenticated', 'true');
                navigate('/');
            } else {
                setError('Invalid credentials. Try admin/admin');
                setLoading(false);
            }
        }, 1500);
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-background relative overflow-hidden">
            {/* Ambient Background */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="w-full max-w-md px-4 z-10 animate-in fade-in zoom-in duration-500">
                <div className="flex justify-center mb-8">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-primary/10 rounded-xl rounded-tl-3xl">
                            <ShieldCheck className="h-10 w-10 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">ComplianceOS</h1>
                            <p className="text-sm text-muted-foreground">Autonomous Agent Platform</p>
                        </div>
                    </div>
                </div>

                <Card className="border-muted/50 shadow-2xl backdrop-blur-sm bg-card/80">
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-xl">Welcome back</CardTitle>
                        <CardDescription>Enter your credentials to access the command center.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleLogin} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70" htmlFor="username">
                                    Username
                                </label>
                                <input
                                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                    id="username"
                                    placeholder="Enter username"
                                    value={credentials.username}
                                    onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70" htmlFor="password">
                                    Password
                                </label>
                                <div className="relative">
                                    <input
                                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                        id="password"
                                        type="password"
                                        placeholder="Enter password"
                                        value={credentials.password}
                                        onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                                    />
                                    <Lock className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                </div>
                            </div>

                            {error && (
                                <div className="text-xs text-red-500 font-medium flex items-center justify-center bg-red-500/10 p-2 rounded">
                                    {error}
                                </div>
                            )}

                            <Button className="w-full bg-primary hover:bg-primary/90 transition-all font-semibold" type="submit" disabled={loading}>
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verifying...
                                    </>
                                ) : (
                                    <>
                                        Sign In <ArrowRight className="ml-2 h-4 w-4" />
                                    </>
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                <p className="text-center text-xs text-muted-foreground mt-6">
                    Protected by Autonomous Security Agents using 2048-bit encryption.
                </p>
            </div>
        </div>
    );
}
